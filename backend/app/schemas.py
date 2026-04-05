# backend/app/schemas.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- User ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    upi: Optional[str] = None
    phone: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    upi: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- Loan ---
class LoanCreate(BaseModel):
    name: str
    amount: float
    note: Optional[str] = None
    upi: Optional[str] = None
    type: str
    paid: Optional[float] = 0.0

class LoanOut(LoanCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Expense ---

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    note: Optional[str] = None
    date: Optional[str] = None  # ISO string e.g. "2026-04-05"

class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    note: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- Friend ---
class FriendCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    upi: Optional[str] = None

class FriendOut(FriendCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True