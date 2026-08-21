import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Lock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPasswordPage = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
    // TODO: wire to backend
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
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

        .strength-bar { height: 2px; border-radius: 2px; transition: width 0.3s, background 0.3s; }
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
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 mb-2 font-light">Account Recovery</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white mb-4">Reset Password</h1>

            {!done ? (
              <>
                <p className="text-slate-400 text-xs tracking-wider font-light leading-relaxed mb-8">
                  Create a new password for your account. Make sure it's at least 8 characters long.
                </p>

                {/* Password strength indicator */}
                {form.password.length > 0 && (() => {
                  const strength = form.password.length < 8 ? 1
                    : /(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(form.password) ? 3
                    : /(?=.*[A-Z])|(?=.*[0-9])/.test(form.password) ? 2 : 1;
                  const colors = ['#ef4444', '#f59e0b', '#22c55e'];
                  const labels = ['Weak', 'Fair', 'Strong'];
                  return (
                    <div className="mb-5 -mt-4">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex-1 h-0.5 rounded-sm" style={{ background: i <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <p className="text-[10px] tracking-wider" style={{ color: colors[strength - 1] }}>
                        {labels[strength - 1]}
                      </p>
                    </div>
                  );
                })()}

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  {/* New Password */}
                  <div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={form.password}
                        onChange={e => field('password', e.target.value)} className="auth-input"
                        style={{ paddingRight: '2.75rem' }} id="reset-password" />
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
                      <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm New Password" value={form.confirm}
                        onChange={e => field('confirm', e.target.value)} className="auth-input"
                        style={{ paddingRight: '2.75rem' }} id="reset-confirm" />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" tabIndex={-1}>
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.confirm && <span className="err-msg">{errors.confirm}</span>}
                  </div>

                  <button type="submit" className="auth-btn mt-2" disabled={loading} id="reset-submit">
                    {loading ? <span className="spinner" /> : <>Reset Password <ArrowRight size={13} /></>}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={28} className="text-emerald-400 stroke-1" />
                </div>
                <p className="text-white text-sm tracking-wider font-medium mb-3">Password Reset</p>
                <p className="text-slate-400 text-xs tracking-wider font-light leading-relaxed mb-8">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
                <button onClick={() => onNavigate('login')} className="auth-btn" id="reset-go-login">
                  Sign In <ArrowRight size={13} />
                </button>
              </div>
            )}

            {!done && (
              <div className="mt-8 border-t border-white/10 pt-6 text-center">
                <button onClick={() => onNavigate('forgot-password')}
                  className="text-slate-400 hover:text-white text-[11px] tracking-wider transition-colors flex items-center gap-2 mx-auto" id="reset-back">
                  <ArrowLeft size={12} /> Back
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="py-8 text-center text-slate-500 text-[10px] tracking-widest uppercase font-light relative z-10 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
          © 2026 CareerCompass AI. Team Predictra
        </footer>
      </div>
    </>
  );
};

export default ResetPasswordPage;
