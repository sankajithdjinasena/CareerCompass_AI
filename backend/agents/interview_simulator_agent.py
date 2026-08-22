"""
agents/interview_simulator_agent.py

Multi-agent technical mock interview simulator:
1. generate_questions() - produces N role-specific questions with robust MCQ validation
2. evaluate_answers() - evaluates answers, readiness score, feedback, and new skill gaps
"""

import json
from typing import Any, Dict, List
from shared_store.groq_client import call_groq_with_retry

QUESTION_GEN_PROMPT = """
You are an expert technical interviewer preparing a mock interview for the role: "{role}".

Candidate's known skills: {skills}
Candidate's matched skills for this role: {matched_skills}
Candidate's known skill gaps: {gaps}

Generate exactly {num_questions} interview questions for this candidate and role:
- Questions 1 through 10 MUST be Multiple-Choice Questions (type: "mcq"). Each MCQ MUST have exactly 4 options formatted as ["A) ...", "B) ...", "C) ...", "D) ..."], a "correct_answer" matching one option, a "question", and a "targets_skill".
- Questions 11 through 20 MUST be Open-Ended / Technical Scenario Questions (type: "open"). Each must have a "question" and a "targets_skill".

Return ONLY valid JSON in this exact shape:
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

Below are the interview questions along with the candidate's responses:
{qa_pairs}

For each answer, evaluate:
- For MCQ questions: Verify if candidate's choice matches correct_answer.
- For Open questions: Evaluate technical understanding and depth.
- Provide a brief 1-2 sentence constructive feedback.

Calculate an overall readiness_score (0-100) and list newly_detected_gaps (skills where candidate demonstrated weak understanding).

Return ONLY valid JSON in this exact shape:
{{
  "per_question_feedback": [
    {{"id": int, "verdict": "strong" | "partial" | "weak", "feedback": string}}
  ],
  "readiness_score": int,
  "newly_detected_gaps": [string]
}}
"""


class InterviewSimulatorAgent:

    def _parse_llm_json(self, content: str) -> dict:
        content = content.strip()
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

        content = call_groq_with_retry(prompt, temperature=0.3, max_retries=3)
        result = self._parse_llm_json(content)
        questions = result.get("questions", [])

        # Validate and sanitize MCQ option fields
        for q in questions:
            if q.get("type") == "mcq":
                opts = q.get("options", [])
                if not opts or len(opts) < 4:
                    q["options"] = ["A) Option A", "B) Option B", "C) Option C", "D) Option D"]
                if not q.get("correct_answer"):
                    q["correct_answer"] = q["options"][0]

        return questions

    def evaluate_answers(
        self,
        role: str,
        questions: List[Dict[str, Any]],
        answers: Dict[int, str],
    ) -> Dict[str, Any]:
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
        content = call_groq_with_retry(prompt, temperature=0.2, max_retries=3)
        result = self._parse_llm_json(content)
        result["role"] = role
        return result
