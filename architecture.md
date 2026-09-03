# SrijanSetu Architecture Overview

*Target: SIH Technical Evaluation*

## System Architecture

The platform utilizes a modern, decoupled three-tier architecture ensuring scalability, security, and separation of concerns.

```text
       [ User Browser ]
              ↓ (HTTPS / REST)
       [ React Frontend ]
              ↓ (Axios / JWT / CORS)
    [ Node/Express Backend ] ←→ [ MongoDB Atlas ]
              ↓ (Internal API)
      [ Python AI Service ]
              ↓ (Async HTTP)
        [ LLM Provider ]
```

### 1. Frontend (React + Vite + TailwindCSS)
- **Responsibilities:** User interface, state management, document uploading, and rich text/output editing.
- **Key Flow:** Uses `axios` with `withCredentials: true` to transmit HTTP-Only JWT cookies safely.

### 2. Backend (Node.js + Express)
- **Responsibilities:** Authentication, RBAC, Database orchestration, API validation, and File handling.
- **Key Flow:** 
  - Validates inputs via `zod`.
  - Enforces Role-Based Access Control (Operator, Reviewer, Admin).
  - Handles Document Storage (Multer / AWS S3 abstraction).
  - Routes complex AI generation jobs to the Python AI service.

### 3. AI Service (Python + FastAPI)
- **Responsibilities:** RAG chunking, LLM provider abstraction, multi-format orchestration, and schema enforcement.
- **Key Flow:** 
  - Extracts text and splits it into manageable RAG chunks.
  - Utilizes `asyncio.Semaphore` to bound concurrent requests to the LLM (preventing `429 Too Many Requests`).
  - Employs strict Pydantic schemas to force the LLM to output valid JSON for the 7 supported formats.
  - Returns partial successes gracefully if one format times out.

### 4. Database (MongoDB)
- **Models:** `User`, `Project`, `Source`, `GeneratedOutput`, `AuditLog`, `Notification`.
- **Security:** Queries strictly enforce `ownerId` to prevent Insecure Direct Object Reference (IDOR).
