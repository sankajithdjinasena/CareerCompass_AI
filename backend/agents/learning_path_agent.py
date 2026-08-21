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

    def _live_youtube_fallback(self, skill: str) -> Dict[str, Any]:
        """
        Executes a live YouTube search to find the most relevant tutorial video
        for the given skill without needing a YouTube API key.
        """
        import requests
        import re
        import urllib.parse
        
        query = urllib.parse.quote(f"{skill} tutorial for beginners full course")
        url = f"https://www.youtube.com/results?search_query={query}"
        try:
            response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
            html = response.text
            
            match = re.search(r'"videoId":"([^"]{11})".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]', html)
            if match:
                vid, title = match.groups()
                return {
                    "skill": skill,
                    "resource": title,
                    "type": "YouTube Video",
                    "url": f"https://www.youtube.com/watch?v={vid}",
                    "est_hours": 3
                }
        except Exception as e:
            print(f"YouTube search failed for {skill}: {e}")
            
        return {
            "skill": skill,
            "resource": f"Search YouTube for '{skill} tutorial'",
            "type": "Search",
            "url": f"https://www.youtube.com/results?search_query={urllib.parse.quote(skill)}",
            "est_hours": 5,
        }

    def run(self, skill_gap_result: Dict[str, Any]) -> Dict[str, Any]:
        gaps: List[Dict[str, str]] = skill_gap_result.get("skill_gaps", [])
        sorted_gaps = sorted(gaps, key=lambda g: PRIORITY_ORDER.get(g["priority"], 3))

        roadmap = []
        for step_num, gap in enumerate(sorted_gaps, start=1):
            skill = gap["skill"]
            resources = get_resources_for_skill(skill)

            if resources:
                resource = resources[0]
                source = "curated"
            else:
                resource = self._live_youtube_fallback(skill)
                source = "live_youtube_search"

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
