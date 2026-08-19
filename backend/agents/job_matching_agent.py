"""
agents/job_matching_agent.py

Ranks job/internship listings against the candidate's (possibly revised)
profile, with a rationale explaining each match.
"""

from typing import Any, Dict, List

from tools.job_course_retriever import get_all_jobs


def _normalize(s: str) -> str:
    return s.strip().lower()


class JobMatchingAgent:
    """
    Input: candidate profile + matched target role (from SkillGapAgent output)
    Output: ranked job list, each with a fit score and rationale
    """

    def run(
        self,
        candidate_profile: Dict[str, Any],
        target_role: str,
        top_n: int = 5,
    ) -> Dict[str, Any]:
        jobs = get_all_jobs()
        candidate_skills = {_normalize(s) for s in candidate_profile.get("skills", [])}
        target_role_n = _normalize(target_role)

        ranked = []
        for job in jobs:
            job_required = job["required_skills"]
            matched = [s for s in job_required if _normalize(s) in candidate_skills]
            missing = [s for s in job_required if _normalize(s) not in candidate_skills]

            skill_overlap_pct = round(100 * len(matched) / len(job_required)) if job_required else 0

            # Bonus weight if the job's role category matches the candidate's target role
            role_match_bonus = 20 if _normalize(job["role_category"]) == target_role_n else 0

            fit_score = min(100, skill_overlap_pct + role_match_bonus)

            if matched:
                rationale = (
                    f"Matches on {', '.join(matched)}"
                    + (f"; role aligns with your target ({job['role_category']})" if role_match_bonus else "")
                    + (f". Missing: {', '.join(missing)}" if missing else "")
                )
            else:
                rationale = f"No direct skill overlap yet. Requires: {', '.join(job_required)}"

            ranked.append({
                "title": job["title"],
                "company": job["company"],
                "location": job["location"],
                "type": job["type"],
                "fit_score": fit_score,
                "matched_skills": matched,
                "missing_skills": missing,
                "rationale": rationale,
            })

        ranked.sort(key=lambda j: j["fit_score"], reverse=True)

        return {
            "target_role": target_role,
            "ranked_jobs": ranked[:top_n],
        }


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 3:
        print("Usage: python -m agents.job_matching_agent <profile.json> <target_role>")
        sys.exit(1)

    with open(sys.argv[1], "r", encoding="utf-8") as f:
        profile = json.load(f)

    agent = JobMatchingAgent()
    result = agent.run(profile, sys.argv[2])
    print(json.dumps(result, indent=2))
