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
    return _load_jobs()
