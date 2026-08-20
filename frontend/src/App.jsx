import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DashboardGrid from './components/DashboardGrid'
import ResumeUploader from './components/ResumeUploader'

function App() {
  const [sessionId, setSessionId] = useState(null)
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-brand-950">Hi there!</h1>
              <p className="text-slate-500 mt-1">Welcome to CareerCompass AI</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ResumeUploader onUploadComplete={(id) => setSessionId(id)} />
              {sessionId && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                  Analysis Complete
                </span>
              )}
            </div>
          </header>

          <DashboardGrid sessionId={sessionId} />
        </div>
      </main>
    </div>
  )
}

export default App
