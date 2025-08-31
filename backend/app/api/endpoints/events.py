from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models import Event, User
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app.api.deps import get_current_user, require_organiser

router = APIRouter()

@router.get("/", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    List all events. Requires any logged-in user.
    """
    events = db.query(Event).order_by(Event.start_time.asc()).all()
    return events

@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Get a single event by its ID. Requires any logged-in user.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """
    Create a new event. Only accessible by users with the 'organiser' role.
    """
    event = Event(**data.model_dump(), created_by=organiser.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: UUID,
    data: EventUpdate,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """
    Update an event. Only accessible by the 'organiser' who created it.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != organiser.id:
        raise HTTPException(status_code=403, detail="Operation not permitted: You can only modify your own events")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """
    Delete an event. Only accessible by the 'organiser' who created it.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != organiser.id:
        raise HTTPException(status_code=403, detail="Operation not permitted: You can only delete your own events")

    db.delete(event)
    db.commit()
    return None
