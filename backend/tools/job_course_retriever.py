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

def get_live_web_jobs(target_role: str) -> list[dict]:
    """Uses DuckDuckGo Web Search to find the absolute latest job listings."""
    jobs = []
    try:
        from ddgs import DDGS
        with DDGS() as ddgs:
            # Construct a targeted search query for the role
            query = f"{target_role} jobs software remote OR Sri Lanka site:linkedin.com/jobs OR site:glassdoor.com"
            results = ddgs.text(query, max_results=10)
            
            for r in results:
                title_text = r.get("title", "")
                jobs.append({
                    "title": title_text[:50] + ("..." if len(title_text) > 50 else ""),
                    "company": "External Company (Web)",
                    "location": "Global / Sri Lanka",
                    "type": "Full-time / Remote",
                    "role_category": target_role,
                    "required_skills": [target_role.split()[0]], # Basic fallback skill
                    "description": str(r.get("body", ""))[:200] + "...",
                    "url": r.get("href", "")
                })

        # 3. DuckDuckGo Real-Time Search (Phase 2 Upgrade!)
        if target_role:
            jobs.extend(get_live_web_jobs(target_role))
            
    except Exception as e:

        print(f"Warning: DuckDuckGo search failed: {e}")
    return jobs




def get_live_web_courses(skill: str) -> list[dict]:
    """Uses DuckDuckGo to find live YouTube crash courses for a skill."""
    courses = []
    try:
        from ddgs import DDGS
        with DDGS() as ddgs:
            query = f"{skill} tutorial crash course full course site:youtube.com"
            results = ddgs.text(query, max_results=3)
            
            for r in results:
                title_text = r.get("title", "").replace(" - YouTube", "")
                courses.append({
                    "skill": skill,
                    "title": title_text[:60] + ("..." if len(title_text) > 60 else ""),
                    "platform": "YouTube (Live Web)",
                    "url": r.get("href", ""),
                    "cost": "Free",
                    "duration": "1 week (est)",
                    "difficulty": "Beginner/Intermediate",
                    "language": "English"
                })
    except Exception as e:
        print(f"Warning: DuckDuckGo course search failed: {e}")
    return courses

def get_resources_for_skill(skill: str) -> list[dict]:
    """Exact/substring match against curated dataset + live YouTube scrape."""
    courses = _load_courses()
    skill_n = _normalize(skill)

    exact = [c for c in courses if _normalize(c.get("skill", "")) == skill_n]
    if exact:
        return exact

    # Fallback to local substring match
    partial = [
        c for c in courses
        if skill_n in _normalize(c.get("skill", "")) or _normalize(c.get("skill", "")) in skill_n
    ]
    
    # Live Web Fallback: If no local course found (or we just want to augment it), fetch live YouTube courses!
    if not partial:
        live_courses = get_live_web_courses(skill)
        if live_courses:
            return live_courses
            
    return partial



def get_all_jobs(target_role: str = "") -> list[dict]:
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
                

        # 3. DuckDuckGo Real-Time Search (Phase 2 Upgrade!)
        if target_role:
            jobs.extend(get_live_web_jobs(target_role))
            
    except Exception as e:

        print(f"Warning: Failed to fetch some live jobs: {e}")
        
    return jobs
