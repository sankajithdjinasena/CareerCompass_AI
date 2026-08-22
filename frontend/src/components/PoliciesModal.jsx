import React, { useState, useMemo } from 'react';
import { 
  X, ShieldCheck, FileText, Scale, Cpu, Download, Printer, 
  Search, Check, Info, Lock, BookOpen, Award, Map, Mic, Briefcase, Mail, FileJson
} from 'lucide-react';

const POLICIES_DATA = [
  // TERMS OF SERVICE (terms)
  {
    id: 'terms-summary',
    tabId: 'terms',
    isSummary: true,
    title: 'Terms Summary',
    icon: Info,
    text: 'CareerCompass AI provides autonomous AI-driven skill-gap analysis, learning path recommendations, and mock interviews. By using our platform, you agree to submit legitimate career documents and respect system safety boundaries.'
  },
  {
    id: 'terms-1.1',
    tabId: 'terms',
    clauseNumber: '1.1',
    title: 'Acceptance of Terms',
    text: 'By creating an account, uploading a resume, accessing our web application, or utilizing any of the multi-agent career coaching features on CareerCompass AI ("Service", "Platform", "We", "Us"), you ("User", "Student", "Candidate") agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the platform immediately.'
  },
  {
    id: 'terms-1.2',
    tabId: 'terms',
    clauseNumber: '1.2',
    title: 'Eligibility & Target Audience',
    text: 'CareerCompass AI is structured for computing undergraduates, academic researchers, and job seekers aiming to assess career readiness and bridge skill gaps. You must be at least 16 years of age (or have verified institutional consent) to register and process career data.'
  },
  {
    id: 'terms-1.3',
    tabId: 'terms',
    clauseNumber: '1.3',
    title: 'User Accounts & Authentication Security',
    text: 'You agree to provide accurate, current, and complete registration information. You are responsible for safeguarding your password and account credentials. When authenticating via Google OAuth 2.0, you grant CareerCompass AI permission to verify your email identity in accordance with Google\'s authentication standards.'
  },
  {
    id: 'terms-1.4',
    tabId: 'terms',
    clauseNumber: '1.4',
    title: 'Acceptable Use & Prohibited Activities',
    text: 'You agree that you will strictly NOT: (1) Upload resumes containing malicious macros, hidden payloads, or exploit scripts. (2) Submit fraudulent or intentionally falsified academic records to manipulate algorithmic scoring. (3) Attempt to reverse-engineer, decompile, scrape, or extract model weights, prompts, or taxonomy embeddings without authorization. (4) Exploit platform endpoints through high-frequency automated requests or denial-of-service attempts.'
  },
  {
    id: 'terms-1.5',
    tabId: 'terms',
    clauseNumber: '1.5',
    title: 'Multi-Agent Advisory Disclaimer',
    text: 'CareerCompass AI deploys a coordinated pipeline of Level-3 autonomous agents (Profile Analysis, Skill Gap, Learning Path, Interview Simulator, Job Matching, and Orchestrator). All scores, skill gap evaluations, learning roadmaps, mock interview critiques, and job match percentages are strictly advisory recommendations. The platform does not guarantee employment or university examination results.'
  },
  {
    id: 'terms-1.6',
    tabId: 'terms',
    clauseNumber: '1.6',
    title: 'Intellectual Property Rights',
    text: 'User Content: Students retain full ownership and intellectual property rights over their uploaded resumes, written interview answers, and personal profile information. Platform IP: The software codebase, design system, taxonomy database, and multi-agent orchestration architecture belong exclusively to Team Predictra.'
  },
  {
    id: 'terms-1.7',
    tabId: 'terms',
    clauseNumber: '1.7',
    title: 'Governing Law & Jurisdiction',
    text: 'These Terms shall be governed by and construed in accordance with the applicable laws of Sri Lanka. Any legal disputes arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in Sri Lanka.'
  },

  // PRIVACY POLICY (privacy)
  {
    id: 'privacy-summary',
    tabId: 'privacy',
    isSummary: true,
    title: 'Zero Public Model Training Guarantee',
    icon: Lock,
    text: 'Your private resume files and interview transcripts are processed strictly in-memory and isolated session stores. We never sell your data or use your resumes to train public AI foundation models.'
  },
  {
    id: 'privacy-2.1',
    tabId: 'privacy',
    clauseNumber: '2.1',
    title: 'Information We Collect',
    text: 'We collect only information necessary to deliver career analysis: Account Identifiers (Name, Email, Hashed Passwords, OAuth ID), Resume Data (PDF/Text resumes, education, work history, skills, certifications), Interactive Performance Records (mock interview transcripts, scores, roadmap progress), and Technical Metadata.'
  },
  {
    id: 'privacy-2.2',
    tabId: 'privacy',
    clauseNumber: '2.2',
    title: 'How We Use Your Data',
    text: 'Your data is used exclusively to: (1) Parse and structure your candidate profile, (2) Compare your skills deterministically against industry taxonomies, (3) Build customized weekly learning roadmaps, and (4) Conduct dynamic technical mock interviews.'
  },
  {
    id: 'privacy-2.3',
    tabId: 'privacy',
    clauseNumber: '2.3',
    title: 'Storage, Encryption & Security Standards',
    text: 'All transmissions utilize TLS 1.3 HTTPS encryption. Passwords are salted and hashed, and session tokens use cryptographically signed JSON Web Tokens (JWT). Private resume vector representations in ChromaDB are segregated by session ID.'
  },
  {
    id: 'privacy-2.4',
    tabId: 'privacy',
    clauseNumber: '2.4',
    title: 'Student Privacy Rights (GDPR & Right to Erasure)',
    text: 'Every student holds enforceable data rights: Right to Access (view profile entities and reports in real-time), Right to Erasure / Right to be Forgotten (permanent deletion of account and resume embeddings via Settings), and Right to Data Portability (export career dossiers, roadmaps, and transcripts in PDF/JSON).'
  },
  {
    id: 'privacy-2.5',
    tabId: 'privacy',
    clauseNumber: '2.5',
    title: 'Cookies & Session Management',
    text: 'CareerCompass AI uses essential local storage and secure session cookies solely for authentication state management. We do not deploy third-party advertising tracking cookies.'
  },

  // AI ETHICS & ADVISORY (ethics)
  {
    id: 'ethics-summary',
    tabId: 'ethics',
    isSummary: true,
    title: 'Hybrid Deterministic Architecture',
    icon: Cpu,
    text: 'We combine deterministic taxonomy mathematics with Groq LPU inference to mathematically eliminate hallucinations and bias during candidate scoring.'
  },
  {
    id: 'ethics-3.1',
    tabId: 'ethics',
    clauseNumber: '3.1',
    title: 'Anti-Hallucination & Determinism Guardrails',
    text: 'Skill gap percentages and course mappings are derived from deterministic set-operations over structured taxonomy matrices, not unconstrained generative guessing. Responses are anchored against strict schema validation guardrails.'
  },
  {
    id: 'ethics-3.2',
    tabId: 'ethics',
    clauseNumber: '3.2',
    title: 'Algorithmic Fairness & Bias Mitigation',
    text: 'Candidate readiness is evaluated strictly based on verifiable technical proficiencies, project experience, and competency demonstrations. Demographic indicators (gender, age, ethnicity, nationality) are explicitly stripped or ignored by our agent pipelines.'
  },
  {
    id: 'ethics-3.3',
    tabId: 'ethics',
    clauseNumber: '3.3',
    title: 'Autonomous Closed-Loop Transparency',
    text: 'When the Interview Simulator Agent discovers an unmastered concept during mock Q&A, the Orchestrator autonomously prompts the Learning Path Agent to revise the student\'s roadmap. All automated adjustments are recorded and transparently presented.'
  },
  {
    id: 'ethics-3.4',
    tabId: 'ethics',
    clauseNumber: '3.4',
    title: 'Academic Integrity & Educational Purpose',
    text: 'CareerCompass AI is built to empower self-directed learning and skill development. It is intended to complement university academic advising and career development programs.'
  },

  // DATA RIGHTS & PORTABILITY (portability)
  {
    id: 'portability-4.1',
    tabId: 'portability',
    clauseNumber: '4.1',
    title: 'Permitted Export Formats',
    text: 'Under our Open Student Data standard, users are free to export all platform-generated career dossiers at any time without fee or restriction: Skill Gap & Benchmark Report (JSON/PDF), Personalized Learning Roadmap (Markdown/PDF), Mock Interview Transcripts (Full Q&A logs & readiness scores), and Ranked Job Match Sheets (CSV/PDF).'
  },
  {
    id: 'portability-4.2',
    tabId: 'portability',
    clauseNumber: '4.2',
    title: 'Attribution & Usage of Generated Reports',
    text: 'Exported career reports are for the student\'s personal, academic, and professional self-improvement. They may be shared freely with university mentors, academic supervisors, and prospective employers.'
  },

  // GOVERNANCE & CONTACT (governance)
  {
    id: 'governance-5.1',
    tabId: 'governance',
    clauseNumber: '5.1',
    title: 'Project & Institutional Governance',
    text: 'CareerCompass AI is developed by Team Predictra from the Faculty of Applied Sciences, Sabaragamuwa University of Sri Lanka, for CodeSplash \'26 — Agentic AI Phase.'
  },
  {
    id: 'governance-5.2',
    tabId: 'governance',
    clauseNumber: '5.2',
    title: 'Privacy & Compliance Contact',
    text: 'For inquiries regarding data protection, exercising your student privacy rights, or reporting security vulnerabilities, contact our support & privacy team at predictrasusl@gmail.com.'
  }
];

