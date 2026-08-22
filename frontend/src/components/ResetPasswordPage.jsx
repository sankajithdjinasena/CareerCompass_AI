import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Lock, ArrowRight, ArrowLeft, CheckCircle, Sun, Moon } from 'lucide-react';
import PoliciesModal from './PoliciesModal';
import { useTheme } from '../lib/ThemeContext';

const ResetPasswordPage = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [policiesTab, setPoliciesTab] = useState('terms');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const openPolicy = (tab = 'terms') => {
    setPoliciesTab(tab);
    setShowPolicies(true);
  };

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  };

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="min-h-screen font-montserrat flex flex-col relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center relative z-10 text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>

          <div 
            className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-9 h-9 bg-brand-500 text-white rounded-lg flex items-center justify-center shadow-md">
              <Bot size={22} />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all rounded-lg tracking-wider"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Card */}
        <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
          <div className="animate-fade-up w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-2xl shadow-xl transition-colors">
            <p className="text-xs tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2 font-bold">Account Security</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-white mb-4">Set New Password</h1>

            {done ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Successful</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Your password has been updated. You can now sign in with your new credentials.
                </p>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow mt-2"
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="New Password (min. 8 chars)" 
                      value={form.password}
                      onChange={e => field('password', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" 
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.password}</span>}
                </div>

                <div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type={showConfirm ? 'text' : 'password'} 
                      placeholder="Confirm New Password" 
                      value={form.confirm}
                      onChange={e => field('confirm', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" 
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.confirm}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Update Password <ArrowRight size={15} /></>}
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-slate-500 dark:text-slate-400 text-xs tracking-wider font-semibold border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            © 2026 CareerCompass AI · Team Predictra · Sabaragamuwa University of Sri Lanka
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 dark:text-slate-400 font-semibold">
            <button onClick={() => openPolicy('terms')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase">
              Terms of Service
            </button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => openPolicy('privacy')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase">
              Privacy & Student Data
            </button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => openPolicy('ethics')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase">
              AI Ethics
            </button>
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

export default ResetPasswordPage;
