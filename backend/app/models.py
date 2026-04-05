# backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
import enum

class LoanType(str, enum.Enum):
    lent = "lent"
    borrowed = "borrowed"

class LoanStatus(str, enum.Enum):
    pending = "pending"
    settled = "settled"

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    upi             = Column(String, nullable=True)
    phone           = Column(String, nullable=True)
    created_at      = Column(DateTime, server_default=func.now())

class Loan(Base):
    __tablename__ = "loans"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    amount     = Column(Float, nullable=False)
    paid       = Column(Float, default=0.0)
    note       = Column(String, nullable=True)
    upi        = Column(String, nullable=True)
    type       = Column(Enum(LoanType), nullable=False)
    status     = Column(Enum(LoanStatus), default=LoanStatus.pending)
    created_at = Column(DateTime, server_default=func.now())

class Expense(Base):
    __tablename__ = "expenses"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String, nullable=False)
    amount     = Column(Float, nullable=False)
    category   = Column(String, nullable=False)
    note       = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Friend(Base):
    __tablename__ = "friends"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    phone      = Column(String, nullable=True)
    upi        = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())