const PoliciesModal = ({ isOpen, onClose, initialTab = 'terms', onAccept }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter clauses live based on searchQuery
  const filteredClauses = POLICIES_DATA.filter((item) => {
    if (!searchQuery.trim()) return item.tabId === activeTab;
    const query = searchQuery.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(query);
    const matchText = item.text.toLowerCase().includes(query);
    const matchClause = item.clauseNumber ? item.clauseNumber.includes(query) : false;
    return matchTitle || matchText || matchClause;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/60 backdrop-blur-md animate-fade-in font-montserrat">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400 rounded-lg shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-extrabold tracking-wider text-slate-900 dark:text-white uppercase">
                  Legal, Policies & Student Privacy
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                CareerCompass AI · Team Predictra · Sabaragamuwa University of Sri Lanka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download Current Policy as Text"
              className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-all flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export Text</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Document"
              className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-all flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all ml-1"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 md:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 py-2.5">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = !searchQuery && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-3 py-2 text-xs tracking-wider uppercase font-bold rounded-lg transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search Bar with Perfect Alignment */}
          <div className="relative min-w-[220px] flex items-center">
            <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-brand-500 rounded-lg text-xs pl-9 pr-8 py-2 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all font-medium shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div 
          id="policy-content-area" 
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium select-text"
        >
          {searchQuery && (
            <div className="p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl text-brand-900 dark:text-brand-200 text-xs font-semibold flex justify-between items-center">
              <span>Showing search results for "<strong>{searchQuery}</strong>" ({filteredClauses.length} clauses matched)</span>
              <button onClick={() => setSearchQuery('')} className="underline hover:text-brand-600 font-bold">Clear Search</button>
            </div>
          )}

          {filteredClauses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Search size={36} className="text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching policy clauses found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try searching for keywords like "GDPR", "privacy", "resume", "ethics", or "terms".</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs font-bold transition"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredClauses.map((clause) => {
              if (clause.isSummary) {
                const SummaryIcon = clause.icon || Info;
                return (
                  <div key={clause.id} className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 text-brand-900 dark:text-brand-200 text-xs flex items-start gap-3">
                    <SummaryIcon size={18} className="text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>{clause.title}:</strong> {clause.text}
                    </p>
                  </div>
                );
              }

              return (
                <div key={clause.id} className="space-y-1.5 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {clause.clauseNumber && (
                      <span className="text-brand-600 dark:text-brand-400 font-mono text-sm">{clause.clauseNumber}</span>
                    )}
                    <span>{clause.title}</span>
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                    {clause.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Official Policy · Effective August 21, 2026</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                I Agree & Accept
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer"
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
