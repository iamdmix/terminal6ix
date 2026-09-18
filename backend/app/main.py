from contextlib import asynccontextmanager
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import challenges as challenges_router
from app.api.endpoints import events as events_router
from app.api.endpoints import registrations as registrations_router
from app.api.endpoints import users as auth_router
from app.database import Base, engine

load_dotenv()

# This creates tables on startup (for development only)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="TerminalSix API",
    description="Backend for the TerminalSix CTF Platform.",
    lifespan=lifespan,
)

# Set up CORS
origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount your routers
app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
app.include_router(events_router.router, prefix="/events", tags=["Events"])
app.include_router(registrations_router.router, prefix="/events", tags=["Registrations & Leaderboard"])
app.include_router(challenges_router.router, tags=["Challenges & Submissions"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.get("/stats", tags=["Health"])
def platform_stats():
    """Public, live platform counters for the landing/community pages."""
    from sqlalchemy import func

    from app.database import SessionLocal
    from app.models import Challenge, Event, Submission, User

    db = SessionLocal()
    try:
        return {
            "users": db.query(func.count(User.id)).scalar() or 0,
            "events": db.query(func.count(Event.id)).scalar() or 0,
            "challenges": db.query(func.count(Challenge.id)).scalar() or 0,
            "flags_captured": (
                db.query(func.count(Submission.id))
                .filter(Submission.is_correct.is_(True))
                .scalar()
                or 0
            ),
        }
    finally:
        db.close()
