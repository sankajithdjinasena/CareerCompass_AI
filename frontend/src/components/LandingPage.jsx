import React from 'react';
import { ArrowRight, Bot, Target, FileText, CheckCircle } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Bot size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CareerCompass<span className="text-blue-400">AI</span></span>
        </div>
        <button
          onClick={onGetStarted}
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Go to Dashboard
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm text-blue-300 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Powered by Multi-Agent AI Architecture
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Your Autonomous <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Career Coach</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Upload your resume and let our team of 5 specialized AI agents analyze your skills, build a personalized learning roadmap, and prepare you with mock interviews.
        </p>

        <button
          onClick={onGetStarted}
          className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] flex items-center gap-3 overflow-hidden"
        >
          <span className="relative z-10">Get Started Now</span>
          <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
        </button>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {[
            { icon: <FileText size={24} />, title: "Resume Analysis", desc: "Instantly parse and structure your skills and experience." },
            { icon: <Target size={24} />, title: "Skill Gap Detection", desc: "Compare your profile against industry taxonomies." },
            { icon: <CheckCircle size={24} />, title: "Mock Interviews", desc: "Practice with adaptive AI-generated technical questions." }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm text-left hover:bg-slate-800/60 transition-colors">
              <div className="text-blue-400 mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-sm relative z-10">
        &copy; 2026 CareerCompass AI. Team Predictra
      </footer>
    </div>
  );
};

export default LandingPage;
