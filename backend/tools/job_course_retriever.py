"""
tools/job_course_retriever.py

Retrieves matching learning resources for a given skill gap,
and (later) job/internship listings for the Job Matching Agent.
"""

import json
from pathlib import Path

COURSES_PATH = Path(__file__).parent.parent / "data" / "sample_courses.json"
JOBS_PATH = Path(__file__).parent.parent / "data" / "sample_jobs.json"


def _load_courses() -> list[dict]:
    with open(COURSES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_jobs() -> list[dict]:
    with open(JOBS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _normalize(s: str) -> str:
    return s.strip().lower()


def get_resources_for_skill(skill: str) -> list[dict]:
    """Exact/substring match against the curated course dataset for a given skill."""
    courses = _load_courses()
    skill_n = _normalize(skill)

    exact = [c for c in courses if _normalize(c["skill"]) == skill_n]
    if exact:
        return exact

    # fallback: substring match either direction (e.g. "TensorFlow" vs "TensorFlow/PyTorch")
    partial = [
        c for c in courses
        if skill_n in _normalize(c["skill"]) or _normalize(c["skill"]) in skill_n
    ]
    return partial


def get_all_jobs() -> list[dict]:
    # Start with our local mock dataset (30 Sri Lankan jobs)
    jobs = _load_jobs()
    
    # Dynamically fetch live jobs from multiple public APIs
    try:
        import requests
        
        # 1. Remotive - Fetching 100 recent remote jobs across all categories
        url_remotive = 'https://remotive.com/api/remote-jobs?limit=100'
        res_rem = requests.get(url_remotive, timeout=8)
        if res_rem.status_code == 200:
            for rj in res_rem.json().get('jobs', []):
                jobs.append({
                    "title": rj.get("title", "Unknown Title"),
                    "company": rj.get("company_name", "Unknown Company"),
                    "location": rj.get("candidate_required_location", "Remote") + " (Remote)",
                    "type": str(rj.get("job_type", "Full-time")).replace("_", " ").title(),
                    "role_category": rj.get("category", "IT"),
                    "required_skills": rj.get("tags", []),
                    "description": str(rj.get("description", ""))[:200] + "...",
                    "url": rj.get("url")
                })
                
        # 2. Arbeitnow - Fetching 50 recent global jobs
        url_arbeitnow = 'https://www.arbeitnow.com/api/job-board-api'
        res_arb = requests.get(url_arbeitnow, timeout=8)
        if res_arb.status_code == 200:
            for aj in res_arb.json().get('data', [])[:50]:
                jobs.append({
                    "title": aj.get("title", "Unknown Title"),
                    "company": aj.get("company_name", "Unknown Company"),
                    "location": aj.get("location", "Global"),
                    "type": "Full-time",
                    "role_category": "Tech",
                    "required_skills": aj.get("tags", []),
                    "description": str(aj.get("description", ""))[:200] + "...",
                    "url": aj.get("url")
                })
                
    except Exception as e:
        print(f"Warning: Failed to fetch some live jobs: {e}")
        
    return jobs
