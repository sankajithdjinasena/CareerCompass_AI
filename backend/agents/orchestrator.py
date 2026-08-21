from typing import Any, Dict, List, Optional

from shared_store.context_store import context_store


class Orchestrator:
    def __init__(self, max_retries: int = 1):
        self.max_retries = max_retries

    # ------------------------------------------------------------------
    # internal helpers
    # ------------------------------------------------------------------

    def _run_step(self, session_id: str, step_name: str, fn, *args, **kwargs):
        """
        Runs a single agent call with a capped retry count (bounded by
        MAX_AGENT_RETRIES-style config via max_retries). Records the last
        error on the session and re-raises on final failure, so callers
        can catch at the pipeline boundary and mark the session failed
        rather than leaving it stuck in 'processing' forever.
        """
        last_err: Optional[Exception] = None
        for _ in range(self.max_retries + 1):
            try:
                return fn(*args, **kwargs)
            except Exception as e:  # noqa: BLE001 - intentionally broad, see docstring
                last_err = e
        context_store.append_error(session_id, f"{step_name} failed: {last_err}")
        raise last_err

    @staticmethod
    def _roadmap_to_phases(lp_data: Dict[str, Any]) -> Dict[str, Any]:
        phases = []
        for step in lp_data.get("roadmap", []):
            phases.append({
                "phase_number": step["step"],
                "title": f"Learn {step['skill']}",
                "week_range": f"Step {step['step']} ({step.get('est_hours', 10)} hours)",
                "focus_skills": [step["skill"]],
                "resource": step.get("resource"),
                "url": step.get("url"),
                "resource_type": step.get("resource_type"),
                "est_hours": step.get("est_hours")
            })
        return {"phases": phases}

    # ------------------------------------------------------------------
    # main pipeline: resume -> profile -> gaps -> roadmap -> jobs
    # ------------------------------------------------------------------

    def run_pipeline(self, session_id: str, file_path: str, target_role: str) -> None:
        """
        Meant to run as a background task. Never raises past its own
        boundary: failures are recorded on the session (status='failed'
        + an errors list) instead of crashing the caller.
        """
        context_store.update(session_id, status="processing")

        try:
            # 1. Profile Analysis
            from agents.profile_analysis_agent import ProfileAnalysisAgent
            profile_agent = ProfileAnalysisAgent()
            profile_data = self._run_step(
                session_id, "Profile Analysis", profile_agent.run, file_path
            )

            frontend_profile = {
                "name": profile_data.get("name"),
                "email": profile_data.get("email"),
                "all_skills": profile_data.get("skills", []),
                "experience": profile_data.get("experience", []),
                "education": profile_data.get("education", []),
            }

            # 2. Skill Gap
            from agents.skill_gap_agent import SkillGapAgent
            gap_agent = SkillGapAgent()
            gap_data = self._run_step(
                session_id, "Skill Gap Analysis", gap_agent.run, profile_data, target_role
            )

            frontend_skill_gaps = {
                "role": gap_data.get("matched_role", target_role),
                "missing_skills": {
                    "must_have": [
                        g["skill"] for g in gap_data.get("skill_gaps", []) if g["priority"] == "high"
                    ],
                    "nice_to_have": [
                        g["skill"] for g in gap_data.get("skill_gaps", []) if g["priority"] == "medium"
                    ],
                },
            }

            # 3. Learning Path
            from agents.learning_path_agent import LearningPathAgent
            lp_agent = LearningPathAgent()
            lp_data = self._run_step(session_id, "Learning Path", lp_agent.run, gap_data)
            frontend_roadmap = self._roadmap_to_phases(lp_data)

            # 4. Job Matching
            from agents.job_matching_agent import JobMatchingAgent
            job_agent = JobMatchingAgent()
            jobs_data = self._run_step(
                session_id, "Job Matching", job_agent.run,
                profile_data, gap_data.get("matched_role", target_role),
            )
            frontend_jobs = {
                "jobs": [
                    {
                        "title": j.get("title", ""),
                        "company": j.get("company", ""),
                        "match_score": j.get("fit_score", 0),
                        "location": j.get("location", ""),
                    }
                    for j in jobs_data.get("ranked_jobs", [])
                ]
            }

            context_store.update(
                session_id,
                status="completed",
                profile=frontend_profile,
                skill_gaps=frontend_skill_gaps,
                learning_roadmap=frontend_roadmap,
                job_matches=frontend_jobs,
                # Raw (un-adapted) agent outputs, needed later by the
                # interview flow and the adaptive re-run below.
                raw_profile=profile_data,
                raw_skill_gaps=gap_data,
            )

        except Exception:
            # The specific failure was already recorded by _run_step.
            context_store.update(session_id, status="failed")

    # ------------------------------------------------------------------
    # interview flow + adaptive feedback loop
    # ------------------------------------------------------------------

    def generate_interview_questions(self, session_id: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        session = context_store.get(session_id)
        if session is None:
            raise ValueError("Session not found")
        if session.get("status") != "completed":
            raise ValueError("Pipeline has not completed yet")

        cached = session.get("interview_questions")
        if cached:
            return cached

        profile_data = session.get("raw_profile")
        gap_data = session.get("raw_skill_gaps")
        if not profile_data or not gap_data:
            raise ValueError("Missing profile or skill gap data for this session")

        from agents.interview_simulator_agent import InterviewSimulatorAgent
        agent = InterviewSimulatorAgent()
        questions = self._run_step(
            session_id, "Interview Question Generation",
            agent.generate_questions, profile_data, gap_data, num_questions,
        )

        context_store.update(
            session_id,
            interview_questions=questions,
            interview_role=gap_data.get("matched_role", "the target role"),
        )
        return questions

    def evaluate_interview(self, session_id: str, answers: Dict[int, str]) -> Dict[str, Any]:
        """
        Scores the interview, then runs the ADAPTIVE FEEDBACK LOOP: any
        skill in newly_detected_gaps that isn't already a known gap gets
        merged in (as high priority) and the Learning Path Agent is
        re-run automatically. The stored roadmap is updated in place —
        the next time the frontend polls /api/report it sees the revised
        plan with no further input from the user.
        """
        session = context_store.get(session_id)
        if session is None:
            raise ValueError("Session not found")

        questions = session.get("interview_questions")
        if not questions:
            raise ValueError("No interview questions found for this session — generate them first")

        role = session.get("interview_role", "the target role")

        from agents.interview_simulator_agent import InterviewSimulatorAgent
        agent = InterviewSimulatorAgent()
        result = self._run_step(
            session_id, "Interview Evaluation",
            agent.evaluate_answers, role, questions, answers,
        )

        adaptive_triggered = self._adapt_roadmap_if_needed(
            session_id, result.get("newly_detected_gaps", [])
        )

        result["adaptive_loop_triggered"] = adaptive_triggered
        context_store.update(
            session_id, interview_result=result, adaptive_loop_triggered=adaptive_triggered
        )
        return result

    def _adapt_roadmap_if_needed(self, session_id: str, newly_detected: Optional[List[str]]) -> bool:
        if not newly_detected:
            return False

        session = context_store.get(session_id)
        gap_data = session.get("raw_skill_gaps", {}) or {}
        gap_data.setdefault("skill_gaps", [])
        existing = {g["skill"].strip().lower() for g in gap_data["skill_gaps"]}

        added = False
        for skill in newly_detected:
            key = skill.strip().lower()
            if key not in existing:
                gap_data["skill_gaps"].append({"skill": skill, "priority": "high"})
                existing.add(key)
                added = True

        if not added:
            return False

        try:
            from agents.learning_path_agent import LearningPathAgent
            lp_agent = LearningPathAgent()
            lp_data = self._run_step(
                session_id, "Adaptive Learning Path Re-run", lp_agent.run, gap_data
            )
        except Exception:
            # Error already recorded by _run_step. Don't let a failed
            # re-run invalidate the (already-valid) interview result.
            return False

        frontend_roadmap = self._roadmap_to_phases(lp_data)

        # Keep the frontend-shaped skill gaps view in sync too.
        role = session.get("interview_role", gap_data.get("matched_role", "the target role"))
        skill_gaps = session.get("skill_gaps") or {
            "role": role,
            "missing_skills": {"must_have": [], "nice_to_have": []},
        }
        must_have = skill_gaps.setdefault("missing_skills", {}).setdefault("must_have", [])
        for g in gap_data["skill_gaps"]:
            if g["priority"] == "high" and g["skill"] not in must_have:
                must_have.append(g["skill"])

        context_store.update(
            session_id,
            raw_skill_gaps=gap_data,
            learning_roadmap=frontend_roadmap,
            skill_gaps=skill_gaps,
        )
        return True


# Module-level singleton — one Orchestrator instance shared across the
# API process, mirroring context_store's pattern.
orchestrator = Orchestrator()