
import { useEffect, useState } from "react"
import { Loader2, Map, CheckCircle2, PlayCircle, Clock, BookOpen, ExternalLink, RefreshCw } from "lucide-react"

const API_BASE = "http://localhost:8000"

export default function RoadmapPage({ sessionId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [completedSteps, setCompletedSteps] = useState({})

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/report/${sessionId}`)
        if (!res.ok) throw new Error("Failed to fetch roadmap")
        const data = await res.json()
        setRoadmap(data.learning_roadmap)
        
        // Load completed steps from local storage
        const saved = localStorage.getItem(`roadmap_completed_${sessionId}`)
        if (saved) {
          setCompletedSteps(JSON.parse(saved))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()
  }, [sessionId])

  const toggleStep = (stepIdx) => {
    const newCompleted = { ...completedSteps, [stepIdx]: !completedSteps[stepIdx] }
    setCompletedSteps(newCompleted)
    localStorage.setItem(`roadmap_completed_${sessionId}`, JSON.stringify(newCompleted))
  }

  if (!sessionId) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <Map className="w-10 h-10 text-brand-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No active session</h3>
        <p className="text-slate-500 text-sm mt-1">Upload and analyze a resume from the Dashboard first.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-800">Loading your roadmap...</h3>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const phases = roadmap?.phases || []
  if (phases.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Skill Gaps Found!</h3>
        <p className="text-slate-500 text-sm mt-1">You are fully qualified for your target role.</p>
      </div>
    )
  }

  const totalSteps = phases.length
  const completedCount = Object.values(completedSteps).filter(Boolean).length
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Map className="w-6 h-6 text-brand-500" />
              Your Interactive Learning Path
            </h2>
            <p className="text-slate-500 mt-1">Complete these modules to master the skills you are missing.</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-brand-600 mb-1">{progressPercent}% Completed</div>
            <div className="w-full md:w-48 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-brand-500 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="relative pl-4 md:pl-8 border-l-2 border-slate-100 space-y-8 py-4">
          {phases.map((phase, idx) => {
            const isCompleted = completedSteps[idx]
            return (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div 
                  className={`absolute -left-[21px] md:-left-[37px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-colors cursor-pointer ${isCompleted ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500 hover:bg-brand-200"}`}
                  onClick={() => toggleStep(idx)}
                  title="Mark as complete"
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>

                <div className={`transition-all duration-300 ${isCompleted ? "opacity-60" : ""}`}>
                  <h3 className={`text-lg font-bold ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}>
                    {phase.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 mt-2 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {phase.est_hours || 10} hours
                    </span>
                    <span className="flex items-center gap-1 bg-brand-50 text-brand-700 px-2 py-1 rounded-md border border-brand-100">
                      <BookOpen className="w-3.5 h-3.5" /> {phase.focus_skills?.join(", ")}
                    </span>
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Recommended Resource:</p>
                    <p className="text-sm text-slate-600 mb-3">{phase.resource || "AI Recommended Tutorial"}</p>
                    
                    {phase.url ? (
                      <a 
                        href={phase.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Learning <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium">
                        <RefreshCw className="w-4 h-4" /> Searching for link...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

