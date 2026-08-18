# CareerCompass AI

**A multi-agent, autonomous career-coaching system for computing undergraduates.**
Built for CodeSplash '26 — Agentic AI Phase | Sabaragamuwa University of Sri Lanka

---

## 1. Overview

CareerCompass AI takes a student's resume and a stated area of interest, then runs a coordinated team of five specialist agents — orchestrated end-to-end — to produce:

- A structured skill-gap report benchmarked against a target role
- A personalized, sequenced learning roadmap
- An adaptive mock interview with a readiness score
- A ranked list of matching jobs/internships with rationale

The system is **adaptive**: if the Interview Simulator Agent uncovers a gap the Skill Gap Agent missed, the Orchestrator automatically re-triggers the Learning Path Agent to revise the roadmap — no re-entry of information needed.

> Declared Autonomy Level: **Level 3 — High Autonomy**. The only required human input is the initial resume/goal upload and live interview answers; all analysis, prioritization, and planning is autonomous.

---

## 2. Agent Architecture

| Agent | Responsibility | Input | Output |
|---|---|---|---|
| **Orchestrator** | Interprets the goal, builds the execution plan, delegates tasks, resolves conflicts, triggers re-runs | User goal + agent outputs | Execution plan, final report |
| **Profile Analysis Agent** | Parses the resume into structured data | Raw resume (PDF/text) | Structured candidate profile (JSON) |
| **Skill Gap Agent** | Compares profile against target-role taxonomy | Structured profile, target role | Prioritized skill-gap list |
| **Learning Path Agent** | Builds a sequenced roadmap for the highest-priority gaps | Skill-gap list | Personalized learning roadmap |
| **Interview Simulator Agent** | Generates and evaluates role-specific interview Q&A | Profile, target role, live answers | Transcript, readiness score, newly-detected gaps |
| **Job Matching Agent** | Ranks job/internship listings against the (possibly revised) profile | Profile, updated skill data | Ranked job list with rationale |

All agents communicate through a **shared context store** (vector DB + session memory) managed by the Orchestrator — each agent reads only what it needs and writes its result back for others to use.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| LLM / AI Model | **Groq API** (fast Llama / OpenAI-OSS / other Groq-hosted models) |
| Agent Framework | CrewAI or LangChain (LangGraph) |
| Orchestration | LangGraph state machine / CrewAI Process |
| Backend | Python, FastAPI |
| Frontend | React + Tailwind CSS |
| Resume Parsing | spaCy / pdfplumber |
| Vector DB | ChromaDB or FAISS (skills taxonomy + shared context) |
| Relational DB | PostgreSQL or MySQL (structured user/session data) |
| Hosting (prototype) | Render / Railway / AWS free tier |

> **Why Groq instead of Gemini/OpenAI:** Groq's LPU inference is very fast and has a generous free tier, which suits the low-latency, multi-agent, multi-call nature of this pipeline (each agent run = at least one LLM call). Both LangChain and CrewAI support Groq as a drop-in LLM provider, so swapping providers later doesn't require rewriting agent logic.

---

## 4. Project Structure

```
careercompass-ai/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── profile_analysis_agent.py
│   │   ├── skill_gap_agent.py
│   │   ├── learning_path_agent.py
│   │   ├── interview_simulator_agent.py
│   │   └── job_matching_agent.py
│   ├── tools/
│   │   ├── resume_parser.py
│   │   ├── skills_taxonomy_db.py
│   │   └── job_course_retriever.py
│   ├── shared_store/
│   │   └── context_store.py        # vector DB + session memory wrapper
│   ├── api/
│   │   └── main.py                 # FastAPI app + REST endpoints
│   ├── data/
│   │   ├── skills_taxonomy.json    # curated role -> skill mappings
│   │   ├── sample_jobs.json
│   │   └── sample_courses.json
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

---

## 5. Setup Instructions

### 5.1 Prerequisites

- Python 3.10+
- Node.js 18+
- A Groq API key ([console.groq.com](https://console.groq.com))

### 5.2 Clone and install

```bash
git clone <your-repo-url>
cd careercompass-ai/backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

```bash
cd ../frontend
npm install
```

### 5.3 Configure the Groq API key (this is the part that changes)

Since your key **may change**, never hardcode it anywhere in the codebase. Keep it in an untracked `.env` file so swapping it is a one-line edit and nothing needs to be rebuilt or redeployed differently.

1. Copy the example env file:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Open `.env` and set your key:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile   # or whichever Groq model you're using
   ```

3. Make sure `.env` is in `.gitignore` (it should be by default in this structure) so the key never gets committed.

4. **If the key changes later:** just edit `.env` and restart the backend server — no code changes required, since every agent reads the key via `os.environ["GROQ_API_KEY"]` (or `os.getenv(...)`) at call time, never as a hardcoded string.

```python
# Example: how agents should read the key — never inline it
import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
```

If you're using LangChain's `ChatGroq` or CrewAI's LLM wrapper instead of the raw SDK, both also read `GROQ_API_KEY` from the environment automatically as long as `.env` is loaded (e.g. via `python-dotenv`), so no extra config is needed there either.

### 5.4 Run the backend

```bash
cd backend
uvicorn api.main:app --reload
```

### 5.5 Run the frontend

```bash
cd frontend
npm run dev
```

---

## 6. Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Your Groq API key. Rotate anytime by editing `.env` — no code changes needed. |
| `GROQ_MODEL` | Yes | Groq model name to use for agent reasoning (check Groq's console for current available models, as they change). |
| `DATABASE_URL` | Yes | PostgreSQL/MySQL connection string for session/user data. |
| `VECTOR_DB_PATH` | Yes | Local path or connection string for ChromaDB/FAISS. |
| `MAX_AGENT_RETRIES` | No | Cap on Orchestrator retry loops (default: 3). Prevents runaway feedback loops. |

---

## 7. Safety & Guardrails (as designed)

- **Input validation** — resumes are checked for file type/size before parsing; malformed files are rejected, not passed to the LLM.
- **Output validation** — every agent's structured output is validated against a schema before merging into the final report.
- **Hallucination control** — skill-gap and job-matching claims are grounded in the curated taxonomy/dataset, not the LLM's open-ended memory.
- **Data privacy** — resume content is processed only for the session, not retained beyond report generation.
- **No autonomous high-risk actions** — the system never submits applications or contacts employers; job matches are surfaced for the student to act on.
- **Rate limiting** — LLM/API calls are capped per session to control cost and prevent runaway loops.
- **Bounded retries** — failed agent steps retry with a capped count, then degrade gracefully with a partial result and a clear note on what failed.

---

## 8. Development Roadmap

| Stage | Milestone |
|---|---|
| 1 — Foundation | Resume parsing + Profile Analysis Agent working end-to-end |
| 2 — Core Agents | Skill Gap + Learning Path Agents integrated with the skills taxonomy |
| 3 — Interaction Layer | Interview Simulator (live Q&A) + Job Matching Agent |
| 4 — Orchestration | Orchestrator coordinating all five agents with the adaptive feedback loop |
| 5 — Polish & Testing | Frontend dashboard, benchmark testing, bug fixing |

---

## 9. References

- LangChain Documentation — https://python.langchain.com
- CrewAI Documentation — https://docs.crewai.com
- Groq API Documentation — https://console.groq.com/docs

---

## 10. Team

Sankajith D. Jinasena · P.M. Sanodya V. Jinadasa · Harol Maxilan · Mohomed Yoosuf · Mathurya Muralimohan
Sabaragamuwa University of Sri Lanka
