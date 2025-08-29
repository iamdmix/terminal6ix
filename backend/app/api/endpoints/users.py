from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter()

@router.post("/create", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/list", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from datetime import timedelta
# from app.database import SessionLocal
# from app.models.user import User, RoleEnum
# from app.schemas.user import UserCreate, UserRead
# from app.services.user_service import hash_password, verify_password
# from app.services.auth_service import create_access_token

# router = APIRouter()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/", response_model=UserRead)
# def register_user(user: UserCreate, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.email == user.email).first()
#     if db_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     hashed_pw = hash_password(user.password)
#     new_user = User(
#         username=user.username,
#         email=user.email,
#         password_hash=hashed_pw,
#         role=user.role,
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# @router.post("/token")
# def login(email: str, password: str, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == email).first()
#     if not user or not verify_password(password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     # Role-based expiry
#     if user.role == RoleEnum.PLAYER:
#         expires = timedelta(hours=8)
#     else:
#         expires = timedelta(days=7)

#     token = create_access_token({"sub": str(user.id), "role": user.role}, expires)
#     return {"access_token": token, "token_type": "bearer"}
