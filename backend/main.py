from fastapi import FastAPI
from app.api.endpoints import users
from app.database import Base, engine
from app.models import users as user_models

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/")
def read_root():
    return {"msg": "FastAPI backend is working"}

