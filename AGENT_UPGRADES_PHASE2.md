# CareerCompass AI: Phase 2 Agentic Upgrades

This document outlines four advanced architecture proposals to make the CareerCompass AI agents smarter, more resilient, and highly autonomous for the next phase of development.

---

## 1. Auto-Correction Loops (Profile Analysis Agent)

**The Problem:**  
Currently, if the LLM hallucinates and outputs broken JSON (e.g., missing a comma or a closing bracket) when parsing a candidate's resume, the backend throws a 500 server error and crashes the pipeline.

**The Upgrade (Self-Healing Pydantic Loop):**  
Instead of crashing, the agent will catch the parsing exception. It will then autonomously send the exact error message back to the LLM with a prompt like: *"You output invalid JSON. Fix this specific syntax error at line 4."* The agent will retry up to 3 times autonomously until it receives a perfectly structured JSON payload, drastically improving system reliability.

---

## 2. Autonomous Taxonomy Generation (Skill Gap Agent)

**The Problem:**  
The system currently relies on a hardcoded `skills_taxonomy.json`. If a user wants to target a niche, highly specialized role that isn't in the local database (such as "Quantum Computing Engineer" or "Smart Contract Developer"), the agent cannot accurately match their skills.

**The Upgrade (Web Search Capabilities):**  
We will equip the Skill Gap Agent with live internet browsing tools. If a user requests a role that is missing from the database, the agent will autonomously pause the pipeline, search the web to research industry requirements for that specific role, dynamically generate a brand new taxonomy structure, and save it to the database so it remains permanently available for future users.

---

## 3. Stateful Multi-Turn Memory (Interview Simulator Agent)

**The Problem:**  
The current mock interview process is static. The agent generates three questions at once, the user types three answers, and the system returns a final score. 

**The Upgrade (Live WebSocket Chatbot):**  
We will transition the interview simulator into a real-time, stateful conversational agent. The AI will ask one question at a time. By retaining conversational memory, it will analyze the user's live answer and dynamically pivot to ask a highly specific follow-up probe (e.g., *"You mentioned using React Hooks for state management, but could you clarify how you handle memory leaks with useEffect?"*). This creates a highly realistic, pressure-tested interview environment.

---

## 4. Parallel DAG Execution (The Orchestrator)

**The Problem:**  
The Orchestrator currently executes the pipeline synchronously in a straight, slow line:  
`Resume Analysis` ➔ `Skill Gaps` ➔ `Learning Roadmap` ➔ `Job Matches`.

**The Upgrade (Parallel Threading):**  
We will rewrite the Orchestrator to utilize Directed Acyclic Graph (DAG) execution. Because the Learning Roadmap and the Job Matching agents do not depend on each other (they both only require the output from the Skill Gap Agent), the Orchestrator can spawn both agents simultaneously in parallel threads. This architectural shift will effectively cut the user's waiting time on the loading screen in half.
