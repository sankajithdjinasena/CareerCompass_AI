import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DashboardGrid from './components/DashboardGrid'
import ResumeUploader from './components/ResumeUploader'
import InterviewPractice from './components/InterviewPractice'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [page, setPage] = useState('dashboard') // 'dashboard' | 'practice'

  const pageTitles = {
    dashboard: { title: 'Hi there!', subtitle: 'Welcome to CareerCompass AI' },
    practice: { title: 'Mock Interview', subtitle: 'Practice with AI-generated questions for your target role' },
  }
  const { title, subtitle } = pageTitles[page]

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
        </div>
      </main>
    </div>
  )
}

export default App