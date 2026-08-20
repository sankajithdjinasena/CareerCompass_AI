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

# 2. Create a FastAPI app with title, description, and version
app = FastAPI(
    title="CareerCompass AI",
    description="REST API for CareerCompass AI, a multi-agent career coaching system",
    version="0.1.0"
)

# 3. Add CORS middleware (allow all origins for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Simple in-memory dict to store session data for now
sessions: Dict[str, dict] = {}

from typing import Any

# 6. Pydantic response models
class UploadResponse(BaseModel):
    session_id: str
    message: str

class ProfileResponse(BaseModel):
    data: Dict[str, Any]

class SkillGapResponse(BaseModel):
    data: Dict[str, Any]

class RoadmapResponse(BaseModel):
    data: Dict[str, Any]

class InterviewRequest(BaseModel):
    answer: str
    target_role: str

class InterviewResponse(BaseModel):
    data: Dict[str, Any]

class JobsResponse(BaseModel):
    data: Dict[str, Any]

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

class PipelineResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None


# Helper to check session
def check_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

# Removed context_store and orchestrator imports
# from agents.orchestrator import run_full_pipeline, run_pipeline_without_interview
# from agents.interview_simulator_agent import run_interview_and_store

sessions: Dict[str, dict] = {}

@app.get("/api/health")
async def health_check():
    """Health check endpoint to ensure the API is running."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/upload-resume", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Accepts UploadFile, saves temporarily, returns a session_id UUID."""
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
        
    sessions[session_id] = {"file_path": file_path, "status": "uploaded"}
    
    return UploadResponse(session_id=session_id, message="Resume uploaded successfully")

@app.get("/api/report/{session_id}", response_model=ReportResponse)
async def get_report(session_id: str):
    check_session(session_id)
    session = sessions[session_id]
    
    return ReportResponse(
        session_id=session_id,
        status=session.get("status", "unknown"),
        adaptive_loop_triggered=False,
        summary="Final Report Compiled",
        profile=session.get("profile", {}),
        skill_gaps=session.get("skill_gaps", {}),
        learning_roadmap=session.get("learning_roadmap", {}),
        interview_results=None,
        job_matches=session.get("job_matches", {}),
        errors=session.get("errors", [])
    )

class PipelineRequest(BaseModel):
    target_role: str

def run_pipeline_task(session_id: str, target_role: str):
    try:
        file_path = sessions[session_id]["file_path"]
        
        # 1. Profile Analysis
        from agents.profile_analysis_agent import ProfileAnalysisAgent
        profile_agent = ProfileAnalysisAgent()
        profile_data = profile_agent.run(file_path)
        # Adapt frontend expected format (all_skills)
        frontend_profile = {
            "name": profile_data.get("name"),
            "email": profile_data.get("email"),
            "all_skills": profile_data.get("skills", []),
            "experience": profile_data.get("experience", []),
            "education": profile_data.get("education", [])
        }
        
        # 2. Skill Gap
        from agents.skill_gap_agent import SkillGapAgent
        gap_agent = SkillGapAgent()
        gap_data = gap_agent.run(profile_data, target_role)
        # Adapt for frontend: missing_skills.must_have
        frontend_skill_gaps = {
            "role": gap_data.get("matched_role", target_role),
            "missing_skills": {
                "must_have": [g["skill"] for g in gap_data.get("skill_gaps", []) if g["priority"] == "high"],
                "nice_to_have": [g["skill"] for g in gap_data.get("skill_gaps", []) if g["priority"] == "medium"]
            }
        }
        
        # 3. Learning Path
        from agents.learning_path_agent import LearningPathAgent
        lp_agent = LearningPathAgent()
        lp_data = lp_agent.run(gap_data)
        # Adapt for frontend: phases
        phases = []
        for step in lp_data.get("roadmap", []):
            phases.append({
                "phase_number": step["step"],
                "title": f"Learn {step['skill']}",
                "week_range": f"Step {step['step']}",
                "focus_skills": [step["skill"]]
            })
        frontend_roadmap = {"phases": phases}
        
        # 4. Job Matching
        from agents.job_matching_agent import JobMatchingAgent
        job_agent = JobMatchingAgent()
        jobs_data = job_agent.run(profile_data, gap_data.get("matched_role", target_role))
        # Adapt for frontend: jobs list with fit_score
        frontend_jobs = {"jobs": []}
        for j in jobs_data.get("ranked_jobs", []):
            frontend_jobs["jobs"].append({
                "title": j.get("title", ""),
                "company": j.get("company", ""),
                "match_score": j.get("fit_score", 0),
                "location": j.get("location", "")
            })
            
        sessions[session_id]["profile"] = frontend_profile
        sessions[session_id]["skill_gaps"] = frontend_skill_gaps
        sessions[session_id]["learning_roadmap"] = frontend_roadmap
        sessions[session_id]["job_matches"] = frontend_jobs
        sessions[session_id]["status"] = "completed"
        
    except Exception as e:
        sessions[session_id]["status"] = "failed"
        sessions[session_id]["errors"] = [str(e)]

@app.post("/api/run-pipeline/{session_id}", response_model=PipelineResponse)
async def run_pipeline(session_id: str, request: PipelineRequest, background_tasks: BackgroundTasks):
    check_session(session_id)
    sessions[session_id]["status"] = "processing"
    
    background_tasks.add_task(run_pipeline_task, session_id, request.target_role)
    
    return PipelineResponse(
        status="processing", 
        message="Full multi-agent pipeline execution started in the background"
    )

# 9. At the bottom, include uvicorn.run for direct execution
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
