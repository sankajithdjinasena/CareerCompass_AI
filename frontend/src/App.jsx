import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DashboardGrid from './components/DashboardGrid'
import ResumeUploader from './components/ResumeUploader'
import InterviewPractice from './components/InterviewPractice'
import LandingPage from './components/LandingPage'
import RoadmapPage from './components/RoadmapPage'
import SettingsPage from './components/SettingsPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import { isLoggedIn, clearAuth, getUser } from './lib/auth'
import { apiLogout } from './lib/api'
import { getToken } from './lib/auth'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'dashboard' | 'practice'
  const [authUser, setAuthUser] = useState(null)

  // On mount: if a valid token exists, jump straight to dashboard
  useEffect(() => {
    if (isLoggedIn()) {
      setAuthUser(getUser())
      setPage('dashboard')
    }
  }, [])

  const handleLogout = async () => {
    const token = getToken()
    if (token) {
      try { await apiLogout(token) } catch (_) {}
    }
    clearAuth()
    setAuthUser(null)
    setPage('landing')
  }

  const pageTitles = {
    dashboard: { title: 'Hi there!', subtitle: 'Welcome to CareerCompass AI' },
    practice: { title: 'Mock Interview', subtitle: 'Practice with AI-generated questions for your target role' },
    roadmap: { title: 'Learning Roadmap', subtitle: 'Master the skills you are missing' },
    settings: { title: 'Account Settings', subtitle: 'Manage your profile and preferences' },
  }
  const { title, subtitle } = pageTitles[page] || {}

  if (page === 'landing') {
    return <LandingPage onGetStarted={() => setPage('login')} onNavigate={setPage} />
  }

  if (page === 'login') {
    return <LoginPage onNavigate={setPage} />
  }

  if (page === 'register') {
    return <RegisterPage onNavigate={setPage} />
  }

  if (page === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={setPage} />
  }

  if (page === 'reset-password') {
    return <ResetPasswordPage onNavigate={setPage} />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar activePage={page} onNavigate={setPage} />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-brand-950">{title}</h1>
              <p className="text-slate-500 mt-1">{subtitle}</p>
            </div>
            {page === 'dashboard' && (
              <div className="flex flex-col items-end gap-2">
                <ResumeUploader onUploadComplete={(id) => setSessionId(id)} />
                {sessionId && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                    Analysis Complete
                  </span>
                )}
              </div>
            )}
          </header>

          {page === 'dashboard' && <DashboardGrid sessionId={sessionId} />}
          {page === 'practice' && <InterviewPractice sessionId={sessionId} />}
          {page === 'roadmap' && <RoadmapPage sessionId={sessionId} />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  )
}

export default App