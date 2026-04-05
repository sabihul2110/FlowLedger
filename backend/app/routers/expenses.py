# backend/app/routers/expenses.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth_utils import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("/", response_model=schemas.ExpenseOut)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from datetime import datetime, timezone
    data = expense.model_dump()
    if data.get('date'):
        try:
            created = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except Exception:
            created = datetime.now(timezone.utc)
    else:
        created = datetime.now(timezone.utc)

    db_exp = models.Expense(
        user_id=user.id,
        title=data['title'],
        amount=data['amount'],
        category=data['category'],
        note=data.get('note'),
        created_at=created,
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.get("/", response_model=list[schemas.ExpenseOut])
def get_expenses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Expense).filter(models.Expense.user_id == user.id).order_by(models.Expense.created_at.desc()).all()

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    exp = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.user_id == user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()
    return {"message": "Deleted"}