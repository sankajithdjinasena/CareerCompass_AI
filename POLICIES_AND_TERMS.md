# CareerCompass AI — Official Policies & Terms of Service

**Effective Date:** August 21, 2026  
**Version:** 1.0.0  
**Project:** CareerCompass AI (Team Predictra — CodeSplash '26, Sabaragamuwa University of Sri Lanka)

---

## Table of Contents
1. [Terms of Service (ToS)](#1-terms-of-service-tos)
   - [1.1 Acceptance of Terms](#11-acceptance-of-terms)
   - [1.2 Eligibility & Target Audience](#12-eligibility--target-audience)
   - [1.3 User Accounts & Authentication](#13-user-accounts--authentication)
   - [1.4 Acceptable Use & Prohibited Activities](#14-acceptable-use--prohibited-activities)
   - [1.5 Multi-Agent AI Processing & Advisory Disclaimer](#15-multi-agent-ai-processing--advisory-disclaimer)
   - [1.6 Intellectual Property Rights](#16-intellectual-property-rights)
   - [1.7 Third-Party Services & Integrations](#17-third-party-services--integrations)
   - [1.8 Limitation of Liability & Warranty Disclaimer](#18-limitation-of-liability--warranty-disclaimer)
   - [1.9 Account Termination & Suspension](#19-account-termination--suspension)
   - [1.10 Governing Law & Dispute Resolution](#110-governing-law--dispute-resolution)
2. [Privacy & Student Data Protection Policy](#2-privacy--student-data-protection-policy)
   - [2.1 Information We Collect](#21-information-we-collect)
   - [2.2 How We Use Your Data](#22-how-we-use-your-data)
   - [2.3 Multi-Agent Data Processing & Privacy Safeguards](#23-multi-agent-data-processing--privacy-safeguards)
   - [2.4 Data Storage, Retention & Security](#24-data-storage-retention--security)
   - [2.5 User Data Rights (GDPR / Student Privacy Compliance)](#25-user-data-rights-gdpr--student-privacy-compliance)
   - [2.6 Cookies & Session Management](#26-cookies--session-management)
3. [AI Ethics, Transparency & Academic Integrity Policy](#3-ai-ethics-transparency--academic-integrity-policy)
   - [3.1 Non-Determinism & Hallucination Notice](#31-non-determinism--hallucination-notice)
   - [3.2 Algorithmic Fairness & Bias Mitigation](#32-algorithmic-fairness--bias-mitigation)
   - [3.3 Closed-Loop Orchestration Transparency](#33-closed-loop-orchestration-transparency)
   - [3.4 Responsible Academic & Career Advisory Use](#34-responsible-academic--career-advisory-use)
4. [Document Export & Data Portability Policy](#4-document-export--data-portability-policy)
   - [4.1 Permitted Downloads & Export Formats](#41-permitted-downloads--export-formats)
   - [4.2 Attribution & Usage of Generated Reports](#42-attribution--usage-of-generated-reports)
5. [Contact & Governance Information](#5-contact--regulatory-information)

---

# 1. Terms of Service (ToS)

### 1.1 Acceptance of Terms
By creating an account, uploading a resume, accessing our web application, or utilizing any of the multi-agent career coaching features on CareerCompass AI ("Service", "Platform", "We", "Us"), you ("User", "Student", "Candidate") agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the platform immediately.

### 1.2 Eligibility & Target Audience
- CareerCompass AI is primarily designed for computing undergraduates, academic researchers, and job seekers aiming to assess their career readiness and bridge skill gaps.
- You must be at least 16 years of age (or have verified parental/institutional consent) to register and process your career data.

### 1.3 User Accounts & Authentication
- **Account Accuracy:** You agree to provide accurate, current, and complete registration information (full name, valid email address).
- **Credential Security:** You are responsible for safeguarding your password and account credentials. All activities conducted through your authenticated session are your sole responsibility.
- **Third-Party Sign-In:** When authenticating via Google OAuth, you grant CareerCompass AI permission to verify your email identity in accordance with Google's authentication standards.

### 1.4 Acceptable Use & Prohibited Activities
You agree that you will **NOT**:
1. Upload resumes containing malicious code, macros, viruses, trojans, or automated attack vectors.
2. Submit fraudulent, deceptive, or intentionally falsified academic and professional records to manipulate algorithmic scoring.
3. Attempt to reverse-engineer, decompile, scrape, or extract the underlying model weights, prompts, taxonomy databases, or proprietary agent workflows without prior authorization.
4. Exploit the API endpoints through high-frequency automated requests (rate limit circumvention, DDoS).
5. Use the platform for any illegal purpose or to harass, defame, or discriminate against other users or hiring institutions.

### 1.5 Multi-Agent AI Processing & Advisory Disclaimer
- CareerCompass AI deploys a coordinated pipeline of Level-3 autonomous agents (Profile Analysis, Skill Gap, Learning Path, Interview Simulator, Job Matching, and Orchestrator).
- **Advisory Only:** All scores, skill gap evaluations, learning roadmaps, mock interview critiques, and job match percentages are **strictly advisory recommendations**. 
- **No Guarantee of Employment:** We do not guarantee employment, internship placement, interview selection, or salary figures based on platform suggestions.

### 1.6 Intellectual Property Rights
- **User Content:** You retain full ownership and intellectual property rights over your uploaded resumes, written interview answers, and personal profile information.
- **Platform IP:** The design system, user interface, software code, multi-agent orchestration architecture, skills taxonomy database, and brand assets are the exclusive property of Team Predictra and CareerCompass AI.

### 1.7 Third-Party Services & Integrations
- CareerCompass AI interfaces with third-party providers including **Groq Cloud Inference**, **Google OAuth 2.0**, and external job/course catalog providers.
- External links to third-party courses (e.g., Coursera, freeCodeCamp, edX) and job boards are governed by the terms and policies of those respective third-party providers.

### 1.8 Limitation of Liability & Warranty Disclaimer
- THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
- UNDER NO CIRCUMSTANCES SHALL CAREERCOMPASS AI, TEAM PREDICTRA, OR AFFILIATED INSTITUTIONS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OR INABILITY TO USE THE PLATFORM.

### 1.9 Account Termination & Suspension
We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy, compromise platform integrity, or engage in suspicious API access. Users may request full account and data deletion at any time via Account Settings.

### 1.10 Governing Law & Dispute Resolution
These Terms shall be governed by and construed in accordance with the applicable laws of Sri Lanka, without regard to conflict of law principles. Any legal disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Sri Lanka.

---

# 2. Privacy & Student Data Protection Policy

### 2.1 Information We Collect
1. **Account Identifiers:** Full Name, Email Address, Hashed Password (salted SHA-256 / bcrypt), OAuth identifier tokens.
2. **Resume Data:** Uploaded PDF/Text resumes containing education, work history, skill listings, certifications, projects, and contact info.
3. **Career Goals & Preferences:** Target job titles, industry preferences, and career stage.
4. **Interactive Performance Records:** Live interview transcripts, speech-to-text inputs, generated evaluation metrics, readiness scores, and milestone completions.
5. **Technical Metadata:** IP addresses, browser types, session timestamps, and operational error logs.

### 2.2 How We Use Your Data
- **Profile Parsing & Skill Extraction:** Transforming raw resume text into structured candidate representations.
- **Taxonomy Benchmarking:** Computing deterministic and semantic skill overlaps using vector embeddings in ChromaDB.
- **Personalized Roadmap Generation:** Constructing tailored multi-week learning curricula targeting identified gaps.
- **Adaptive Mock Interviews:** Generating contextual technical questions and delivering objective feedback.
- **Job Matching:** Computing match relevancy against curated internship and full-time listings.

### 2.3 Multi-Agent Data Processing & Privacy Safeguards
- **In-Memory Agent Bus:** Agents communicate via an isolated session context store (`context_store.py`). Data is isolated per user session.
- **No Training on Private Resumes:** Your private resume files are processed through Groq API endpoints solely for inference. Your private resumes are **never used to train public foundation models**.
- **No Data Brokering:** We do **never sell, rent, or monetize** your personal contact details or resume data to third-party advertisers.

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

# 3. AI Ethics, Transparency & Academic Integrity Policy

### 3.1 Non-Determinism & Hallucination Notice
Large Language Models (LLMs) and probabilistic AI systems can occasionally output incomplete or inaccurate guidance. While CareerCompass AI mitigates hallucinations through **hybrid deterministic taxonomy matching**, users are advised to verify course prerequisites and employer requirements independently.

### 3.2 Algorithmic Fairness & Bias Mitigation
- Skill matching algorithms evaluate candidates strictly based on technical competencies, verifiable project evidence, and stated proficiencies.
- Demographic attributes (gender, age, ethnicity, nationality) are explicitly stripped or ignored by our parsing and matching agents.

### 3.3 Closed-Loop Orchestration Transparency
CareerCompass AI utilizes an autonomous closed-loop feedback architecture:
- When the **Interview Simulator Agent** discovers a previously undetected deficiency during technical Q&A, it notifies the **Orchestrator Agent**.
- The Orchestrator automatically commands the **Learning Path Agent** to update the student's roadmap dynamically.
- All dynamic modifications are transparently logged and visible to the student.

### 3.4 Responsible Academic & Career Advisory Use
Students are encouraged to use CareerCompass AI as a supplementary coaching instrument alongside university career guidance counselors and academic advisors.

---

# 4. Document Export & Data Portability Policy

### 4.1 Permitted Downloads & Export Formats
Users are permitted to download and export:
- **Skill Gap Summary Reports** (`.pdf`, `.json`)
- **Personalized Learning Roadmap Guides** (`.pdf`, `.md`)
- **Mock Interview Performance Dossiers** (`.pdf`, `.json`)
- **Matched Job Listings Sheets** (`.csv`, `.pdf`)

### 4.2 Attribution & Usage of Generated Reports
Downloaded career reports are for the student's personal, academic, and professional self-improvement. They may be shared with university mentors, academic supervisors, and prospective employers.

---

# 5. Contact & Governance Information

For questions regarding these Policies and Terms, or to exercise your student data rights:

- **Project:** CareerCompass AI
- **Development Team:** Team Predictra
- **Institution:** Sabaragamuwa University of Sri Lanka
- **Event:** CodeSplash '26 — Agentic AI Phase
- **Support & Privacy Inquiries:** `support@careercompass.ai` / `privacy@careercompass.ai`

*By using CareerCompass AI, you acknowledge that you have read, understood, and agreed to be bound by these Policies & Terms.*
