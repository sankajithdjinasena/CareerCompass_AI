import React, { useState } from 'react';
import { 
  Bot, Eye, EyeOff, User, Mail, Lock, ArrowRight, 
  ShieldCheck, CheckCircle, FileText, Scale, Cpu, Sparkles 
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { apiRegister, apiGoogleAuth } from '../lib/api';
import { saveAuth } from '../lib/auth';
import PoliciesModal from './PoliciesModal';

/* Google "G" SVG — inline so no external image needed */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const RegisterPage = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [policiesTab, setPoliciesTab] = useState('terms');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

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
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (!agreedToTerms) e.terms = 'You must agree to the Terms and Privacy Policy';
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
      const { token, user } = await apiRegister({
        email: form.email,
        password: form.password,
        name: form.name,
      });
      saveAuth(token, user);
      onNavigate('dashboard');
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
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
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(148,163,184,0.6); letter-spacing: 0.1em; }
        .auth-input:focus { border-color: rgba(52, 211, 153, 0.6); background: rgba(255,255,255,0.1); }

        .auth-btn {
          width: 100%;
          padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.95);
          color: #0f172a;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .auth-btn:hover:not(:disabled) { 
          background: #fff; 
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(255,255,255,0.25);
        }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .google-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.08);
          color: #e2e8f0;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(148,163,184,0.4);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .err-msg { color: #f87171; font-size: 0.65rem; letter-spacing: 0.08em; margin-top: 0.3rem; display: block; }
        .api-err {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          padding: 0.65rem 0.85rem;
          text-align: center;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(15,23,42,0.3);
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .spinner-light {
          width: 14px; height: 14px;
          border: 2px solid rgba(226,232,240,0.2);
          border-top-color: #e2e8f0;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <div
        className="min-h-screen font-montserrat text-white flex flex-col relative bg-slate-900 bg-cover bg-center overflow-x-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900 pointer-events-none" />

        {/* Header matching landing page design */}
        <header className="px-6 md:px-12 py-8 flex justify-between items-center relative z-10 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-slate-200">
          <div className="hidden md:flex gap-8 lg:gap-12">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate('landing')}>Our Story</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate('landing')}>SolutionLab</span>
            <button 
              type="button" 
              onClick={() => openPolicy('terms')}
              className="uppercase tracking-[0.2em] hover:text-emerald-400 transition-colors text-left"
            >
              Policies
            </button>
          </div>
          
          {/* Logo Center */}
          <div 
            className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 text-white cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => onNavigate('landing')}
            title="Return to Home"
          >
            <Bot size={32} className="opacity-90" />
          </div>

          <div className="flex gap-8 lg:gap-12 items-center">
            <span 
              className="hidden sm:block cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => openPolicy('privacy')}
            >
              Privacy & Trust
            </span>
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-2 border border-slate-400 hover:border-white hover:bg-white hover:text-slate-900 transition-all rounded-sm tracking-widest text-[10px] uppercase"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 py-10 md:py-14">
          
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Register Card */}
            <div className="lg:col-span-7 animate-fade-up bg-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <p className="text-[10px] tracking-[0.4em] uppercase text-emerald-400 mb-2 font-medium">Create Free Account</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white mb-6">Register</h1>

              {/* Google Sign-Up */}
              <button
                className="google-btn mb-5"
                onClick={() => {
                  if (!agreedToTerms) {
                    setErrors({ terms: 'You must agree to the Terms and Privacy Policy before continuing with Google.' });
                    return;
                  }
                  googleLogin();
                }}
                disabled={googleLoading || loading}
                id="reg-google"
              >
                {googleLoading
                  ? <span className="spinner-light" />
                  : <GoogleIcon />
                }
                Continue with Google
              </button>

              <div className="divider mb-5">or with email</div>

              {/* API error */}
              {apiError && <div className="api-err mb-4">{apiError}</div>}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={form.name}
                      onChange={e => { field('name', e.target.value); setApiError(''); }}
                      className="auth-input" 
                      id="reg-name" 
                    />
                  </div>
                  {errors.name && <span className="err-msg">{errors.name}</span>}
                </div>

                {/* Email */}
                <div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={form.email}
                      onChange={e => { field('email', e.target.value); setApiError(''); }}
                      className="auth-input" 
                      id="reg-email" 
                    />
                  </div>
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Password (min. 8 characters)" 
                      value={form.password}
                      onChange={e => { field('password', e.target.value); setApiError(''); }}
                      className="auth-input" 
                      style={{ paddingRight: '2.75rem' }} 
                      id="reg-password" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" 
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <span className="err-msg">{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type={showConfirm ? 'text' : 'password'} 
                      placeholder="Confirm Password" 
                      value={form.confirm}
                      onChange={e => { field('confirm', e.target.value); setApiError(''); }}
                      className="auth-input" 
                      style={{ paddingRight: '2.75rem' }} 
                      id="reg-confirm" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" 
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirm && <span className="err-msg">{errors.confirm}</span>}
                </div>

                {/* Interactive Terms & Policy Agreement Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked && errors.terms) {
                          setErrors(prev => ({ ...prev, terms: null }));
                        }
                      }}
                      className="mt-1 w-4 h-4 rounded bg-slate-900 border-white/20 text-emerald-400 focus:ring-emerald-400/50 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300 font-light leading-relaxed select-none">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(ev) => { ev.stopPropagation(); openPolicy('terms'); }}
                        className="text-emerald-400 hover:underline font-normal tracking-wide hover:text-emerald-300"
                      >
                        Terms of Service
                      </button>
                      {', '}
                      <button
                        type="button"
                        onClick={(ev) => { ev.stopPropagation(); openPolicy('privacy'); }}
                        className="text-emerald-400 hover:underline font-normal tracking-wide hover:text-emerald-300"
                      >
                        Privacy Policy
                      </button>
                      {' and '}
                      <button
                        type="button"
                        onClick={(ev) => { ev.stopPropagation(); openPolicy('ethics'); }}
                        className="text-emerald-400 hover:underline font-normal tracking-wide hover:text-emerald-300"
                      >
                        AI Ethics Notice
                      </button>
                      .
                    </span>
                  </label>
                  {errors.terms && <span className="err-msg pl-7">{errors.terms}</span>}
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="auth-btn mt-3" 
                  disabled={loading || googleLoading} 
                  id="reg-submit"
                >
                  {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={13} /></>}
                </button>
              </form>

              <div className="mt-6 border-t border-white/10 pt-5 text-center">
                <p className="text-slate-400 text-[11px] tracking-wider font-light">
                  Already have an account?{' '}
                  <button onClick={() => onNavigate('login')} className="text-white hover:text-emerald-400 hover:underline transition-all" id="reg-go-login">
                    Sign In
                  </button>
                </p>
              </div>
            </div>

            {/* Right Column: Platform Policy & Security Highlights */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 animate-fade-up">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
                    <ShieldCheck size={20} />
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white">
                      Student Data Safeguards
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 font-light leading-relaxed mb-6">
                    CareerCompass AI adheres to strict academic integrity and student privacy standards. Your data is isolated per session.
                  </p>

                  <div className="space-y-4">
                    {/* Safeguard 1 */}
                    <div 
                      onClick={() => openPolicy('privacy')}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-emerald-400" />
                          <span className="text-xs font-medium text-white tracking-wide">Zero Foundation Training</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono group-hover:translate-x-0.5 transition-transform">Read &rarr;</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        We never sell personal details or train public AI models on private student resumes.
                      </p>
                    </div>

                    {/* Safeguard 2 */}
                    <div 
                      onClick={() => openPolicy('ethics')}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-emerald-400" />
                          <span className="text-xs font-medium text-white tracking-wide">Bias-Free Scoring</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono group-hover:translate-x-0.5 transition-transform">Read &rarr;</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        Skills are measured with deterministic taxonomy set-math, ignoring demographic factors.
                      </p>
                    </div>

                    {/* Safeguard 3 */}
                    <div 
                      onClick={() => openPolicy('portability')}
                      className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Scale size={14} className="text-emerald-400" />
                          <span className="text-xs font-medium text-white tracking-wide">Data Portability & Erasure</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono group-hover:translate-x-0.5 transition-transform">Read &rarr;</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                        Download career dossiers (PDF/JSON) or purge account vectors permanently at any time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-light">
                  <span>Sabaragamuwa Univ.</span>
                  <span>Team Predictra</span>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Footer matching landing page style */}
        <footer className="py-8 px-6 text-center text-slate-500 text-[10px] tracking-widest uppercase font-light relative z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            © 2026 CareerCompass AI · Team Predictra · Sabaragamuwa University of Sri Lanka
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <button onClick={() => openPolicy('terms')} className="hover:text-emerald-400 transition-colors uppercase">
              Terms of Service
            </button>
            <span className="text-white/20 hidden sm:inline">|</span>
            <button onClick={() => openPolicy('privacy')} className="hover:text-emerald-400 transition-colors uppercase">
              Privacy & Student Data
            </button>
            <span className="text-white/20 hidden sm:inline">|</span>
            <button onClick={() => openPolicy('ethics')} className="hover:text-emerald-400 transition-colors uppercase">
              AI Ethics & Advisory
            </button>
            <span className="text-white/20 hidden sm:inline">|</span>
            <button onClick={() => openPolicy('portability')} className="hover:text-emerald-400 transition-colors uppercase">
              Data Rights
            </button>
          </div>
        </footer>

        {/* Legal & Policies Modal */}
        <PoliciesModal
          isOpen={showPolicies}
          onClose={() => setShowPolicies(false)}
          initialTab={policiesTab}
          onAccept={() => setAgreedToTerms(true)}
        />
      </div>
    </>
  );
};

export default RegisterPage;
