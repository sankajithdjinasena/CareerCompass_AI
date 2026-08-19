"""
agents/learning_path_agent.py

Builds a sequenced learning roadmap addressing the highest-priority
skill gaps first, using curated resources with an LLM fallback for
gaps not covered in the curated dataset.
"""

import json
from typing import Any, Dict, List

from shared_store.groq_client import get_groq_client, get_model
from tools.job_course_retriever import get_resources_for_skill

PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}

FALLBACK_PROMPT = """
You are a career-coaching assistant. Suggest ONE well-known, real, freely-verifiable
learning resource (course, official docs, or tutorial) for the skill: "{skill}".
Return ONLY valid JSON, no markdown fences, in this exact shape:
{{"skill": "{skill}", "resource": string, "type": string, "url": string or null, "est_hours": number}}
"""


class LearningPathAgent:
    def __init__(self):
        self.client = get_groq_client()
        self.model = get_model()

    def _llm_fallback_resource(self, skill: str) -> Dict[str, Any]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": FALLBACK_PROMPT.format(skill=skill)}],
            temperature=0.2,
        )
        content = response.choices[0].message.content.strip()
        content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "skill": skill,
                "resource": f"Search for a course on '{skill}' (no curated resource found)",
                "type": "unknown",
                "url": None,
                "est_hours": 10,
            }

    def run(self, skill_gap_result: Dict[str, Any]) -> Dict[str, Any]:
        gaps: List[Dict[str, str]] = skill_gap_result.get("skill_gaps", [])

        # Sort by priority: high before medium before low
        sorted_gaps = sorted(gaps, key=lambda g: PRIORITY_ORDER.get(g["priority"], 3))

        roadmap = []
        for step_num, gap in enumerate(sorted_gaps, start=1):
            skill = gap["skill"]
            resources = get_resources_for_skill(skill)

            if resources:
                resource = resources[0]
                source = "curated"
            else:
                resource = self._llm_fallback_resource(skill)
                source = "llm_fallback"

            roadmap.append({
                "step": step_num,
                "skill": skill,
                "priority": gap["priority"],
                "resource": resource.get("resource"),
                "resource_type": resource.get("type"),
                "url": resource.get("url"),
                "est_hours": resource.get("est_hours"),
                "source": source,
            })

        total_hours = sum(r["est_hours"] or 0 for r in roadmap)

        return {
            "target_role": skill_gap_result.get("matched_role"),
            "roadmap": roadmap,
            "total_estimated_hours": total_hours,
        }


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python -m agents.learning_path_agent <skill_gap_result.json>")
        sys.exit(1)

    with open(sys.argv[1], "r", encoding="utf-8") as f:
        skill_gap_result = json.load(f)

    agent = LearningPathAgent()
    result = agent.run(skill_gap_result)
    print(json.dumps(result, indent=2))
