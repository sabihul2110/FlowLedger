# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app import models
from app.auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    upi: Optional[str] = None
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    upi: Optional[str] = ""
    phone: Optional[str] = ""

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=req.name,
        email=req.email,
        hashed_password=hash_password(req.password),
        upi=req.upi,
        phone=req.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "upi": user.upi or "",
        "phone": user.phone or "",
    }

@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "upi": user.upi or "",
        "phone": user.phone or "",
    }

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "upi": current_user.upi,
        "phone": current_user.phone,
    }

@router.delete("/delete-account")
def delete_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Delete all user data
    db.query(models.Loan).filter(models.Loan.user_id == current_user.id).delete()
    db.query(models.Expense).filter(models.Expense.user_id == current_user.id).delete()
    db.query(models.Friend).filter(models.Friend.user_id == current_user.id).delete()
    db.query(models.User).filter(models.User.id == current_user.id).delete()
    db.commit()
    return {"message": "Account deleted"}