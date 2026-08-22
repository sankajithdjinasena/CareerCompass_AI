import React, { useState } from 'react';
import { 
  Play, Bot, Target, FileText, CheckCircle, ShieldCheck, 
  Lock, Scale, Cpu, BookOpen, Award, ArrowUpRight, ChevronRight,
  Search, Map, Mic, Briefcase, Settings, Upload, BrainCircuit, Sun, Moon
} from 'lucide-react';
import PoliciesModal from './PoliciesModal';
import { useTheme } from '../lib/ThemeContext';

const LandingPage = ({ onGetStarted, onNavigate }) => {
  const [showPolicies, setShowPolicies] = useState(false);
  const [policiesTab, setPoliciesTab] = useState('terms');
  const { theme, toggleTheme } = useTheme();
  const nav = onNavigate || onGetStarted;

  const openPolicy = (tab = 'terms') => {
    setPoliciesTab(tab);
    setShowPolicies(true);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
          
          .font-montserrat {
            font-family: 'Montserrat', sans-serif;
          }
          
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 35s linear infinite;
          }
        `}
      </style>
      <div className="min-h-screen font-montserrat flex flex-col relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden">
        
        {/* Background Ambient Accents */}
        {theme === 'dark' ? (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center relative z-10 text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="hidden md:flex gap-8 lg:gap-12 items-center">
            <span className="cursor-pointer hover:text-brand-600 dark:hover:text-white transition-colors" onClick={() => onNavigate && onNavigate('contact')}>Contact</span>
            <button 
              type="button" 
              onClick={() => openPolicy('terms')}
              className="uppercase tracking-wider hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-bold"
            >
              Policies & Legal
            </button>
          </div>

          {/* Logo Center */}
          <div 
            className="flex items-center justify-center gap-2 text-slate-900 dark:text-white cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="CareerCompass AI Home"
          >
             <div className="w-9 h-9 bg-brand-500 text-white rounded-lg flex items-center justify-center shadow-md">
               <Bot size={22} />
             </div>
             <span className="font-extrabold text-base tracking-widest uppercase">CareerCompass</span>
          </div>

          <div className="flex gap-4 lg:gap-8 items-center">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            <span 
              className="hidden md:block cursor-pointer hover:text-brand-600 dark:hover:text-white transition-colors" 
              onClick={() => nav('register')}
            >
              Register
            </span>
            <button
              onClick={() => nav('login')}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all rounded-lg tracking-wider shadow"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 relative z-10 text-center mt-12 md:mt-16">

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase mb-4 text-slate-900 dark:text-white">
            CareerCompass <span className="text-brand-600 dark:text-brand-400">AI</span>
          </h1>

          <p className="text-xs md:text-sm tracking-widest uppercase text-slate-600 dark:text-slate-300 mb-12 font-bold max-w-xl">
            Powered by Autonomous Multi-Agent AI Architecture
          </p>

          {/* Play Button - acts as Get Started */}
          <button
            onClick={onGetStarted}
            className="w-20 h-20 md:w-24 md:h-24 bg-brand-600 hover:bg-brand-700 text-white rounded-3xl flex items-center justify-center transition-all group mb-12 shadow-xl cursor-pointer"
            title="Get Started Now"
          >
            <Play size={36} className="fill-white ml-1 group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Tagline Content */}
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
            Your Autonomous Career Coach
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
            Upload your resume and let our team of 6 specialized AI agents analyze your skills, build a personalized learning roadmap, and prepare you with mock interviews.
          </p>

          {/* Job Roles Marquee Slider */}
          <div className="w-full overflow-hidden mt-12 mb-16 relative max-w-5xl mx-auto">
            {/* Gradient Edges */}
            <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>

            <div className="flex w-max animate-marquee gap-4 items-center pr-4 hover:[animation-play-state:paused]">
              {[
                "Data Scientist", "Machine Learning Engineer", "Data Analyst", "Data Engineer",
                "Full Stack Developer", "Backend Developer", "Frontend Developer",
                "Database Administrator", "QA Engineer", "UI/UX Designer", "Business Analyst",
                "Accountant", "Cloud Engineer", "Mobile App Developer", "Cybersecurity Analyst", "Product Manager",
                "Data Scientist", "Machine Learning Engineer", "Data Analyst", "Data Engineer",
                "Full Stack Developer", "Backend Developer", "Frontend Developer",
                "Database Administrator", "QA Engineer", "UI/UX Designer", "Business Analyst",
                "Accountant", "Cloud Engineer", "Mobile App Developer", "Cybersecurity Analyst", "Product Manager"
              ].map((role, idx) => (
                <div key={idx} className="whitespace-nowrap text-slate-800 dark:text-slate-200 font-bold text-xs tracking-wider uppercase px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  {role}
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full pb-16">
            {[
              { icon: <FileText size={26} />, title: "Resume Analysis", desc: "Instantly parse and structure your skills and experience with zero data training." },
              { icon: <Target size={26} />, title: "Skill Gap Detection", desc: "Compare your profile deterministically against industry taxonomies." },
              { icon: <CheckCircle size={26} />, title: "Mock Interviews", desc: "Sharpen answers with adaptive AI-generated technical questions and feedback." }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-brand-500 flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-sm font-extrabold tracking-wider uppercase mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* ── How It Works ── */}
        <section className="relative z-10 py-20 px-6 text-center bg-white dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-xs tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2 font-bold">Simple Process</p>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-white mb-16">How It Works</h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", title: "Upload Your Resume", desc: "Drop your PDF resume into the platform. Our Profile Analysis Agent reads and structures your skills and experience securely.", icon: <Upload size={28} className="text-brand-500" /> },
              { step: "02", title: "AI Analysis & Skill Mapping", desc: "6 specialized agents collaborate detecting skill gaps, ranking job matches, and building a personalized learning roadmap.", icon: <BrainCircuit size={28} className="text-brand-500" /> },
              { step: "03", title: "Get Hired & Practice", desc: "Receive your ranked job matches, custom learning roadmap, and sharpen your skills with adaptive AI mock interviews.", icon: <Target size={28} className="text-brand-500" /> },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 relative">
                <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center mb-4 shadow-sm">
                  {item.icon}
                </div>
                <p className="text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 font-extrabold mb-1">{item.step}</p>
                <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Meet the Agents ── */}
        <section className="relative z-10 py-20 px-6 text-center border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors">
          <p className="text-xs tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2 font-bold">Behind the Scenes</p>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-white mb-4">Meet the Agents</h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs font-medium max-w-xl mx-auto mb-16">Your autonomous AI team — each agent is a specialist, working together to build your complete career strategy.</p>

          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Profile Analysis Agent", role: "The Reader", desc: "Parses your raw PDF resume into a clean, structured JSON profile using Groq LLM inference.", tag: "LLM Powered", icon: <Search size={24} className="text-brand-500" /> },
              { name: "Skill Gap Agent", role: "The Strategist", desc: "Runs deterministic set-math against the skills taxonomy to find exactly what you are missing for your target role.", tag: "Deterministic", icon: <Scale size={24} className="text-brand-500" /> },
              { name: "Learning Path Agent", role: "The Mentor", desc: "Searches the course database and builds a sequenced roadmap — only calls the LLM when a resource isn't found locally.", tag: "Hybrid", icon: <Map size={24} className="text-brand-500" /> },
              { name: "Interview Simulator", role: "The Coach", desc: "Generates adaptive, role-specific Q&A sessions and scores your readiness based on your answers.", tag: "LLM Powered", icon: <Mic size={24} className="text-brand-500" /> },
              { name: "Job Matching Agent", role: "The Recruiter", desc: "Scores every job in the database using skill-intersection math and role-category bonuses to rank your best matches.", tag: "Deterministic", icon: <Briefcase size={24} className="text-brand-500" /> },
              { name: "Orchestrator", role: "The Commander", desc: "Coordinates all five agents, resolves conflicts, and triggers re-runs if the Interview Agent finds a gap that was missed.", tag: "Core Logic", icon: <Settings size={24} className="text-brand-500" /> },
            ].map((agent, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-left shadow-sm hover:shadow-md transition-all">
                <div className="mb-4">{agent.icon}</div>
                <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-900 dark:text-white mb-1">{agent.name}</h3>
                <p className="text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 font-bold">{agent.role}</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium mb-5">{agent.desc}</p>
                <span className="text-xs font-bold tracking-wider uppercase border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 rounded-md">{agent.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Comprehensive Modern Footer ── */}
        <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-montserrat">
          
          {/* Top Footer Columns */}
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Column 1: Brand & Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 dark:text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-8 h-8 rounded bg-brand-500 text-white flex items-center justify-center shadow">
                  <Bot size={18} />
                </div>
                <span className="text-sm font-extrabold tracking-widest uppercase">CareerCompass</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Autonomous Multi-Agent AI career coaching platform. Empowering computing undergraduates with deterministic skill benchmarks, dynamic roadmaps, and adaptive mock interviews.
              </p>
              <div className="pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck size={16} /> Student Privacy & Data Protected
              </div>
            </div>

            {/* Column 2: Platform Capabilities */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                <li>
                  <button onClick={() => nav('register')} className="hover:text-brand-600 dark:hover:text-white transition-colors text-left">
                    Profile Analysis & Skill Extraction
                  </button>
                </li>
                <li>
                  <button onClick={() => nav('register')} className="hover:text-brand-600 dark:hover:text-white transition-colors text-left">
                    Deterministic Skill Gap Matrix
                  </button>
                </li>
                <li>
                  <button onClick={() => nav('register')} className="hover:text-brand-600 dark:hover:text-white transition-colors text-left">
                    Autonomous Learning Roadmap
                  </button>
                </li>
                <li>
                  <button onClick={() => nav('register')} className="hover:text-brand-600 dark:hover:text-white transition-colors text-left">
                    Adaptive Technical Mock Interviews
                  </button>
                </li>
                <li>
                  <button onClick={() => nav('register')} className="hover:text-brand-600 dark:hover:text-white transition-colors text-left">
                    Job Match Intersection Scoring
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Trust */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Policies & Trust</h4>
              <ul className="space-y-2.5 text-xs font-semibold">
                <li>
                  <button 
                    onClick={() => openPolicy('terms')} 
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Scale size={14} className="text-slate-400" /> Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openPolicy('privacy')} 
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <FileText size={14} className="text-slate-400" /> Privacy & Student Data
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openPolicy('ethics')} 
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Cpu size={14} className="text-slate-400" /> AI Ethics & Guardrails
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openPolicy('portability')} 
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <BookOpen size={14} className="text-slate-400" /> Data Rights & Portability
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openPolicy('governance')} 
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <Award size={14} className="text-slate-400" /> Governance & Contacts
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Institutional Attribution */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Institution</h4>
              <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                <p className="text-slate-900 dark:text-white font-bold">Team Predictra</p>
                <p>Faculty of Applied Sciences</p>
                <p>Sabaragamuwa University of Sri Lanka</p>
                <p className="text-xs text-slate-500 pt-1 font-bold">CodeSplash '26 · Agentic AI Phase</p>
                <div className="pt-3">
                  <button
                    onClick={() => nav('register')}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 shadow"
                  >
                    Get Started Free <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 md:px-12 py-6 text-xs tracking-wider uppercase font-bold flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              &copy; 2026 CareerCompass AI · Team Predictra · Sabaragamuwa University of Sri Lanka
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 font-semibold">
              <button onClick={() => openPolicy('terms')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Terms of Service
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button onClick={() => openPolicy('privacy')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Privacy Policy
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button onClick={() => openPolicy('ethics')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                AI Ethics
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button onClick={() => openPolicy('governance')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Support
              </button>
            </div>
          </div>
        </footer>

        {/* Legal & Policies Modal */}
        <PoliciesModal
          isOpen={showPolicies}
          onClose={() => setShowPolicies(false)}
          initialTab={policiesTab}
        />
      </div>
    </>
  );
};

export default LandingPage;
