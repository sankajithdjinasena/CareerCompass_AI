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
import { ThemeProvider, useTheme } from './lib/ThemeContext'

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
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 dark:text-red-400">
          <h3 className="text-lg font-bold mb-2">Failed to render section</h3>
          <p className="font-mono text-xs bg-red-500/20 p-3 rounded">{this.state.error?.toString()}</p>
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

function MainLayout({ children, title, subtitle, page, sessionId, setSessionId, onNavigate }) {
  const { theme } = useTheme()

  return (
    <div className="flex h-screen font-montserrat overflow-hidden relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Background ambient accents for dark mode */}
      {theme === 'dark' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className="relative z-10 flex h-full w-full">
        <Sidebar activePage={page} onNavigate={onNavigate} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm font-normal">{subtitle}</p>
              </div>
              {page === 'dashboard' && (
                <div className="flex flex-col items-end gap-2">
                  <ResumeUploader onUploadComplete={(id) => setSessionId(id)} />
                  {sessionId && (
                    <span className="bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs tracking-wider uppercase px-3 py-1 rounded-full font-bold">
                      Analysis Complete
                    </span>
                  )}
                </div>
              )}
            </header>

            <ComponentErrorBoundary>
              {children}
            </ComponentErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}

function AppContent() {
  const [sessionId, setSessionId] = useState(null)
  const [page, setPage] = useState('landing')
  const [authUser, setAuthUser] = useState(null)

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
    dashboard: { title: `Hi, ${authUser?.name?.split(' ')[0] || 'there'}!`, subtitle: 'Welcome to CareerCompass AI' },
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
    return <LoginPage onNavigate={setPage} onAuthSuccess={(user) => { setAuthUser(user); }} />
  }

  if (page === 'register') {
    return <RegisterPage onNavigate={setPage} onAuthSuccess={(user) => { setAuthUser(user); }} />
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
    <MainLayout
      title={title}
      subtitle={subtitle}
      page={page}
      sessionId={sessionId}
      setSessionId={setSessionId}
      onNavigate={setPage}
    >
      {page === 'dashboard' && <DashboardGrid sessionId={sessionId} authUser={authUser} />}
      {page === 'resume' && <ResumePage sessionId={sessionId} onUploadComplete={(id) => setSessionId(id)} />}
      {page === 'practice' && <InterviewPractice sessionId={sessionId} />}
      {page === 'roadmap' && <RoadmapPage sessionId={sessionId} />}
      {page === 'jobs' && <JobsPage sessionId={sessionId} />}
      {page === 'settings' && <SettingsPage />}
    </MainLayout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
