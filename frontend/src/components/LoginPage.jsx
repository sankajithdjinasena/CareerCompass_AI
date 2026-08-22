import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Mail, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { apiLogin, apiGoogleAuth } from '../lib/api';
import { saveAuth } from '../lib/auth';
import PoliciesModal from './PoliciesModal';
import { useTheme } from '../lib/ThemeContext';

/* Google "G" SVG — inline */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const LoginPage = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [policiesTab, setPoliciesTab] = useState('terms');
  const [form, setForm] = useState({ email: '', password: '' });

  const openPolicy = (tab = 'terms') => {
    setPoliciesTab(tab);
    setShowPolicies(true);
  };
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const { token, user } = await apiLogin({ email: form.email, password: form.password });
      saveAuth(token, user);
      onNavigate('dashboard');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setApiError('');
      try {
        const { token, user } = await apiGoogleAuth(tokenResponse.access_token);
        saveAuth(token, user);
        onNavigate('dashboard');
      } catch (err) {
        setApiError(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setApiError('Google sign-in was cancelled or failed.');
      setGoogleLoading(false);
    },
  });

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
          <div className="flex gap-4 md:gap-8 items-center">
            <span className="cursor-pointer hover:text-brand-600 dark:hover:text-white transition-colors" onClick={() => onNavigate('landing')}>Home</span>
            <button 
              type="button" 
              onClick={() => openPolicy('terms')}
              className="uppercase tracking-wider hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-bold hidden sm:inline"
            >
              Policies & Legal
            </button>
          </div>

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
              onClick={() => onNavigate('register')}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all rounded-lg tracking-wider"
            >
              Register
            </button>
          </div>
        </header>

        {/* Card Container */}
        <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
          <div className="animate-fade-up w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-2xl shadow-xl transition-colors">
            <p className="text-xs tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2 font-bold">Welcome Back</p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-white mb-6">Sign In</h1>

            {/* Google Sign-In */}
            <button
              type="button"
              className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-3 shadow-sm mb-5"
              onClick={() => googleLogin()}
              disabled={googleLoading || loading}
              id="login-google"
            >
              {googleLoading ? <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5 text-xs text-slate-400 uppercase tracking-widest font-bold">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              <span>or with email</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="p-3.5 mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-700 dark:text-red-300 text-xs font-bold">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={form.email}
                    onChange={e => { field('email', e.target.value); setApiError(''); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition" 
                    id="login-email" 
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    value={form.password}
                    onChange={e => { field('password', e.target.value); setApiError(''); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition" 
                    id="login-password" 
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

              <div className="flex justify-end -mt-1">
                <button 
                  type="button" 
                  onClick={() => onNavigate('forgot-password')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 text-xs font-bold tracking-wide transition-colors" 
                  id="login-forgot"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-1" 
                disabled={loading || googleLoading} 
                id="login-submit"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign In <ArrowRight size={15} /></>}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                Don't have an account?{' '}
                <button 
                  onClick={() => onNavigate('register')} 
                  className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all" 
                  id="login-go-register"
                >
                  Create one
                </button>
              </p>
            </div>
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
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => openPolicy('portability')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase">
              Data Rights
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

export default LoginPage;
