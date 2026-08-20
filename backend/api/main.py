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

class InterviewQuestionsResponse(BaseModel):
    questions: List[Dict[str, Any]]

class InterviewAnswersRequest(BaseModel):
    # Keys are question ids as strings (JSON object keys are always strings),
    # values are the candidate's free-text answers.
    answers: Dict[str, str]

class InterviewEvaluationResponse(BaseModel):
    data: Dict[str, Any]


# Helper to check session
def check_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")


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
        adaptive_loop_triggered=session.get("adaptive_loop_triggered", False),
        summary="Final Report Compiled",
        profile=session.get("profile", {}),
        skill_gaps=session.get("skill_gaps", {}),
        learning_roadmap=session.get("learning_roadmap", {}),
        interview_results=session.get("interview_result"),
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
        frontend_roadmap = _roadmap_to_phases(lp_data)

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

        # Keep raw (un-adapted) agent outputs around too — the Interview
        # Simulator and the adaptive re-run of the Learning Path need the
        # original shapes (skills list, matched_role, skill_gaps list),
        # not the frontend-flattened versions above.
        sessions[session_id]["raw_profile"] = profile_data
        sessions[session_id]["raw_skill_gaps"] = gap_data

    except Exception as e:
        sessions[session_id]["status"] = "failed"
        sessions[session_id]["errors"] = [str(e)]


def _roadmap_to_phases(lp_data: Dict[str, Any]) -> Dict[str, Any]:
    phases = []
    for step in lp_data.get("roadmap", []):
        phases.append({
            "phase_number": step["step"],
            "title": f"Learn {step['skill']}",
            "week_range": f"Step {step['step']}",
            "focus_skills": [step["skill"]]
        })
    return {"phases": phases}


@app.post("/api/run-pipeline/{session_id}", response_model=PipelineResponse)
async def run_pipeline(session_id: str, request: PipelineRequest, background_tasks: BackgroundTasks):
    check_session(session_id)
    sessions[session_id]["status"] = "processing"

    background_tasks.add_task(run_pipeline_task, session_id, request.target_role)

    return PipelineResponse(
        status="processing",
        message="Full multi-agent pipeline execution started in the background"
    )


# ---------------------------------------------------------------------------
# Interview Simulator endpoints
# ---------------------------------------------------------------------------

@app.post("/api/interview/questions/{session_id}", response_model=InterviewQuestionsResponse)
async def get_interview_questions(session_id: str):
    """
    Generates (or returns cached) role-specific interview questions for this
    session. Requires the main pipeline to have completed first, since the
    Interview Simulator needs the candidate profile + skill gap result.
    """
    check_session(session_id)
    session = sessions[session_id]

    if session.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail="Pipeline has not completed yet. Wait for /api/report status == 'completed'."
        )

    # Return cached questions if we already generated them for this session
    if session.get("interview_questions"):
        return InterviewQuestionsResponse(questions=session["interview_questions"])

    profile_data = session.get("raw_profile")
    gap_data = session.get("raw_skill_gaps")
    if not profile_data or not gap_data:
        raise HTTPException(status_code=400, detail="Missing profile or skill gap data for this session.")

    from agents.interview_simulator_agent import InterviewSimulatorAgent
    agent = InterviewSimulatorAgent()
    try:
        questions = agent.generate_questions(profile_data, gap_data, num_questions=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate interview questions: {e}")

    session["interview_questions"] = questions
    session["interview_role"] = gap_data.get("matched_role", "the target role")

    return InterviewQuestionsResponse(questions=questions)


@app.post("/api/interview/evaluate/{session_id}", response_model=InterviewEvaluationResponse)
async def evaluate_interview(session_id: str, request: InterviewAnswersRequest):
    """
    Scores the candidate's answers, returns per-question feedback + a
    readiness score, and runs the adaptive feedback loop: if the live
    answers reveal gaps the resume-based Skill Gap Agent missed, those
    gaps are merged in and the Learning Path Agent is re-run automatically.
    """
    check_session(session_id)
    session = sessions[session_id]

    questions = session.get("interview_questions")
    if not questions:
        raise HTTPException(
            status_code=400,
            detail="No interview questions found for this session. Call /api/interview/questions/{session_id} first."
        )

    role = session.get("interview_role", "the target role")

    from agents.interview_simulator_agent import InterviewSimulatorAgent
    agent = InterviewSimulatorAgent()

    # Question ids are ints on the agent side, but JSON object keys arrive as strings.
    try:
        answers = {int(k): v for k, v in request.answers.items()}
    except ValueError:
        raise HTTPException(status_code=400, detail="Answer keys must be numeric question ids.")

    try:
        result = agent.evaluate_answers(role, questions, answers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate interview answers: {e}")

    session["interview_result"] = result

    # --- Adaptive feedback loop ---------------------------------------
    # If the live interview revealed gaps the resume-based analysis
    # missed, fold them into skill_gaps (as high priority) and re-run
    # the Learning Path Agent so the roadmap reflects reality.
    adaptive_triggered = False
    newly_detected = result.get("newly_detected_gaps", []) or []

    if newly_detected:
        gap_data = session.get("raw_skill_gaps", {}) or {}
        gap_data.setdefault("skill_gaps", [])
        existing = {g["skill"].strip().lower() for g in gap_data["skill_gaps"]}

        for skill in newly_detected:
            key = skill.strip().lower()
            if key not in existing:
                gap_data["skill_gaps"].append({"skill": skill, "priority": "high"})
                existing.add(key)
                adaptive_triggered = True

        if adaptive_triggered:
            try:
                from agents.learning_path_agent import LearningPathAgent
                lp_agent = LearningPathAgent()
                lp_data = lp_agent.run(gap_data)
                session["learning_roadmap"] = _roadmap_to_phases(lp_data)
                session["raw_skill_gaps"] = gap_data

                # Keep the frontend-shaped skill gaps in sync too
                skill_gaps = session.get("skill_gaps", {"role": role, "missing_skills": {"must_have": [], "nice_to_have": []}})
                skill_gaps.setdefault("missing_skills", {}).setdefault("must_have", [])
                for g in gap_data["skill_gaps"]:
                    if g["priority"] == "high" and g["skill"] not in skill_gaps["missing_skills"]["must_have"]:
                        skill_gaps["missing_skills"]["must_have"].append(g["skill"])
                session["skill_gaps"] = skill_gaps
            except Exception as e:
                # Don't fail the whole evaluation if the re-run fails —
                # the interview result itself is still valid and useful.
                session.setdefault("errors", []).append(f"Adaptive roadmap re-run failed: {e}")
                adaptive_triggered = False

    session["adaptive_loop_triggered"] = adaptive_triggered
    result["adaptive_loop_triggered"] = adaptive_triggered

    return InterviewEvaluationResponse(data=result)


# 9. At the bottom, include uvicorn.run for direct execution
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)