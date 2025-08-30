from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.services import user_service, auth_service
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter()

@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = user_service.create_user(db, user_in)
    if not user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user

@router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, user_in.email)
    if not user or not auth_service.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth_service.create_access_token({"sub": str(user.id), "role": user.role}, user.role)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
