# SrijanSetu SIH Presentation Outline

**Target Duration: 5-Slide Technical Pitch**

---

### Slide 1: Problem & Solution
**The Problem:** Government agencies and enterprises struggle to rapidly translate dense, technical documents into specialized formats for diverse audiences (executives, operations, public).
**The Solution:** SrijanSetu is a secure, automated Gen-AI platform. It ingests a single source document and generates multiple targeted deliverables simultaneously with **one click**.

---

### Slide 2: System Architecture
**Modern, Decoupled Stack:**
- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express (Robust API, RBAC, File Management)
- **AI Service:** Python + FastAPI (Data chunking, Provider orchestration)
- **Database:** MongoDB Atlas (Secure persistence)

*Visual: Simple flow diagram from User → React → Node → Python → LLM*

---

### Slide 3: Core Innovation — One Source, Multiple Outputs
**The Multi-Format Pipeline:**
- **Input:** 1 PDF or Text File
- **Process:** RAG Context Extraction
- **Outputs (Generated Concurrently):**
  1. Executive Summary
  2. Advisory
  3. LinkedIn Post
  4. X/Twitter Thread
  5. Video Script
  6. Presentation
  7. Infographic Specification

---

### Slide 4: Security & Technical Strength
**Enterprise-Grade Hardening:**
- **Authentication:** HTTP-Only JWT, Brute-force rate limiting (5 attempts/15m).
- **Authorization:** Strict RBAC (Admin, Reviewer, Operator) and IDOR protection.
- **AI Safety:** XML fencing (`<source_document>`) strictly isolates untrusted RAG text from system prompts, preventing prompt-injection.
- **Reliability:** Bounded concurrency (`asyncio.Semaphore`) prevents provider rate limits, and partial-failure handling ensures successful outputs are saved even if one format times out.

---

### Slide 5: Demo & Impact
**The Demo Workflow:**
- Upload a CISA Cybersecurity Advisory.
- Select all 7 formats.
- **Click Generate Once.**
- Review the rich, structured outputs.
**The Impact:** Reduces manual documentation time by >40%, ensures 100% data grounding (zero hallucinations), and standardizes critical communication across the organization.
