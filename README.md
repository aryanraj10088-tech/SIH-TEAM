# SrijanSetu Gen AI Platform

## The Problem
Government and critical infrastructure organizations receive complex source documents (like security advisories, policy drafts, or technical reports) and must quickly translate them into multiple targeted formats for different stakeholders (executives, social media, press, operations). Doing this manually is time-consuming, prone to human error, and delays critical information sharing.

## The Solution: SrijanSetu
SrijanSetu is a secure, automated Generation AI Platform. It transforms a single source document into multiple specialized formats with **one click**, ensuring 100% data grounding and consistency across all deliverables.

## Supported Outputs
1. **Executive Summary** (For C-Suite Decision Makers)
2. **Advisory** (For Operations & Security Teams)
3. **LinkedIn Post** (For Professional Networking)
4. **X/Twitter Thread** (For Public Announcements)
5. **Video Script** (For Media / Press)
6. **Presentation** (For Briefings)
7. **Infographic Specification** (For Visual Reports)

## Key Features
- **One-Click Multi-Format Generation:** Select any combination of the 7 formats and generate them simultaneously.
- **Strict Grounding:** The AI pipeline uses Retrieval-Augmented Generation (RAG) to ensure no hallucinations occur. Every claim is traced back to the source.
- **Role-Based Access Control (RBAC):** Distinct roles (Operator, Reviewer, Administrator) ensure proper workflow governance.
- **Security First:** IDOR protection, prompt-injection defenses (XML fencing), strict rate limiting, and comprehensive audit logging.
- **Provider Abstraction:** The AI Service abstracts LLM interactions, handling partial failures and rate-limiting (bounded concurrency) seamlessly.

## Architecture
```text
User 
  ↓ (React, Vite, Tailwind)
Frontend
  ↓ (Node.js, Express, JWT, Zod)
Backend API
  ↓
AI Service (Python, FastAPI, Pydantic, asyncio)
  ↓
LLM Provider (Groq / OpenAI)
```
*Data is persisted securely in MongoDB Atlas.*

## Setup & Running Locally

**Prerequisites:** Node.js >= 18, Python >= 3.10, MongoDB

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **AI Service**
   ```bash
   cd ai-service
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1  # (Windows)
   pip install -r requirements.txt
   python -m uvicorn api:app --host 127.0.0.1 --port 8000
   ```

## Production Deployment
The application is deployed with:
- **Frontend:** Render / Vercel (Static Build)
- **Backend:** Node.js on Render/Heroku (HTTPS, configured CORS)
- **Database:** MongoDB Atlas (IP whitelisted)
- **AI Service:** Python FastAPI (Secure internal network or API key protected)

## Multi-output Generation Workflow
1. Upload a PDF/TXT source document in your Project.
2. Click **Configure**, select the desired output formats (e.g., Summary, Advisory, Video).
3. Click **Generate Outputs**. The backend orchestrates a single request to the AI Service, which bounds concurrent LLM calls to prevent rate-limiting, and returns all successful outputs instantly.
