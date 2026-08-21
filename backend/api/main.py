import os
import uuid
import shutil
from typing import Dict, List, Optional
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))
load_dotenv(backend_dir / ".env")

from typing import Any
from agents.orchestrator import orchestrator
from shared_store.context_store import context_store
from auth.router import router as auth_router

app = FastAPI(
    title="CareerCompass AI",
    description="REST API for CareerCompass AI, a multi-agent career coaching system",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount auth router
app.include_router(auth_router)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    session_id: str
    message: str

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
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/upload-resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    if not file.filename.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    session_id = str(uuid.uuid4())
    temp_dir = os.path.join(os.path.dirname(__file__), "temp")
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{session_id}_{file.filename}")

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
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
        questions = orchestrator.generate_interview_questions(session_id)
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)