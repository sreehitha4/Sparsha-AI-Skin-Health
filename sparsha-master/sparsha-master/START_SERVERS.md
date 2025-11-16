# How to Start the Application

## Important: Run from the Correct Directory!

The backend and frontend need to be run from different directories.

## Step 1: Start the Backend (FastAPI)

**Open Terminal 1** and navigate to the `crisisspot` directory:

```bash
cd C:\Users\Navya\crisisspot\crisisspot
```

Then start the backend server:

```bash
uvicorn main:app --reload
```

The backend will run on `http://127.0.0.1:8000`

## Step 2: Start the Frontend (React)

**Open Terminal 2** and navigate to the `frontend` directory:

```bash
cd C:\Users\Navya\crisisspot\crisisspot\frontend
```

Then start the frontend development server:

```bash
npm install  # Only needed the first time
npm run dev
```

The frontend will run on `http://localhost:3000`

## Quick Summary

- **Backend**: Run `uvicorn main:app --reload` from `crisisspot/` directory
- **Frontend**: Run `npm run dev` from `crisisspot/frontend/` directory

## Troubleshooting

If you get "Could not import module 'main'":
- Make sure you're in the `crisisspot` directory (where `main.py` is located)
- Not in the `frontend` directory

If you get port already in use errors:
- Backend default port: 8000
- Frontend default port: 3000
- Change ports in `vite.config.js` (frontend) or `main.py` (backend) if needed

