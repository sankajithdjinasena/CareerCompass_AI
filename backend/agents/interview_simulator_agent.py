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

Generate exactly {num_questions} interview questions for this candidate and role, structured as follows:
- Questions 1 through 10 MUST be Multiple-Choice Questions (type: "mcq"). Each MCQ must have 4 clear option strings (e.g. ["A) option1", "B) option2", "C) option3", "D) option4"]), a "correct_answer" indicating which option is correct (e.g. "A) option1"), a "question", and a "targets_skill".
- Questions 11 through 20 MUST be Open-Ended / Technical Scenario Questions (type: "open"). Each must have a "question" and a "targets_skill".

Prefer questions that probe both candidate's matched skills (to verify depth) and gap areas (to probe partial knowledge).

Return ONLY valid JSON, no markdown fences, in this exact shape:
{{
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "question": "string",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct_answer": "A) option1",
      "targets_skill": "string"
    }},
    {{
      "id": 11,
      "type": "open",
      "question": "string",
      "targets_skill": "string"
    }}
  ]
}}
"""

EVALUATION_PROMPT = """
You are evaluating a candidate's mock interview performance for the role: "{role}".

Below are the interview questions (including MCQs with their correct answers, and Open-Ended scenario questions) along with the candidate's responses:
{qa_pairs}

For each answer, evaluate:
- For MCQ questions: Check whether the candidate selected the correct option.
- For Open-ended questions: Evaluate whether the written response demonstrates real understanding, partial understanding, or a gap.
- Brief, specific feedback (1-2 sentences).

Then produce an overall readiness_score (0-100) for this role based on all answers,
and a list of newly_detected_gaps: any skill where the candidate's LIVE ANSWER
revealed a weakness (incorrect MCQ selection or weak open answer), regardless of whether that skill appeared as a "matched skill"
on their resume. If a question's "targets_skill" got a "weak" or "partial" verdict, that skill
belongs in newly_detected_gaps UNLESS it was already a known gap going into the interview.

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
            max_tokens=4000,
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
        num_questions: int = 20,
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
        qa_pairs_list = []
        for q in questions:
            q_id = q.get("id")
            ans = answers.get(q_id, "[no answer provided]")
            q_type = q.get("type", "open")
            if q_type == "mcq":
                correct = q.get("correct_answer", "")
                qa_pairs_list.append(
                    f"Q{q_id} [MCQ] (targets: {q.get('targets_skill', '')}): {q.get('question', '')}\n"
                    f"Options: {', '.join(q.get('options', []))}\n"
                    f"Correct Answer: {correct}\n"
                    f"Candidate Selected: {ans}\n"
                )
            else:
                qa_pairs_list.append(
                    f"Q{q_id} [Open] (targets: {q.get('targets_skill', '')}): {q.get('question', '')}\n"
                    f"Candidate Answer: {ans}\n"
                )
        qa_pairs = "\n".join(qa_pairs_list)
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
        num_q = int(sys.argv[4]) if len(sys.argv) > 4 else 20

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
