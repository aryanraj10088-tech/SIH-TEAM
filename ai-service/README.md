# AI Service

## Local setup

From the repository root:

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Fill in `ai-service/.env` with your Groq API key and Redis credentials, then start the API:

```powershell
python -m uvicorn api:app --host 127.0.0.1 --port 8000
```

The Node backend expects the generation endpoint at `http://localhost:8000/api/generate`.