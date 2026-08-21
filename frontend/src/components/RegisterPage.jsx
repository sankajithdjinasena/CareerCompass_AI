import React, { useState } from 'react';
import { Bot, Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';

const RegisterPage = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
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
    // TODO: wire to backend
    setTimeout(() => { setLoading(false); onNavigate('dashboard'); }, 1200);
  };

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease both; }

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
        .auth-input:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.1); }

        .auth-btn {
          width: 100%;
          padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.95);
          color: #0f172a;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .auth-btn:hover:not(:disabled) { background: #fff; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .err-msg { color: #f87171; font-size: 0.65rem; letter-spacing: 0.1em; margin-top: 0.3rem; display: block; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(15,23,42,0.3);
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <div
        className="min-h-screen font-montserrat text-white flex flex-col relative bg-slate-900 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900 pointer-events-none" />

        {/* Header */}
        <header className="px-6 md:px-12 py-8 flex justify-between items-center relative z-10 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-slate-200">
          <div className="hidden md:flex gap-12">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate('landing')}>Our Story</span>
            <span className="cursor-pointer hover:text-white transition-colors">SolutionLab</span>
            <span className="cursor-pointer hover:text-white transition-colors">Clients</span>
          </div>

          <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 text-white cursor-pointer" onClick={() => onNavigate('landing')}>
            <Bot size={32} className="opacity-90" />
          </div>

          <div className="flex gap-12 items-center">
            <span className="hidden md:block cursor-pointer hover:text-white transition-colors">Portfolio</span>
            <span className="hidden md:block cursor-pointer hover:text-white transition-colors">Blog</span>
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-2 border border-slate-400 hover:border-white hover:bg-white hover:text-slate-900 transition-all rounded-sm tracking-widest text-[10px] uppercase"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Card */}
        <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
          <div className="animate-fade-up w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md p-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 mb-2 font-light">Create Account</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white mb-8">Register</h1>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Full Name */}
              <div>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="text" placeholder="Full Name" value={form.name}
                    onChange={e => field('name', e.target.value)} className="auth-input" id="reg-name" />
                </div>
                {errors.name && <span className="err-msg">{errors.name}</span>}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="email" placeholder="Email Address" value={form.email}
                    onChange={e => field('email', e.target.value)} className="auth-input" id="reg-email" />
                </div>
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
                    onChange={e => field('password', e.target.value)} className="auth-input"
                    style={{ paddingRight: '2.75rem' }} id="reg-password" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <span className="err-msg">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={form.confirm}
                    onChange={e => field('confirm', e.target.value)} className="auth-input"
                    style={{ paddingRight: '2.75rem' }} id="reg-confirm" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" tabIndex={-1}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.confirm && <span className="err-msg">{errors.confirm}</span>}
              </div>

              <button type="submit" className="auth-btn mt-2" disabled={loading} id="reg-submit">
                {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={13} /></>}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-slate-400 text-[11px] tracking-wider font-light">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="text-white hover:underline transition-all" id="reg-go-login">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </main>

        <footer className="py-8 text-center text-slate-500 text-[10px] tracking-widest uppercase font-light relative z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
          © 2026 CareerCompass AI. Team Predictra
        </footer>
      </div>
    </>
  );
};

export default RegisterPage;
