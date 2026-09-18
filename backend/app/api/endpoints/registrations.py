from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import Challenge, Event, EventRegistration, Submission, User
from app.schemas.registration import LeaderboardEntry, RegistrationOut

router = APIRouter()


@router.post(
    "/{event_id}/register",
    response_model=RegistrationOut,
    status_code=status.HTTP_201_CREATED,
)
def register_for_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Register the current user for an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.end_time < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Event has already ended")

    existing = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already registered for this event")

    registration = EventRegistration(event_id=event_id, user_id=user.id)
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


@router.delete("/{event_id}/register", status_code=status.HTTP_204_NO_CONTENT)
def unregister_from_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remove the current user's registration for an event."""
    registration = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
        )
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Not registered for this event")

    db.delete(registration)
    db.commit()
    return None


@router.get("/{event_id}/registrations", response_model=list[RegistrationOut])
def list_registrations(
    event_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all registrations for an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return (
        db.query(EventRegistration)
        .filter(EventRegistration.event_id == event_id)
        .order_by(EventRegistration.registered_at.asc())
        .all()
    )


@router.get("/{event_id}/leaderboard", response_model=list[LeaderboardEntry])
def event_leaderboard(
    event_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Dynamic leaderboard: total points per user for this event, ties broken by earliest last solve."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    rows = (
        db.query(
            User.id.label("user_id"),
            User.name.label("user_name"),
            func.coalesce(func.sum(Submission.points_awarded), 0).label("score"),
            func.count(Submission.id).label("solved_count"),
            func.max(Submission.submitted_at).label("last_solve_at"),
        )
        .join(Submission, Submission.user_id == User.id)
        .join(EventRegistration, EventRegistration.user_id == User.id)
        .filter(
            Submission.challenge_id.in_(
                db.query(Challenge.id).filter(Challenge.event_id == event_id)
            ),
            Submission.is_correct.is_(True),
            EventRegistration.event_id == event_id,
        )
        .group_by(User.id, User.name)
        .order_by(
            func.coalesce(func.sum(Submission.points_awarded), 0).desc(),
            func.max(Submission.submitted_at).asc(),
        )
        .all()
    )

    return [
        LeaderboardEntry(
            rank=idx + 1,
            user_id=row.user_id,
            user_name=row.user_name,
            score=int(row.score),
            solved_count=int(row.solved_count),
            last_solve_at=row.last_solve_at,
        )
        for idx, row in enumerate(rows)
    ]
