# backend/app/routers/friends.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth_utils import get_current_user

router = APIRouter(prefix="/friends", tags=["Friends"])

@router.post("/", response_model=schemas.FriendOut)
def add_friend(friend: schemas.FriendCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db_friend = models.Friend(**friend.model_dump(), user_id=user.id)
    db.add(db_friend)
    db.commit()
    db.refresh(db_friend)
    return db_friend

@router.get("/", response_model=list[schemas.FriendOut])
def get_friends(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Friend).filter(models.Friend.user_id == user.id).order_by(models.Friend.created_at.desc()).all()

@router.delete("/{friend_id}")
def delete_friend(friend_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    friend = db.query(models.Friend).filter(models.Friend.id == friend_id, models.Friend.user_id == user.id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    db.delete(friend)
    db.commit()
    return {"message": "Deleted"}