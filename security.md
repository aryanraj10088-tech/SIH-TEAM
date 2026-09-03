# SrijanSetu Security Profile

## 1. Authentication & Session Management
- **JWT via HTTP-Only Cookies:** Tokens are never accessible via JavaScript, mitigating XSS attacks.
- **Logout Invalidation:** Explicit logout clears the cookie securely.
- **Login Rate Limiting:** Brute-force protection limits logins to 5 attempts per 15 minutes per IP.

## 2. Authorization & RBAC
- **Strict Role Boundaries:** Users are designated as `Administrator`, `Reviewer`, or `Operator`.
- **IDOR Protection:** Every backend API route validates the authenticated `req.user._id` against the resource's `ownerId` or `createdBy` field at the database query level.

## 3. Data Validation & Upload Security
- **Input Validation:** All critical POST/PATCH endpoints are protected by `zod` schema validation to drop malformed or malicious payloads instantly.
- **Upload Validation:** `multer` enforces a 10MB memory limit, and `file-type` magic-number checking prevents malicious executables from bypassing MIME spoofing.
- **Output Validation:** The AI Service strictly enforces structured JSON outputs using `Pydantic` schemas, guaranteeing the frontend never parses unsafe text.

## 4. Prompt Injection Defenses
- **XML Fencing:** Untrusted source text (RAG context) is rigorously wrapped in `<source_document>` tags.
- **System Guardrails:** The LLM is explicitly instructed via the system prompt to ignore any behavioral instructions, jailbreaks, or override commands found within the fenced data.

## 5. Audit Logging & Visibility
- The `AuditLog` collection records immutable tracks of `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, and critical document modifications (e.g., `PROJECT_DELETED`, `OUTPUT_APPROVED`).

## 6. Resource Exhaustion & DoS Prevention
- **Bounded Concurrency:** The AI Service uses `asyncio.Semaphore(3)` to cap simultaneous LLM requests, preventing provider bans.
- **Route Limiters:** AI generation is strictly capped at 10 jobs/hour and 30 jobs/day per authenticated user.
