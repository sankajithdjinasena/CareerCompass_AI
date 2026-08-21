import React from 'react';
import { Play, Bot, Target, FileText, CheckCircle } from 'lucide-react';

const LandingPage = ({ onGetStarted, onNavigate }) => {
  const nav = onNavigate || onGetStarted;
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap');
          
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
      <div 
        className="min-h-screen font-montserrat text-white flex flex-col relative bg-slate-900 bg-cover bg-center overflow-x-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900 pointer-events-none"></div>

        {/* Header matching image style */}
        <header className="px-6 md:px-12 py-8 flex justify-between items-center relative z-10 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-slate-200">
          <div className="hidden md:flex gap-12">
            <span className="cursor-pointer hover:text-white transition-colors">Our Story</span>
            <span className="cursor-pointer hover:text-white transition-colors">SolutionLab</span>
            <span className="cursor-pointer hover:text-white transition-colors">Clients</span>
          </div>
          
          {/* Logo Center */}
          <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 text-white">
             <Bot size={32} className="opacity-90" />
          </div>

          <div className="flex gap-12 items-center">
            <span className="hidden md:block cursor-pointer hover:text-white transition-colors" onClick={() => nav('register')}>Register</span>
            <span className="hidden md:block cursor-pointer hover:text-white transition-colors">Blog</span>
            <button
              onClick={() => nav('login')}
              className="px-6 py-2 border border-slate-400 hover:border-white hover:bg-white hover:text-slate-900 transition-all rounded-sm tracking-widest"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 relative z-10 text-center mt-12 md:mt-20">
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-[0.3em] uppercase mb-4 text-white drop-shadow-2xl ml-[0.3em]">
            CareerCompass
          </h1>
          
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-slate-300 mb-16 font-light ml-[0.4em]">
            Powered by Multi-Agent AI Architecture
          </p>
          
          {/* Play Button - acts as Get Started */}
          <button 
            onClick={onGetStarted}
            className="w-20 h-20 md:w-28 md:h-28 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center transition-all group mb-16 shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10"
            title="Get Started Now"
          >
            <Play size={40} className="text-white fill-white ml-2 group-hover:scale-110 transition-transform opacity-90" />
          </button>
          
          {/* Original Content preserved below */}
          <h2 className="text-xl md:text-3xl font-light tracking-wide mb-4">
            Your Autonomous Career Coach
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
            Upload your resume and let our team of 5 specialized AI agents analyze your skills, build a personalized learning roadmap, and prepare you with mock interviews.
          </p>

          {/* Job Roles Marquee Slider */}
          <div className="w-full overflow-hidden mt-16 mb-16 relative max-w-5xl mx-auto">
            {/* Gradient Edges for smooth fade effect matching new dark bg */}
            <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex w-max animate-marquee gap-6 items-center pr-6 hover:[animation-play-state:paused]">
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
                <div key={idx} className="whitespace-nowrap text-slate-300 font-light text-[10px] md:text-xs tracking-widest uppercase px-6 py-3 bg-white/5 rounded-none border border-white/10 backdrop-blur-md">
                  {role}
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full pb-20">
            {[
              { icon: <FileText size={24} className="stroke-1" />, title: "Resume Analysis", desc: "Instantly parse and structure your skills and experience." },
              { icon: <Target size={24} className="stroke-1" />, title: "Skill Gap Detection", desc: "Compare your profile against industry taxonomies." },
              { icon: <CheckCircle size={24} className="stroke-1" />, title: "Mock Interviews", desc: "Practice with adaptive AI-generated technical questions." }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-none backdrop-blur-md text-center hover:bg-white/10 transition-colors">
                <div className="text-white flex justify-center mb-6 opacity-70">{feature.icon}</div>
                <h3 className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-slate-200">{feature.title}</h3>
                <p className="text-slate-400 text-xs tracking-wider leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* ── How It Works ── */}
        <section className="relative z-10 py-24 px-6 text-center bg-slate-900/70 backdrop-blur-xl border-t border-white/5">
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 mb-3 font-light">Simple Process</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase text-white mb-16">How It Works</h2>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[17%] right-[17%] h-px bg-white/10"></div>

            {[
              { step: "01", title: "Upload Your Resume", desc: "Drop your PDF resume into the platform. Our Profile Analysis Agent reads and structures your skills and experience instantly.", icon: "📄" },
              { step: "02", title: "AI Analysis & Skill Mapping", desc: "5 specialized agents collaborate detecting skill gaps, ranking job matches, and building a personalized learning roadmap.", icon: "🧠" },
              { step: "03", title: "Get Hired & Practice", desc: "Receive your ranked job matches, a custom learning roadmap, and sharpen your skills with adaptive AI mock interviews.", icon: "🎯" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center px-8 relative">
                {/* Step number circle */}
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-2xl backdrop-blur-md z-10">
                  {item.icon}
                </div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-2">{item.step}</p>
                <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-light tracking-wider">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Meet the Agents ── */}
        <section className="relative z-10 py-24 px-6 text-center border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 mb-3 font-light">Behind the Scenes</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase text-white mb-4">Meet the Agents</h2>
          <p className="text-slate-400 text-xs tracking-wider font-light max-w-xl mx-auto mb-16">Your autonomous AI team — each agent is a specialist, working together to build your complete career strategy.</p>

          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Profile Analysis Agent", role: "The Reader", desc: "Parses your raw PDF resume into a clean, structured JSON profile using the Groq LLM.", tag: "LLM Powered", icon: "📋" },
              { name: "Skill Gap Agent", role: "The Strategist", desc: "Runs deterministic set-math against the skills taxonomy to find exactly what you are missing for your target role.", tag: "Deterministic", icon: "📊" },
              { name: "Learning Path Agent", role: "The Mentor", desc: "Searches the course database and builds a sequenced roadmap — only calls the LLM when a resource isn't found locally.", tag: "Hybrid", icon: "🗺️" },
              { name: "Interview Simulator", role: "The Coach", desc: "Generates adaptive, role-specific Q&A sessions and scores your readiness based on your answers.", tag: "LLM Powered", icon: "🎤" },
              { name: "Job Matching Agent", role: "The Recruiter", desc: "Scores every job in the database using skill-intersection math and role-category bonuses to rank your best matches.", tag: "Deterministic", icon: "💼" },
              { name: "Orchestrator", role: "The Commander", desc: "Coordinates all five agents, resolves conflicts, and triggers re-runs if the Interview Agent finds a gap that was missed.", tag: "Core Logic", icon: "🎛️" },
            ].map((agent, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 backdrop-blur-md text-left hover:bg-white/10 transition-all group">
                <div className="text-3xl mb-5">{agent.icon}</div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-white">{agent.name}</h3>
                </div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-4 font-light">{agent.role}</p>
                <p className="text-slate-400 text-xs leading-relaxed font-light tracking-wider mb-5">{agent.desc}</p>
                <span className="text-[9px] tracking-[0.2em] uppercase border border-white/10 px-3 py-1 text-slate-400 font-light">{agent.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-slate-500 text-[10px] tracking-widest uppercase font-light relative z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
          &copy; 2026 CareerCompass AI. Team Predictra
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
