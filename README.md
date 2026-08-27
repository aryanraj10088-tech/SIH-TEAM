# SrijanSetu Gen AI Platform

Phase 1 MVP - Foundation

## Architecture
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript + MongoDB
- AI Service: Python (Planned)
- Worker: (Planned)

## Requirements
- Node.js >= 18
- Docker Desktop (for MongoDB)

## Running the project
1. Start MongoDB via Docker: `docker-compose up -d`
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev`

## Phase 1 Implementation Details
- Established project scaffolding
- Implemented secure Express application with rate-limiting, CORS, Helmet
- Implemented MongoDB connection with Mongoose
- Created User model with `Operator`, `Reviewer`, `Administrator`, `Viewer` roles
- Implemented JWT cookie-based authentication
- Implemented Login and Dashboard shell components in React
