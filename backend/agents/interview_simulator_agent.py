"""
agents/interview_simulator_agent.py

Single-turn mock interview:
1. generate_questions() - produces N role-specific questions upfront
2. evaluate_answers() - scores all answers at once, returns transcript,
   readiness score, and newly-detected skill gaps
"""

import json
from typing import Any, Dict, List

from shared_store.groq_client import get_groq_client, get_model

QUESTION_GEN_PROMPT = """
You are an interviewer preparing a mock technical interview for the role: "{role}".

Candidate's known skills: {skills}
Candidate's matched skills for this role: {matched_skills}
Candidate's known skill gaps: {gaps}

Generate {num_questions} interview questions for this specific candidate and role.
Mix conceptual and applied/scenario-based questions. Prefer questions that probe
both their matched skills (to verify depth) and their gap areas (to see if they
have partial knowledge not caught by resume keywords).

Return ONLY valid JSON, no markdown fences, in this exact shape:
{{"questions": [{{"id": 1, "question": string, "targets_skill": string}}]}}
"""

EVALUATION_PROMPT = """
You are evaluating a candidate's mock interview for the role: "{role}".

Below are the interview questions and the candidate's answers:
{qa_pairs}

For each answer, evaluate:
- Whether it demonstrates real understanding, partial understanding, or a gap
- Brief, specific feedback (1-2 sentences)

Then produce an overall readiness_score (0-100) for this role based on all answers,
and a list of newly_detected_gaps: any skill where the candidate's LIVE ANSWER
revealed a weakness, regardless of whether that skill appeared as a "matched skill"
on their resume. This is the whole point of the interview - resumes list skills the
candidate claims to have, but live answers reveal whether they can actually apply
them. If a question's "targets_skill" got a "weak" or "partial" verdict, that skill
belongs in newly_detected_gaps UNLESS it was already a known gap going into the
interview. Do not leave this list empty just because the skill was previously
marked as "matched" - a weak live answer overrides a resume-based match.

Return ONLY valid JSON, no markdown fences, in this exact shape:
{{
  "per_question_feedback": [
    {{"id": int, "verdict": "strong" | "partial" | "weak", "feedback": string}}
  ],
  "readiness_score": int,
  "newly_detected_gaps": [string]
}}
"""


class InterviewSimulatorAgent:
    def __init__(self):
        self.client = get_groq_client()
        self.model = get_model()

    def _call_groq(self, prompt: str) -> dict:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=2000,
        )
        content = response.choices[0].message.content.strip()
        if "<think>" in content and "</think>" not in content:
            raise ValueError("Truncated inside think block")
        if "</think>" in content:
            content = content.split("</think>")[-1].strip()
            
        content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            start = content.find('{')
            end = content.rfind('}')
            if start != -1 and end != -1:
                return json.loads(content[start:end+1])
            return json.loads(content)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM JSON output: {e}\nRaw output:\n{content}")

    def generate_questions(
        self,
        candidate_profile: Dict[str, Any],
        skill_gap_result: Dict[str, Any],
        num_questions: int = 5,
    ) -> List[Dict[str, Any]]:
        prompt = QUESTION_GEN_PROMPT.format(
            role=skill_gap_result.get("matched_role", "the target role"),
            skills=", ".join(candidate_profile.get("skills", [])),
            matched_skills=", ".join(skill_gap_result.get("matched_skills", [])),
            gaps=", ".join(g["skill"] for g in skill_gap_result.get("skill_gaps", [])),
            num_questions=num_questions,
        )
        result = self._call_groq(prompt)
        return result["questions"]

    def evaluate_answers(
        self,
        role: str,
        questions: List[Dict[str, Any]],
        answers: Dict[int, str],
    ) -> Dict[str, Any]:
        """
        questions: output of generate_questions()
        answers: dict mapping question id -> candidate's answer text
        """
        qa_pairs = "\n\n".join(
            f"Q{q['id']} (targets: {q['targets_skill']}): {q['question']}\n"
            f"A{q['id']}: {answers.get(q['id'], '[no answer provided]')}"
            for q in questions
        )
        prompt = EVALUATION_PROMPT.format(role=role, qa_pairs=qa_pairs)
        result = self._call_groq(prompt)
        result["role"] = role
        return result


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print(
            "Usage:\n"
            "  Generate questions: python -m agents.interview_simulator_agent generate <profile.json> <gap_result.json> [num_questions]\n"
            "  Evaluate answers:   python -m agents.interview_simulator_agent evaluate <questions.json> <answers.json> <role>"
        )
        sys.exit(1)

    agent = InterviewSimulatorAgent()
    mode = sys.argv[1]

    if mode == "generate":
        with open(sys.argv[2], "r", encoding="utf-8") as f:
            profile = json.load(f)
        with open(sys.argv[3], "r", encoding="utf-8") as f:
            gap_result = json.load(f)
        num_q = int(sys.argv[4]) if len(sys.argv) > 4 else 5

        questions = agent.generate_questions(profile, gap_result, num_q)
        print(json.dumps({"questions": questions}, indent=2))

    elif mode == "evaluate":
        with open(sys.argv[2], "r", encoding="utf-8") as f:
            q_data = json.load(f)
        with open(sys.argv[3], "r", encoding="utf-8") as f:
            answers_raw = json.load(f)
        role = sys.argv[4]

        answers = {int(k): v for k, v in answers_raw.items()}
        result = agent.evaluate_answers(role, q_data["questions"], answers)
        print(json.dumps(result, indent=2))

    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)
