# backend/app/routers/loans.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/loans", tags=["Loans"])

@router.post("/", response_model=schemas.LoanOut)
def create_loan(loan: schemas.LoanCreate, db: Session = Depends(get_db)):
    db_loan = models.Loan(**loan.model_dump())
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan

@router.get("/", response_model=list[schemas.LoanOut])
def get_loans(db: Session = Depends(get_db)):
    return db.query(models.Loan).order_by(models.Loan.created_at.desc()).all()

@router.patch("/{loan_id}/settle", response_model=schemas.LoanOut)
def settle_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    loan.status = "settled"
    db.commit()
    db.refresh(loan)
    return loan

@router.patch("/{loan_id}/pay", response_model=schemas.LoanOut)
def partial_pay(loan_id: int, amount: float, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    loan.paid = (loan.paid or 0) + amount
    if loan.amount - loan.paid <= 0:
        loan.status = "settled"
    db.commit()
    db.refresh(loan)
    return loan

@router.delete("/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
    return {"message": "Deleted"}