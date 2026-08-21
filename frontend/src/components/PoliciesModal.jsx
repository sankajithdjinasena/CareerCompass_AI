import React, { useState } from 'react';
import { 
  X, ShieldCheck, FileText, Scale, Cpu, Download, Printer, 
  Search, Check, Info, Lock, BookOpen, Award
} from 'lucide-react';

const PoliciesModal = ({ isOpen, onClose, initialTab = 'terms', onAccept }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Keep activeTab in sync when initialTab changes on open
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const content = document.getElementById('policy-content-area')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CareerCompass_AI_${activeTab.toUpperCase()}_POLICY.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: Scale },
    { id: 'privacy', label: 'Privacy & Data', icon: FileText },
    { id: 'ethics', label: 'AI Ethics & Advisory', icon: Cpu },
    { id: 'portability', label: 'Data Rights & Export', icon: BookOpen },
    { id: 'governance', label: 'Governance & Contact', icon: Award },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in font-montserrat">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-200 transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold tracking-[0.15em] text-white uppercase">
                  Legal, Policies & Student Privacy
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-medium tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded">
                  v1.0.0 Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light tracking-wider">
                CareerCompass AI · Team Predictra · Sabaragamuwa University of Sri Lanka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download Current Policy as Text"
              className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded transition-all flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export Text</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Document"
              className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded transition-all flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-all ml-1"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="border-b border-white/10 bg-transparent px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-[11px] md:text-xs tracking-wider uppercase font-medium border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Filter */}
          <div className="relative pb-2 md:pb-0 min-w-[200px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-400/50 rounded text-xs pl-8 pr-3 py-1.5 text-slate-200 placeholder:text-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Content Body */}
        <div 
          id="policy-content-area" 
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs md:text-sm text-slate-300 leading-relaxed font-light select-text"
        >
          {/* TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-200/90 text-xs flex items-start gap-3">
                <Info size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Summary:</strong> CareerCompass AI provides autonomous AI-driven skill-gap analysis, learning path recommendations, and mock interviews. By using our platform, you agree to submit legitimate career documents and respect system safety boundaries.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.1</span> Acceptance of Terms
                </h3>
                <p className="text-slate-300">
                  By creating an account, uploading a resume, accessing our web application, or utilizing any of the multi-agent career coaching features on CareerCompass AI ("Service", "Platform", "We", "Us"), you ("User", "Student", "Candidate") agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the platform immediately.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.2</span> Eligibility & Target Audience
                </h3>
                <p className="text-slate-300">
                  CareerCompass AI is structured for computing undergraduates, academic researchers, and job seekers aiming to assess career readiness and bridge skill gaps. You must be at least 16 years of age (or have verified institutional consent) to register and process career data.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.3</span> User Accounts & Authentication Security
                </h3>
                <p className="text-slate-300">
                  You agree to provide accurate, current, and complete registration information. You are responsible for safeguarding your password and account credentials. When authenticating via Google OAuth 2.0, you grant CareerCompass AI permission to verify your email identity in accordance with Google's authentication standards.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.4</span> Acceptable Use & Prohibited Activities
                </h3>
                <p className="text-slate-300 mb-2">You agree that you will strictly NOT:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300/90 marker:text-emerald-400">
                  <li>Upload resumes containing malicious macros, hidden payloads, or exploit scripts.</li>
                  <li>Submit fraudulent or intentionally falsified academic records to manipulate algorithmic scoring.</li>
                  <li>Attempt to reverse-engineer, decompile, scrape, or extract model weights, prompts, or taxonomy embeddings without authorization.</li>
                  <li>Exploit platform endpoints through high-frequency automated requests or denial-of-service attempts.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.5</span> Multi-Agent Advisory Disclaimer
                </h3>
                <p className="text-slate-300">
                  CareerCompass AI deploys a coordinated pipeline of Level-3 autonomous agents (Profile Analysis, Skill Gap, Learning Path, Interview Simulator, Job Matching, and Orchestrator). All scores, skill gap evaluations, learning roadmaps, mock interview critiques, and job match percentages are <strong className="text-white">strictly advisory recommendations</strong>. The platform does not guarantee employment or university examination results.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.6</span> Intellectual Property Rights
                </h3>
                <p className="text-slate-300">
                  <strong className="text-white">User Content:</strong> Students retain full ownership and intellectual property rights over their uploaded resumes, written interview answers, and personal profile information. <strong className="text-white">Platform IP:</strong> The software codebase, design system, taxonomy database, and multi-agent orchestration architecture belong exclusively to Team Predictra.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">1.7</span> Governing Law & Jurisdiction
                </h3>
                <p className="text-slate-300">
                  These Terms shall be governed by and construed in accordance with the applicable laws of Sri Lanka. Any legal disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Sri Lanka.
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-200/90 text-xs flex items-start gap-3">
                <Lock size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Zero Public Model Training Guarantee:</strong> Your private resume files and interview transcripts are processed strictly in-memory and isolated session stores. We <strong className="text-white">never</strong> sell your data or use your resumes to train public AI foundation models.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">2.1</span> Information We Collect
                </h3>
                <p className="text-slate-300 mb-2">We collect only information necessary to deliver career analysis:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300/90 marker:text-emerald-400">
                  <li><strong className="text-white">Account Identifiers:</strong> Name, Email Address, Hashed Passwords (salted SHA-256 / bcrypt), OAuth ID.</li>
                  <li><strong className="text-white">Resume Data:</strong> Uploaded PDF/Text resumes (education, work history, skills, certifications, projects).</li>
                  <li><strong className="text-white">Interactive Performance Records:</strong> Mock interview Q&A transcripts, score cards, and roadmap progress.</li>
                  <li><strong className="text-white">Technical Metadata:</strong> Session timestamps, essential authentication tokens.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">2.2</span> How We Use Your Data
                </h3>
                <p className="text-slate-300">
                  Your data is used exclusively to: (1) Parse and structure your candidate profile, (2) Compare your skills deterministically against industry taxonomies, (3) Build customized weekly learning roadmaps, and (4) Conduct dynamic technical mock interviews.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">2.3</span> Storage, Encryption & Security Standards
                </h3>
                <p className="text-slate-300">
                  All transmissions utilize TLS 1.3 HTTPS encryption. Passwords are salted and hashed, and session tokens use cryptographically signed JSON Web Tokens (JWT). Private resume vector representations in ChromaDB are segregated by session ID.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">2.4</span> Student Privacy Rights (GDPR & Right to Erasure)
                </h3>
                <p className="text-slate-300 mb-2">Every student holds enforceable data rights:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300/90 marker:text-emerald-400">
                  <li><strong className="text-white">Right to Access:</strong> View all extracted profile entities, skill gap reports, and interview records in real-time.</li>
                  <li><strong className="text-white">Right to Erasure ("Right to be Forgotten"):</strong> Request instant permanent deletion of your account and resume embeddings via Account Settings.</li>
                  <li><strong className="text-white">Right to Data Portability:</strong> Export complete career dossiers, roadmaps, and interview performance logs in PDF or JSON format.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">2.5</span> Cookies & Session Management
                </h3>
                <p className="text-slate-300">
                  CareerCompass AI uses essential local storage and secure session cookies solely for authentication state management. We do not deploy third-party advertising tracking cookies.
                </p>
              </div>
            </div>
          )}

          {/* AI ETHICS & DISCLAIMERS */}
          {activeTab === 'ethics' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-200/90 text-xs flex items-start gap-3">
                <Cpu size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Hybrid Deterministic Architecture:</strong> We combine deterministic taxonomy mathematics with Groq LPU inference to mathematically eliminate hallucinations and bias during candidate scoring.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">3.1</span> Anti-Hallucination & Determinism Guardrails
                </h3>
                <p className="text-slate-300">
                  Skill gap percentages and course mappings are derived from deterministic set-operations over structured taxonomy matrices, not unconstrained generative guessing. When LLMs are used (e.g. resume summarization or mock interview roleplay), responses are anchored against strict schema validation guardrails.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">3.2</span> Algorithmic Fairness & Bias Mitigation
                </h3>
                <p className="text-slate-300">
                  Candidate readiness is evaluated strictly based on verifiable technical proficiencies, project experience, and competency demonstrations. Demographic indicators (such as gender, age, ethnicity, or nationality) are explicitly stripped or ignored by our agent pipelines.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">3.3</span> Autonomous Closed-Loop Transparency
                </h3>
                <p className="text-slate-300">
                  When the Interview Simulator Agent discovers an unmastered concept during mock Q&A, the Orchestrator autonomously prompts the Learning Path Agent to revise the student's roadmap. All automated adjustments are recorded and transparently presented in the candidate's roadmap dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">3.4</span> Academic Integrity & Educational Purpose
                </h3>
                <p className="text-slate-300">
                  CareerCompass AI is built to empower self-directed learning and skill development. It is intended to complement university academic advising and career development programs.
                </p>
              </div>
            </div>
          )}

          {/* DATA PORTABILITY */}
          {activeTab === 'portability' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">4.1</span> Permitted Export Formats
                </h3>
                <p className="text-slate-300 mb-3">
                  Under our Open Student Data standard, users are free to export all platform-generated career dossiers at any time without fee or restriction:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-white font-medium text-xs mb-1">📄 Skill Gap & Benchmark Report</p>
                    <p className="text-slate-400 text-[11px]">Downloadable as structured JSON or printable summary PDF.</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-white font-medium text-xs mb-1">🗺️ Personalized Learning Roadmap</p>
                    <p className="text-slate-400 text-[11px]">Weekly milestone guides with resource links in Markdown or PDF.</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-white font-medium text-xs mb-1">🎤 Mock Interview Transcripts</p>
                    <p className="text-slate-400 text-[11px]">Full Q&A logs with agent critique scores and readiness metrics.</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded">
                    <p className="text-white font-medium text-xs mb-1">💼 Ranked Job Match Sheets</p>
                    <p className="text-slate-400 text-[11px]">Matching scores and key required qualifications in CSV/PDF.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">4.2</span> Attribution & Usage of Generated Reports
                </h3>
                <p className="text-slate-300">
                  Exported career reports are for the student's personal, academic, and professional self-improvement. They may be shared freely with university mentors, academic supervisors, and prospective employers.
                </p>
              </div>
            </div>
          )}

          {/* GOVERNANCE & CONTACT */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Project & Institutional Governance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[10px] block mb-0.5">Project</span>
                    <span className="font-medium text-slate-200">CareerCompass AI</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[10px] block mb-0.5">Development Team</span>
                    <span className="font-medium text-slate-200">Team Predictra</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[10px] block mb-0.5">Academic Institution</span>
                    <span className="font-medium text-slate-200">Sabaragamuwa University of Sri Lanka</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-widest text-[10px] block mb-0.5">Event Edition</span>
                    <span className="font-medium text-slate-200">CodeSplash '26 — Agentic AI Phase</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">5.1</span> Privacy & Compliance Contact
                </h3>
                <p className="text-slate-300 leading-relaxed mb-3">
                  For inquiries regarding data protection, exercising your student privacy rights, or reporting security vulnerabilities:
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-300 text-xs">
                    📧 Support: <span className="font-mono text-white">predictrasusl@gmail.com</span>
                  </div>
                  <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-300 text-xs">
                    🔒 Privacy Officer: <span className="font-mono text-white">predictrasusl@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-transparent flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Official Policy · Effective August 21, 2026</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                I Agree & Accept
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded text-xs font-medium tracking-wide uppercase transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PoliciesModal;
