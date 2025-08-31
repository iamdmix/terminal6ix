from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import users as auth_router
from app.api.endpoints import events as events_router
from app.database import Base, engine

# This creates tables on startup (for development only)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TerminalSix API",
    description="Backend for the TerminalSix CTF Platform."
)

# Set up CORS
origins = ["http://localhost:3000"] # Your Next.js frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount your routers
app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
app.include_router(events_router.router, prefix="/events", tags=["Events"]) # Add this line
