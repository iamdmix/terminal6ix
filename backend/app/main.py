from contextlib import asynccontextmanager
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import events as events_router
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


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
