from fastapi import FastAPI
from app.database import engine, Base
from app.models import user
from app.api.endpoints import users

app = FastAPI()

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(users.router, prefix="/auth", tags=["auth"])
