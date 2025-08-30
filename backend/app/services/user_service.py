from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth_service import hash_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    if get_user_by_email(db, user_in.email):
        return None  # handle duplicate
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
