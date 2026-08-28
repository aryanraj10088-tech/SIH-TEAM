# SrijanSetu Gen AI Platform

Phase 1 MVP - Foundation

## Architecture
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript + MongoDB
- AI Service: Python FastAPI (`ai-service/`)
- Worker: (Planned)

## Requirements
- Node.js >= 18
- Docker Desktop (for MongoDB)

## Running the project
1. Start MongoDB via Docker: `docker-compose up -d`
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev`
4. AI service: `cd ai-service && .\.venv\Scripts\Activate.ps1 && python -m uvicorn api:app --host 127.0.0.1 --port 8000`

The backend owns authentication, projects, and private source storage. The AI service owns
document extraction, sanitization, RAG, generation, and citation validation. When a user
requests generation for a PDF source, the backend verifies project ownership and sends the
AI service a short-lived S3 download URL. The AI service never receives database credentials
or storage credentials.

## Phase 1 Implementation Details
- Established project scaffolding
- Implemented secure Express application with rate-limiting, CORS, Helmet
- Implemented MongoDB connection with Mongoose
- Created User model with `Operator`, `Reviewer`, `Administrator`, `Viewer` roles
- Implemented JWT cookie-based authentication
- Implemented Login and Dashboard shell components in React
