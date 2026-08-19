"""
agents/skill_gap_agent.py

Compares a candidate's structured profile against a target role's skill
requirements and returns a prioritized list of missing/weak skills.
"""

from typing import Any, Dict

from tools.skills_taxonomy_db import resolve_target_role


def _normalize(skill: str) -> str:
    return skill.strip().lower()


class SkillGapAgent:
    """
    Input: candidate profile (from ProfileAnalysisAgent) + a target role
           (either an exact dropdown value or free text).
    Output: matched role, matched skills, and a prioritized gap list
            (required gaps ranked above nice-to-have gaps).
    """

    def run(self, candidate_profile: Dict[str, Any], target_role_input: str) -> Dict[str, Any]:
        role_entry = resolve_target_role(target_role_input)

        candidate_skills = {_normalize(s) for s in candidate_profile.get("skills", [])}

        required = role_entry["required_skills"]
        nice_to_have = role_entry.get("nice_to_have_skills", [])

        matched_required = [s for s in required if _normalize(s) in candidate_skills]
        missing_required = [s for s in required if _normalize(s) not in candidate_skills]

        matched_nice = [s for s in nice_to_have if _normalize(s) in candidate_skills]
        missing_nice = [s for s in nice_to_have if _normalize(s) not in candidate_skills]

        gap_list = (
            [{"skill": s, "priority": "high"} for s in missing_required]
            + [{"skill": s, "priority": "medium"} for s in missing_nice]
        )

        total_required = len(required)
        readiness_pct = (
            round(100 * len(matched_required) / total_required) if total_required else 0
        )

        return {
            "matched_role": role_entry["role"],
            "category": role_entry["category"],
            "matched_skills": matched_required + matched_nice,
            "skill_gaps": gap_list,
            "readiness_pct": readiness_pct,
        }


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 3:
        print("Usage: python -m agents.skill_gap_agent <profile.json> <target_role>")
        sys.exit(1)

    with open(sys.argv[1], "r", encoding="utf-8") as f:
        profile = json.load(f)

    agent = SkillGapAgent()
    result = agent.run(profile, sys.argv[2])
    print(json.dumps(result, indent=2))
