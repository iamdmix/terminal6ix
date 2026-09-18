from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_organiser
from app.database import get_db
from app.models import Challenge, Event, EventRegistration, Submission, User
from app.models.challenge import ChallengeCategory, ChallengeDifficulty
from app.schemas.challenge import (
    ChallengeAdminOut,
    ChallengeCreate,
    ChallengeOut,
    ChallengeUpdate,
)
from app.schemas.submission import SubmissionCreate, SubmissionOut

router = APIRouter()


def _get_event_or_404(db: Session, event_id: UUID) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


def _get_challenge_or_404(db: Session, challenge_id: UUID) -> Challenge:
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


# ---------------------------------------------------------------------------
# Challenge CRUD (organiser manages, participants read)
# ---------------------------------------------------------------------------


@router.get(
    "/events/{event_id}/challenges",
    response_model=list[ChallengeOut],
    dependencies=[Depends(get_current_user)],
)
def list_event_challenges(
    event_id: UUID,
    category: ChallengeCategory | None = None,
    difficulty: ChallengeDifficulty | None = None,
    db: Session = Depends(get_db),
):
    """List active challenges for an event, with optional category/difficulty filters."""
    _get_event_or_404(db, event_id)
    query = db.query(Challenge).filter(
        Challenge.event_id == event_id, Challenge.is_active.is_(True)
    )
    if category is not None:
        query = query.filter(Challenge.category == category)
    if difficulty is not None:
        query = query.filter(Challenge.difficulty == difficulty)
    return query.order_by(Challenge.points.asc(), Challenge.created_at.asc()).all()


@router.get(
    "/events/{event_id}/challenges/all",
    response_model=list[ChallengeAdminOut],
)
def list_all_event_challenges(
    event_id: UUID,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Organiser view: all challenges including inactive ones, with flags."""
    event = _get_event_or_404(db, event_id)
    if event.created_by != organiser.id:
        raise HTTPException(status_code=403, detail="You can only manage your own events")
    return (
        db.query(Challenge)
        .filter(Challenge.event_id == event_id)
        .order_by(Challenge.created_at.asc())
        .all()
    )


@router.get(
    "/events/{event_id}/challenges/{challenge_id}",
    response_model=ChallengeOut,
)
def get_event_challenge(
    event_id: UUID,
    challenge_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single challenge. Requires event registration while the event is ongoing."""
    _get_event_or_404(db, event_id)
    challenge = _get_challenge_or_404(db, challenge_id)
    if challenge.event_id != event_id:
        raise HTTPException(status_code=404, detail="Challenge not found in this event")
    if challenge.event.created_by != user.id:
        registration = (
            db.query(EventRegistration)
            .filter(
                EventRegistration.event_id == event_id,
                EventRegistration.user_id == user.id,
            )
            .first()
        )
        if not registration:
            raise HTTPException(
                status_code=403, detail="You must register for this event first"
            )
    return challenge


@router.post(
    "/events/{event_id}/challenges",
    response_model=ChallengeAdminOut,
    status_code=status.HTTP_201_CREATED,
)
def create_challenge(
    event_id: UUID,
    data: ChallengeCreate,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Create a challenge in an event you own."""
    event = _get_event_or_404(db, event_id)
    if event.created_by != organiser.id:
        raise HTTPException(status_code=403, detail="You can only manage your own events")

    duplicate = (
        db.query(Challenge)
        .filter(Challenge.event_id == event_id, Challenge.title == data.title)
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409, detail="A challenge with this title already exists in the event"
        )

    challenge = Challenge(**data.model_dump(), event_id=event_id)
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.put(
    "/events/{event_id}/challenges/{challenge_id}",
    response_model=ChallengeAdminOut,
)
def update_challenge(
    event_id: UUID,
    challenge_id: UUID,
    data: ChallengeUpdate,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Update a challenge you own."""
    event = _get_event_or_404(db, event_id)
    if event.created_by != organiser.id:
        raise HTTPException(status_code=403, detail="You can only manage your own events")
    challenge = _get_challenge_or_404(db, challenge_id)
    if challenge.event_id != event_id:
        raise HTTPException(status_code=404, detail="Challenge not found in this event")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(challenge, field, value)

    db.commit()
    db.refresh(challenge)
    return challenge


@router.delete(
    "/events/{event_id}/challenges/{challenge_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_challenge(
    event_id: UUID,
    challenge_id: UUID,
    db: Session = Depends(get_db),
    organiser: User = Depends(require_organiser),
):
    """Delete a challenge you own."""
    event = _get_event_or_404(db, event_id)
    if event.created_by != organiser.id:
        raise HTTPException(status_code=403, detail="You can only manage your own events")
    challenge = _get_challenge_or_404(db, challenge_id)
    if challenge.event_id != event_id:
        raise HTTPException(status_code=404, detail="Challenge not found in this event")

    db.delete(challenge)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Submissions (flag checking + scoring)
# ---------------------------------------------------------------------------


@router.post(
    "/challenges/{challenge_id}/submit",
    response_model=SubmissionOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_flag(
    challenge_id: UUID,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Submit a flag for a challenge. Records every attempt; awards points on first correct solve."""
    challenge = _get_challenge_or_404(db, challenge_id)
    if not challenge.is_active:
        raise HTTPException(status_code=400, detail="This challenge is no longer active")

    event = challenge.event
    now = datetime.utcnow()

    # Organiser bypasses checks for testing; participants must be registered and within the window.
    if event.created_by != user.id:
        registration = (
            db.query(EventRegistration)
            .filter(
                EventRegistration.event_id == event.id,
                EventRegistration.user_id == user.id,
            )
            .first()
        )
        if not registration:
            raise HTTPException(
                status_code=403, detail="You must register for this event first"
            )
        if now < event.start_time:
            raise HTTPException(status_code=400, detail="Event has not started yet")
        if now > event.end_time:
            raise HTTPException(status_code=400, detail="Event has ended")

    already_solved = (
        db.query(Submission)
        .filter(
            Submission.challenge_id == challenge_id,
            Submission.user_id == user.id,
            Submission.is_correct.is_(True),
        )
        .first()
    )
    if already_solved:
        raise HTTPException(status_code=409, detail="You already solved this challenge")

    is_correct = data.flag.strip() == challenge.flag.strip()
    submission = Submission(
        challenge_id=challenge_id,
        user_id=user.id,
        submitted_flag=data.flag,
        is_correct=is_correct,
        points_awarded=challenge.points if is_correct else 0,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get(
    "/challenges/{challenge_id}/submissions",
    response_model=list[SubmissionOut],
)
def list_challenge_submissions(
    challenge_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List the current user's submissions for a challenge."""
    challenge = _get_challenge_or_404(db, challenge_id)
    return (
        db.query(Submission)
        .filter(Submission.challenge_id == challenge.id, Submission.user_id == user.id)
        .order_by(Submission.submitted_at.desc())
        .all()
    )
