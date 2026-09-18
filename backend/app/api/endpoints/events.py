from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_organiser
from app.database import get_db
from app.models import Challenge, Event, EventRegistration, User
from app.schemas.event import EventCreate, EventDetailOut, EventOut, EventUpdate

router = APIRouter()


def _enrich_event(db: Session, event: Event, user: User | None) -> EventDetailOut:
    """Attach live counters so the frontend can render dynamically."""
    challenge_count = (
        db.query(func.count(Challenge.id))
        .filter(Challenge.event_id == event.id, Challenge.is_active.is_(True))
        .scalar()
        or 0
    )
    total_points = (
        db.query(func.coalesce(func.sum(Challenge.points), 0)).filter(
            Challenge.event_id == event.id, Challenge.is_active.is_(True)
        )
        .scalar()
        or 0
    )
    participant_count = (
        db.query(func.count(EventRegistration.id))
        .filter(EventRegistration.event_id == event.id)
        .scalar()
        or 0
    )
    is_registered = False
    if user is not None:
        is_registered = (
            db.query(EventRegistration)
            .filter(
                EventRegistration.event_id == event.id,
                EventRegistration.user_id == user.id,
            )
            .count()
            > 0
        )
    now = datetime.utcnow()

    return EventDetailOut(
        id=event.id,
        name=event.name,
        description=event.description,
        start_time=event.start_time,
        end_time=event.end_time,
        flag_format=event.flag_format,
        created_by=event.created_by,
        created_at=event.created_at,
        updated_at=event.updated_at,
        challenge_count=int(challenge_count),
        total_points=int(total_points),
        participant_count=int(participant_count),
        is_registered=is_registered,
        is_ongoing=event.start_time <= now <= event.end_time,
    )


@router.get("/", response_model=list[EventDetailOut])
def list_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all events with live counters. Requires any logged-in user."""
    events = db.query(Event).order_by(Event.start_time.asc()).all()
    return [_enrich_event(db, event, user) for event in events]


@router.get("/me", response_model=list[EventDetailOut])
def list_my_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List events the current user is registered for."""
    events = (
        db.query(Event)
        .join(EventRegistration, EventRegistration.event_id == Event.id)
        .filter(EventRegistration.user_id == user.id)
        .order_by(Event.start_time.asc())
        .all()
    )
    return [_enrich_event(db, event, user) for event in events]


@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single event with live counters."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return _enrich_event(db, event, user)


@router.post("/", response_model=EventDetailOut, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Create a new event. Only accessible by users with the 'organiser' role."""
    if data.end_time <= data.start_time:
        raise HTTPException(status_code=422, detail="end_time must be after start_time")
    event = Event(**data.model_dump(), created_by=organiser.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return _enrich_event(db, event, organiser)


@router.put("/{event_id}", response_model=EventDetailOut)
def update_event(
    event_id: UUID,
    data: EventUpdate,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Update an event. Only accessible by the 'organiser' who created it."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != organiser.id:
        raise HTTPException(
            status_code=403,
            detail="Operation not permitted: You can only modify your own events",
        )

    updates = data.model_dump(exclude_unset=True)
    start = updates.get("start_time", event.start_time)
    end = updates.get("end_time", event.end_time)
    if end <= start:
        raise HTTPException(status_code=422, detail="end_time must be after start_time")

    for field, value in updates.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return _enrich_event(db, event, organiser)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Delete an event. Only accessible by the 'organiser' who created it."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != organiser.id:
        raise HTTPException(
            status_code=403,
            detail="Operation not permitted: You can only delete your own events",
        )

    db.delete(event)
    db.commit()
    return None
