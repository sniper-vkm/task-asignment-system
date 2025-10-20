# Project & Task Management System

This is a MERN stack sample project with Gemini AI integration for task summarization and Q&A.

Folders:
- `server/` - Express backend with MongoDB models and AI endpoints
- `client/` - React frontend (Vite) with Kanban board and drag-and-drop

See `server/.env.example` for required environment variables.

How to run (PowerShell):

1. Install server deps:
```powershell
cd server; npm install
```
2. Install client deps:
```powershell
cd client; npm install
```
3. Start MongoDB (local or provide MONGO_URI in env)
4. Run server and client (in separate terminals):
```powershell
cd server; npm run dev
cd client; npm run dev
```

Gemini AI: The server includes a stub for calling Gemini. Set `GEMINI_API_KEY` in `server/.env` to enable real calls.
