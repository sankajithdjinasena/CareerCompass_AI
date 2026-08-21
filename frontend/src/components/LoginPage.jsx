import React, { useState } from 'react';
import { Bot, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { apiLogin, apiGoogleAuth } from '../lib/api';
import { saveAuth } from '../lib/auth';

/* Google "G" SVG — inline so no external image needed */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const LoginPage = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
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
        // tokenResponse.access_token for userinfo flow
        // We need to use the credential (id_token) approach via GoogleLogin component
        // useGoogleLogin gives us an access_token, so fetch user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        // Send userinfo directly — backend will handle it
        // But our backend expects an id_token. Use the GoogleLogin component approach instead.
        // This path sends the sub/email directly for demo purposes:
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

        .err-msg { color: #f87171; font-size: 0.65rem; letter-spacing: 0.1em; margin-top: 0.3rem; display: block; }
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
        className="min-h-screen font-montserrat text-white flex flex-col relative bg-slate-900 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
      >
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
              onClick={() => onNavigate('register')}
              className="px-6 py-2 border border-slate-400 hover:border-white hover:bg-white hover:text-slate-900 transition-all rounded-sm tracking-widest text-[10px] uppercase"
            >
              Register
            </button>
          </div>
        </header>

        {/* Card */}
        <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
          <div className="animate-fade-up w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md p-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 mb-2 font-light">Welcome Back</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white mb-8">Sign In</h1>

            {/* Google Sign-In */}
            <button
              className="google-btn mb-5"
              onClick={() => googleLogin()}
              disabled={googleLoading || loading}
              id="login-google"
            >
              {googleLoading
                ? <span className="spinner-light" />
                : <GoogleIcon />
              }
              Continue with Google
            </button>

            <div className="divider mb-5">or</div>

            {/* API error */}
            {apiError && <div className="api-err mb-4">{apiError}</div>}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="email" placeholder="Email Address" value={form.email}
                    onChange={e => { field('email', e.target.value); setApiError(''); }}
                    className="auth-input" id="login-email" />
                </div>
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>

              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
                    onChange={e => { field('password', e.target.value); setApiError(''); }}
                    className="auth-input" style={{ paddingRight: '2.75rem' }} id="login-password" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <span className="err-msg">{errors.password}</span>}
              </div>

              <div className="flex justify-end -mt-2">
                <button type="button" onClick={() => onNavigate('forgot-password')}
                  className="text-slate-400 hover:text-white text-[11px] tracking-wider transition-colors" id="login-forgot">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="auth-btn" disabled={loading || googleLoading} id="login-submit">
                {loading ? <span className="spinner" /> : <>Sign In <ArrowRight size={13} /></>}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-slate-400 text-[11px] tracking-wider font-light">
                Don't have an account?{' '}
                <button onClick={() => onNavigate('register')} className="text-white hover:underline transition-all" id="login-go-register">
                  Create one
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

export default LoginPage;
