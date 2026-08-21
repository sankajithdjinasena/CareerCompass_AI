# CareerCompass AI — Complete Policies & Terms of Service

**Effective Date:** August 21, 2026  
**Version:** 1.0.0  
**Project:** CareerCompass AI  
**Team:** Team Predictra · Sabaragamuwa University of Sri Lanka (CodeSplash '26)  

---

## 1. Terms of Service (ToS)

### 1.1 Acceptance of Terms
By creating an account, uploading a resume, accessing our web application, or utilizing any of the multi-agent career coaching features, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the platform immediately.

### 1.2 Eligibility & Target Audience
- CareerCompass AI is built for computing undergraduates, academic researchers, and job seekers aiming to assess career readiness and bridge skill gaps.
- Users must be at least 16 years of age (or have verified institutional/parental consent).

### 1.3 User Accounts & Authentication
- **Account Accuracy:** You must provide accurate, current, and complete registration information (full name, valid email address).
- **Credential Security:** You are responsible for safeguarding your password and account credentials.
- **Third-Party Sign-In:** When authenticating via Google OAuth, you grant CareerCompass AI permission to verify your email identity in accordance with Google's authentication standards.

### 1.4 Acceptable Use & Prohibited Activities
You agree NOT to:
- Upload resumes or files containing malicious code, macros, viruses, trojans, or automated attack vectors.
- Submit fraudulent, deceptive, or intentionally falsified academic/work records to manipulate algorithmic scoring.
- Attempt to reverse-engineer, decompile, scrape, or extract model weights, prompts, taxonomy databases, or proprietary multi-agent workflows without authorization.
- Exploit API endpoints through high-frequency automated requests (rate limit circumvention, DDoS).
- Use the platform for any unlawful purpose or to harass, defame, or discriminate against other individuals or hiring institutions.

### 1.5 Autonomous Multi-Agent AI Advisory Disclaimer
CareerCompass AI deploys a coordinated pipeline of 6 Level-3 autonomous agents (Profile Analysis, Skill Gap, Learning Path, Interview Simulator, Job Matching, and Orchestrator).
- **Advisory Only:** All scores, skill gap evaluations, learning roadmaps, mock interview critiques, and job match percentages are strictly advisory recommendations.
- **No Guarantee of Employment:** The platform does not guarantee job placement, internship offers, interview selection, or specific compensation packages.

### 1.6 Intellectual Property Rights
- **User Content:** You retain full ownership and intellectual property rights over your uploaded resumes, written interview answers, and personal profile information.
- **Platform IP:** The design system, user interface, software code, multi-agent orchestration architecture, skills taxonomy database, and brand assets are the exclusive property of Team Predictra and CareerCompass AI.

### 1.7 Third-Party Services & Integrations
- The platform interfaces with external providers including Groq Cloud Inference, Google OAuth 2.0, and external job/course catalogs.
- External links to third-party courses (e.g., Coursera, freeCodeCamp, edX) and job boards are governed by the terms and policies of those respective third-party providers.

### 1.8 Limitation of Liability & Warranty Disclaimer
THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. UNDER NO CIRCUMSTANCES SHALL CAREERCOMPASS AI, TEAM PREDICTRA, OR AFFILIATED INSTITUTIONS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OR INABILITY TO USE THE PLATFORM.

### 1.9 Account Termination & Suspension
We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy, compromise platform integrity, or engage in suspicious API access. Users may request full account and data deletion at any time via Account Settings.

### 1.10 Governing Law & Dispute Resolution
These Terms are governed by and construed in accordance with the applicable laws of Sri Lanka. Any legal disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Sri Lanka.

---

## 2. Privacy & Student Data Protection Policy

### 2.1 Information We Collect
- **Account Identifiers:** Full Name, Email Address, Salted/Hashed Password, OAuth identifier tokens.
- **Resume Data:** Uploaded PDF/Text resumes containing education, work history, skill listings, certifications, projects, and contact info.
- **Career Goals & Preferences:** Target job titles, industry preferences, and career stage.
- **Interactive Performance Records:** Live interview transcripts, speech-to-text inputs, generated evaluation metrics, readiness scores, and milestone completions.
- **Technical Metadata:** IP addresses, browser types, session timestamps, and operational error logs.

### 2.2 How We Use Your Data
- **Profile Parsing & Skill Extraction:** Transforming raw resume text into structured candidate representations.
- **Taxonomy Benchmarking:** Computing deterministic and semantic skill overlaps using vector embeddings in ChromaDB.
- **Personalized Roadmap Generation:** Constructing tailored multi-week learning curricula targeting identified gaps.
- **Adaptive Mock Interviews:** Generating contextual technical questions and delivering objective feedback.
- **Job Matching:** Computing match relevancy against curated internship and full-time listings.

### 2.3 Multi-Agent Data Processing & Privacy Safeguards
- **In-Memory Agent Bus:** Agents communicate via an isolated session context store (`context_store.py`). Data is strictly isolated per user session.
- **No Training on Private Resumes:** Uploaded resume files are processed through Groq API endpoints solely for real-time inference. Your private resumes are never used to train public foundation models.
- **No Data Brokering:** We do never sell, rent, or monetize your personal contact details or resume data to third-party advertisers.

### 2.4 Data Storage, Retention & Security
- **Encryption:** All client-server communications are transmitted over secure HTTPS (TLS 1.3).
- **Authentication:** Token-based JWT authentication with strictly enforced expiration windows.
- **Retention Period:** Active user resumes and interview transcripts are retained for the duration of the user's active account. If an account is inactive for more than 12 months, or upon explicit deletion request, all associated vector embeddings and resume records are purged from the database.

### 2.5 User Data Rights (Student Privacy & GDPR Compliance)
Users have the following enforceable rights:
- **Right to Access:** View all extracted profile entities, skill gap reports, and interview records in the dashboard.
- **Right to Rectification:** Update personal profile details or re-upload a revised resume at any time.
- **Right to Erasure ("Right to be Forgotten"):** Request full deletion of account, resumes, and session history via Account Settings.
- **Right to Data Portability:** Download full career dossiers, roadmaps, and interview transcripts in PDF or JSON format.

### 2.6 Cookies & Session Management
CareerCompass AI uses essential local storage and secure session cookies solely for user authentication state management. We do not deploy third-party advertising tracking cookies.

---

## 3. AI Ethics, Transparency & Academic Integrity Policy

### 3.1 Non-Determinism & Hallucination Notice
Large Language Models (LLMs) and probabilistic AI systems can occasionally output incomplete or inaccurate guidance. While CareerCompass AI mitigates hallucinations through hybrid deterministic taxonomy matching, users are advised to verify course prerequisites and employer requirements independently.

### 3.2 Algorithmic Fairness & Bias Mitigation
- Skill matching algorithms evaluate candidates strictly based on technical competencies, verifiable project evidence, and stated proficiencies.
- Demographic attributes (gender, age, ethnicity, nationality) are explicitly stripped or ignored by our parsing and matching agents.

### 3.3 Closed-Loop Orchestration Transparency
CareerCompass AI utilizes an autonomous closed-loop feedback architecture:
- When the Interview Simulator Agent discovers a previously undetected deficiency during technical Q&A, it notifies the Orchestrator Agent.
- The Orchestrator automatically commands the Learning Path Agent to update the student's roadmap dynamically.
- All dynamic modifications are transparently logged and visible to the student.

### 3.4 Responsible Academic & Career Advisory Use
Students are encouraged to use CareerCompass AI as a supplementary coaching instrument alongside university career guidance counselors and academic advisors.

---

## 4. Document Export & Data Portability Policy

### 4.1 Permitted Downloads & Export Formats
Users are permitted to download and export:
- Skill Gap Summary Reports (.pdf, .json)
- Personalized Learning Roadmap Guides (.pdf, .md)
- Mock Interview Performance Dossiers (.pdf, .json)
- Matched Job Listings Sheets (.csv, .pdf)

### 4.2 Attribution & Usage of Generated Reports
Downloaded career reports are for the student's personal, academic, and professional self-improvement. They may be shared with university mentors, academic supervisors, and prospective employers.

---

## 5. Contact & Governance Information
For questions regarding these Policies and Terms, or to exercise your student data rights:

- **Project:** CareerCompass AI
- **Development Team:** Team Predictra
- **Institution:** Sabaragamuwa University of Sri Lanka
- **Event:** CodeSplash '26 — Agentic AI Phase
- **Support & Privacy Inquiries:** predictrasusl@gmail.com / predictrasusl@gmail.com
