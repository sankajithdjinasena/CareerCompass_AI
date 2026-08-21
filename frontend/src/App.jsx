import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DashboardGrid from './components/DashboardGrid'
import ResumeUploader from './components/ResumeUploader'
import ResumePage from './components/ResumePage'
import InterviewPractice from './components/InterviewPractice'
import LandingPage from './components/LandingPage'
import ContactPage from './components/ContactPage'
import RoadmapPage from './components/RoadmapPage'
import SettingsPage from './components/SettingsPage'
import JobsPage from './components/JobsPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import { isLoggedIn, clearAuth, getUser } from './lib/auth'
import { apiLogout } from './lib/api'
import { getToken } from './lib/auth'

class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <h3 className="text-lg font-bold mb-2">Failed to render section</h3>
          <p className="font-mono text-xs bg-red-100 p-3 rounded">{this.state.error?.toString()}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Retry Section
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'dashboard' | 'resume' | 'practice'
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

  useEffect(() => {
    if (page === 'logout') {
      handleLogout()
    }
  }, [page])

  const pageTitles = {
    dashboard: { title: 'Hi there!', subtitle: 'Welcome to CareerCompass AI' },
    resume: { title: 'Resume & Profile', subtitle: 'Manage your resume and view AI-parsed profile insights' },
    practice: { title: 'Mock Interview', subtitle: 'Practice with AI-generated questions for your target role' },
    roadmap: { title: 'Learning Roadmap', subtitle: 'Master the skills you are missing' },
    jobs: { title: 'Job Matching', subtitle: 'Discover open roles that fit your skill profile' },
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

  if (page === 'contact') {
    return <ContactPage onBack={() => setPage('landing')} />
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

          <ComponentErrorBoundary>
            {page === 'dashboard' && <DashboardGrid sessionId={sessionId} />}
            {page === 'resume' && <ResumePage sessionId={sessionId} onUploadComplete={(id) => setSessionId(id)} />}
            {page === 'practice' && <InterviewPractice sessionId={sessionId} />}
            {page === 'roadmap' && <RoadmapPage sessionId={sessionId} />}
            {page === 'jobs' && <JobsPage sessionId={sessionId} />}
            {page === 'settings' && <SettingsPage />}
          </ComponentErrorBoundary>
        </div>
      </main>
    </div>
  )
}

export default App