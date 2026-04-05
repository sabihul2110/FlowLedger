# backend/app/main.py

from fastapi import FastAPI
from app.database import Base, engine
from app.routers import users, loans, expenses, friends, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FlowLedger API", version="1.0.0")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(loans.router)
app.include_router(expenses.router)
app.include_router(friends.router)

@app.get("/")
def root():
    return {"status": "FlowLedger API running"}