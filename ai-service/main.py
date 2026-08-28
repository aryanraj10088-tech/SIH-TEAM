from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import urllib.parse

app = FastAPI(title="AI Orchestrator API")

# ðŸš¨ CRITICAL FOR HACKATHONS: Allow React/Next.js to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database to hold job results and review states for the demo
demo_db = {
    "job_001": {
        "status": "pending_human_review",
        "data": {
            "summary": {"headline": "Resonance in AC Circuits", "valid": True},
            "video": {"scenes": [{"scene_number": 1, "narration": "Welcome..."}]}
        }
    }
}

class ReviewRequest(BaseModel):
    job_id: str
    action: str  # "approve", "reject", or "regenerate"

@app.get("/health")
async def health_check():
    return {"status": "online", "message": "Python API is blazing fast!"}

@app.get("/api/jobs/{job_id}/review")
async def get_job_for_review(job_id: str):
    """Frontend fetches the generated content here to display the UI."""
    if job_id not in demo_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "payload": demo_db[job_id]}

@app.post("/api/jobs/review")
async def submit_human_review(request: ReviewRequest):
    """Frontend submits the human's decision."""
    if request.job_id not in demo_db:
        raise HTTPException(status_code=404, detail="Job not found")

    demo_db[request.job_id]["status"] = request.action

    if request.action == "approve":
        print(f"âœ… [API] Job {request.job_id} approved! Ready for export.")
        return {"status": "success", "message": "Content locked for export."}

    return {"status": "acknowledged"}

# @app.get("/api/jobs/{job_id}/export")
# async def export_final_content(job_id: str):
#     """The final step: Frontend downloads the approved JSON."""
#     job = demo_db.get(job_id)
#     if not job or job["status"] != "approve":
#         raise HTTPException(status_code=400, detail="Job not approved yet or not found.")

#     print(f"ðŸ“¦ [API] Exporting finalized package for {job_id}...")
#     # Returns the clean, validated JSON payload for the frontend to download
#     return {"exported_package": job["data"]}
import urllib.parse

@app.get("/api/jobs/{job_id}/export")
async def export_final_content(job_id: str):
    job = demo_db.get(job_id)
    if not job or job["status"] != "approve":
        raise HTTPException(status_code=400, detail="Job not ready.")

    data = job["data"]

    # Convert text prompts into real image URLs using Pollinations AI
    if "linkedin" in data and "image_prompts" in data["linkedin"]:
        image_urls = []
        for prompt in data["linkedin"]["image_prompts"]:
            encoded_prompt = urllib.parse.quote(prompt)
            # This URL instantly generates and returns an image!
            image_urls.append(f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1080&height=1080&nologo=true")

        data["linkedin"]["generated_images"] = image_urls

    return {"exported_package": data}
