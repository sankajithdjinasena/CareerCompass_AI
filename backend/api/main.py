import os
import uuid
import shutil
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
import sys
sys.path.insert(0, str(backend_dir))
load_dotenv(backend_dir / ".env")

from agents.orchestrator import orchestrator
from shared_store.context_store import context_store
from auth.router import router as auth_router

app = FastAPI(
    title="CareerCompass AI",
    description="REST API for CareerCompass AI, an autonomous multi-agent career coaching platform",
    version="1.0.0"
)

# Configure CORS via environment variable with local fallbacks
cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
if cors_origins_env:
    for origin in cors_origins_env.split(","):
        origin = origin.strip()
        if origin and origin not in allowed_origins:
            allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount auth router
app.include_router(auth_router)

# Maximum file size: 10 MB
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    session_id: str
    message: str

def _roadmap_to_phases(lp_data: Dict[str, Any]) -> Dict[str, Any]:
    phases = []
    for step in lp_data.get("roadmap", []):
        phases.append({
            "phase_number": step["step"],
            "title": f"Learn {step['skill']}",
            "week_range": f"Step {step['step']} ({step.get('est_hours', 10)} hours)",
            "focus_skills": [step["skill"]],
            "resource": step.get("resource"),
            "url": step.get("url"),
            "resource_type": step.get("resource_type"),
            "est_hours": step.get("est_hours")
        })
    return {"phases": phases}

class ReportResponse(BaseModel):
    session_id: str
    status: str
    adaptive_loop_triggered: bool
    summary: str
    profile: Dict[str, Any]
    skill_gaps: Dict[str, Any]
    learning_roadmap: Dict[str, Any]
    interview_results: Optional[Dict[str, Any]]
    job_matches: Dict[str, Any]
    raw_skill_gaps: Optional[Dict[str, Any]] = None
    errors: List[str]

class PipelineRequest(BaseModel):
    target_role: str

class PipelineResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

class InterviewQuestionsResponse(BaseModel):
    questions: List[Dict[str, Any]]

class InterviewAnswersRequest(BaseModel):
    answers: Dict[str, str]  # question id (as string) -> answer text

class InterviewEvaluationResponse(BaseModel):
    data: Dict[str, Any]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def check_session(session_id: str) -> None:
    if not context_store.exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    """
    Comprehensive system diagnostic health check endpoint.
    Verifies SQLite context store persistence and Groq API key configuration.
    """
    groq_configured = bool(os.getenv("GROQ_API_KEY"))
    store_healthy = True
    try:
        store_healthy = context_store.exists("non-existent-probe-check") == False
    except Exception:
        store_healthy = False

    return {
        "status": "healthy" if (groq_configured and store_healthy) else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "online",
            "groq_llm_api": "configured" if groq_configured else "missing_api_key",
            "sqlite_session_store": "healthy" if store_healthy else "unhealthy"
        },
        "max_upload_size_mb": 10
    }


@app.post("/api/upload-resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    clean_filename = os.path.basename(file.filename)
    if not clean_filename.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    # Read and validate file size (10 MB max limit)
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large ({len(contents) / (1024*1024):.1f} MB). Maximum allowed size is 10 MB."
        )

    session_id = str(uuid.uuid4())
    temp_dir = os.path.join(os.path.dirname(__file__), "temp")
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{session_id}_{clean_filename}")

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    context_store.create_session(session_id, file_path=file_path, status="uploaded")
    return UploadResponse(session_id=session_id, message="Resume uploaded successfully")


@app.get("/api/report/{session_id}", response_model=ReportResponse)
async def get_report(session_id: str):
    check_session(session_id)
    session = context_store.get(session_id)

    return ReportResponse(
        session_id=session_id,
        status=session.get("status", "unknown"),
        adaptive_loop_triggered=session.get("adaptive_loop_triggered", False),
        summary="Final Report Compiled",
        profile=session.get("profile", {}),
        skill_gaps=session.get("skill_gaps", {}),
        learning_roadmap=session.get("learning_roadmap", {}),
        interview_results=session.get("interview_result"),
        job_matches=session.get("job_matches", {}),
        raw_skill_gaps=session.get("raw_skill_gaps"),
        errors=session.get("errors", []),
    )


@app.post("/api/run-pipeline/{session_id}", response_model=PipelineResponse)
async def run_pipeline(session_id: str, request: PipelineRequest, background_tasks: BackgroundTasks):
    check_session(session_id)
    session = context_store.get(session_id)
    file_path = session["file_path"]

    background_tasks.add_task(orchestrator.run_pipeline, session_id, file_path, request.target_role)

    return PipelineResponse(
        status="processing",
        message="Full multi-agent pipeline execution started in the background",
    )


# ---------------------------------------------------------------------------
# Interview Simulator + adaptive feedback loop
# ---------------------------------------------------------------------------

@app.post("/api/interview/questions/{session_id}", response_model=InterviewQuestionsResponse)
async def get_interview_questions(session_id: str):
    check_session(session_id)
    try:
        questions = orchestrator.generate_interview_questions(session_id, num_questions=20)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate interview questions: {e}")
    return InterviewQuestionsResponse(questions=questions)


@app.post("/api/interview/evaluate/{session_id}", response_model=InterviewEvaluationResponse)
async def evaluate_interview(session_id: str, request: InterviewAnswersRequest):
    check_session(session_id)
    try:
        answers = {int(k): v for k, v in request.answers.items()}
    except ValueError:
        raise HTTPException(status_code=400, detail="Answer keys must be numeric question ids.")

    try:
        result = orchestrator.evaluate_interview(session_id, answers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate interview answers: {e}")

    return InterviewEvaluationResponse(data=result)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)