from typing import Any, Dict, List, Optional, TypedDict
from langgraph.graph import StateGraph, START, END

from shared_store.context_store import context_store

class AgentState(TypedDict):
    session_id: str
    file_path: str
    target_role: str

    raw_profile: Optional[Dict[str, Any]]
    raw_skill_gaps: Optional[Dict[str, Any]]
    lp_data: Optional[Dict[str, Any]]
    jobs_data: Optional[Dict[str, Any]]

    frontend_profile: Optional[Dict[str, Any]]
    frontend_skill_gaps: Optional[Dict[str, Any]]
    frontend_roadmap: Optional[Dict[str, Any]]
    frontend_jobs: Optional[Dict[str, Any]]

class Orchestrator:
    def __init__(self, max_retries: int = 1):
        self.max_retries = max_retries
        self.graph = self._build_graph()

    def _run_step(self, session_id: str, step_name: str, fn, *args, **kwargs):
        last_err: Optional[Exception] = None
        for _ in range(self.max_retries + 1):
            try:
                return fn(*args, **kwargs)
            except Exception as e:
                last_err = e
        context_store.append_error(session_id, f"{step_name} failed: {last_err}")
        raise last_err

    def _roadmap_to_phases(self, lp_data: dict) -> dict:
        phases = []
        for i, item in enumerate(lp_data.get("learning_path", [])):
            phases.append({
                "phase_number": i + 1,
                "title": item.get("topic", "Learning Topic"),
                "week_range": item.get("time_estimate", "1 week"),
                "focus_skills": [item.get("target_skill", "")],
                "resource": item.get("recommended_resource", {}).get("title", "Resource"),
                "url": item.get("recommended_resource", {}).get("url", ""),
            })
        return {"phases": phases}

    # --- LANGGRAPH NODES ---

    def node_profile_correction(self, state: AgentState):
        """
        Auto-Correction Loop: If the initial profile extraction yielded too few skills,
        this node explicitly asks the LLM to dig deeper into the raw text.
        """
        from tools.resume_parser import extract_text_from_pdf, structure_resume_text
        
        # We know it failed the quality check, so we re-extract with a stricter prompt
        raw_text = extract_text_from_pdf(state["file_path"])
        
        # We append a stern warning to the raw text to force the LLM to do better
        enhanced_prompt = raw_text + "\n\n[SYSTEM CRITICAL]: The previous extraction missed skills. Extract EVERY SINGLE programming language, framework, database, and tool mentioned in the text above!"
        
        corrected_structured = structure_resume_text(enhanced_prompt)
        
        return {
            "raw_profile": corrected_structured,
            "frontend_profile": {
                "name": corrected_structured.get("name"),
                "email": corrected_structured.get("email"),
                "all_skills": corrected_structured.get("skills", []),
                "experience": corrected_structured.get("experience", []),
                "education": corrected_structured.get("education", []),
            }
        }

    def route_profile(self, state: AgentState) -> str:
        """
        Auto-Correction Routing Logic.
        If the Profile Analysis extracted fewer than 3 skills, we route to correction.
        """
        skills = state.get("raw_profile", {}).get("skills", [])
        if len(skills) < 3:
            print("Auto-Correction Triggered: Too few skills found. Rerouting to deep analysis...")
            return "correction"
        return "skill_gap"


    def node_profile(self, state: AgentState):
        from agents.profile_analysis_agent import ProfileAnalysisAgent
        agent = ProfileAnalysisAgent()
        profile_data = self._run_step(state["session_id"], "Profile Analysis", agent.run, state["file_path"])
        
        return {
            "raw_profile": profile_data,
            "frontend_profile": {
                "name": profile_data.get("name"),
                "email": profile_data.get("email"),
                "all_skills": profile_data.get("skills", []),
                "experience": profile_data.get("experience", []),
                "education": profile_data.get("education", []),
            }
        }

    def node_skill_gap(self, state: AgentState):
        from agents.skill_gap_agent import SkillGapAgent
        agent = SkillGapAgent()
        gap_data = self._run_step(
            state["session_id"], "Skill Gap Analysis", agent.run, state.get("raw_profile"), state["target_role"]
        )
        
        return {
            "raw_skill_gaps": gap_data,
            "frontend_skill_gaps": {
                "role": gap_data.get("matched_role", state["target_role"]),
                "missing_skills": {
                    "must_have": [g["skill"] for g in gap_data.get("skill_gaps", []) if g["priority"] == "high"],
                    "nice_to_have": [g["skill"] for g in gap_data.get("skill_gaps", []) if g["priority"] == "medium"],
                },
            }
        }

    def node_learning_path(self, state: AgentState):
        from agents.learning_path_agent import LearningPathAgent
        agent = LearningPathAgent()
        lp_data = self._run_step(state["session_id"], "Learning Path", agent.run, state.get("raw_skill_gaps"))
        return {
            "lp_data": lp_data,
            "frontend_roadmap": self._roadmap_to_phases(lp_data)
        }

    def node_job_matching(self, state: AgentState):
        from agents.job_matching_agent import JobMatchingAgent
        agent = JobMatchingAgent()
        jobs_data = self._run_step(
            state["session_id"], "Job Matching", agent.run,
            state.get("raw_profile"), state.get("raw_skill_gaps", {}).get("matched_role", state["target_role"])
        )
        
        return {
            "jobs_data": jobs_data,
            "frontend_jobs": {
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
        }

    def _build_graph(self):
        builder = StateGraph(AgentState)
        
        builder.add_node("profile", self.node_profile)
        builder.add_node("profile_correction", self.node_profile_correction)
        builder.add_node("skill_gap", self.node_skill_gap)
        builder.add_node("learning_path", self.node_learning_path)
        builder.add_node("job_matching", self.node_job_matching)
        
        builder.add_edge(START, "profile")
        
        # Conditional Edge: Auto-Correction Loop!
        builder.add_conditional_edges(
            "profile",
            self.route_profile,
            {
                "correction": "profile_correction",
                "skill_gap": "skill_gap"
            }
        )
        
        builder.add_edge("profile_correction", "skill_gap")
        builder.add_edge("skill_gap", "learning_path")
        builder.add_edge("learning_path", "job_matching")
        builder.add_edge("job_matching", END)
        
        return builder.compile()

    # --- PIPELINE EXECUTIONS ---

    def run_pipeline(self, session_id: str, file_path: str, target_role: str) -> None:
        """
        Executes the LangGraph StateGraph pipeline.
        """
        context_store.update(session_id, status="processing")
        try:
            initial_state = {
                "session_id": session_id,
                "file_path": file_path,
                "target_role": target_role,
            }
            # Execute the compiled LangGraph state machine!
            final_state = self.graph.invoke(initial_state)
            
            context_store.update(
                session_id,
                status="completed",
                profile=final_state.get("frontend_profile"),
                skill_gaps=final_state.get("frontend_skill_gaps"),
                learning_roadmap=final_state.get("frontend_roadmap"),
                job_matches=final_state.get("frontend_jobs"),
                raw_profile=final_state.get("raw_profile"),
                raw_skill_gaps=final_state.get("raw_skill_gaps"),
            )
        except Exception:
            context_store.update(session_id, status="failed")

    def generate_interview_questions(self, session_id: str, num_questions: int = 20) -> List[Dict[str, Any]]:
        session = context_store.get(session_id)
        if session is None:
            raise ValueError("Session not found")
        if session.get("status") != "completed":
            raise ValueError("Pipeline has not completed yet")

        cached = session.get("interview_questions")
        if cached and len(cached) >= num_questions:
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
        Scores the interview, then triggers the ADAPTIVE FEEDBACK LOOP via LangGraph.
        """
        session = context_store.get(session_id)
        if session is None:
            raise ValueError("Session not found")

        questions = session.get("interview_questions")
        if not questions:
            raise ValueError("No interview questions found for this session - generate them first")

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
            # ADAPTIVE FEEDBACK LOOP USING LANGGRAPH NODE EXECUTION
            # Since we defined nodes, we can manually invoke the learning_path node for the loop!
            dummy_state = {
                "session_id": session_id,
                "file_path": "",
                "target_role": "",
                "raw_skill_gaps": gap_data
            }
            # Re-run just the learning path node from the graph
            lp_state_update = self.node_learning_path(dummy_state)
        except Exception:
            return False

        frontend_roadmap = lp_state_update["frontend_roadmap"]

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

orchestrator = Orchestrator()
