# FlowLedger

A minimal offline-first expense + loan tracking mobile app.

**Stack:** React Native (Expo) · FastAPI · SQLite

---

## Project Structure

flowledger/
    backend/        # FastAPI + SQLite server
    frontend/       # React Native (Expo) app
    README.md

---

## Running the Project

### Prerequisites
- Node.js v18+
- Python 3.10+
- Expo Go app on your phone

---

### Backend
```bash
cd flowledger/backend

# Activate virtual environment (do this every time)
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

# Start server (accessible on local network)
uvicorn app.main:app --reload --host 0.0.0.0

# Server runs at http://YOUR_MAC_IP:8000
# Swagger docs at http://YOUR_MAC_IP:8000/docs
```

**Find your Mac IP:**
```bash
ipconfig getifaddr en0
```

Update this IP in:
- `frontend/src/screens/LoginScreen.js` → `BASE_URL`
- `frontend/src/screens/RegisterScreen.js` → `BASE_URL`

---

### Frontend
```bash
cd flowledger/frontend

# Start Expo (same WiFi as phone)
npx expo start

# If phone and Mac are on different networks:
npx expo start --tunnel
```

Scan the QR code with **Expo Go** (Android) or Camera app (iOS).

---

### Git
```bash
# Status
git status

# Add + commit + push (alias set up)
git acp "your message"

# Or manually
git add .
git commit -m "your message"
git push
```

---

## Key Commands Reference

| Task | Command |
|---|---|
| Start backend | `source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0` |
| Start frontend | `npx expo start` |
| Frontend (tunnel) | `npx expo start --tunnel` |
| Push to GitHub | `git acp "message"` |
| Generate app icon | `node scripts/generate-assets.js` |
| View API docs | `http://YOUR_IP:8000/docs` |

---

## Features

- **Loans** — lend/borrow tracking, partial payments, UPI deep links
- **Expenses** — category tracking, month filter, date picker
- **Friends** — UPI pay, loan balance sync, remind
- **Insights** — monthly summary, category breakdown
- **Profile** — export/import JSON, clear data, delete account
- **Auth** — JWT login/register, 7-day token, offline fallback

---

## Notes

- Backend must be running and on same WiFi for API sync
- App works offline using AsyncStorage as fallback
- DB file: `backend/flowledger.db` (auto-created on first run)
- Never commit `venv/` or `flowledger.db` (already in .gitignore)