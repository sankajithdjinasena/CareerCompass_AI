import { useEffect, useState } from "react"
import { Loader2, Map, CheckCircle2, PlayCircle, Clock, BookOpen, ExternalLink } from "lucide-react"

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
      <div className="bg-white dark:bg-slate-900/90 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md text-center transition-colors">
        <Map className="w-12 h-12 text-brand-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active session</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Upload and analyze a resume from the Dashboard first.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900/90 rounded-xl shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading your roadmap...</h3>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-800 dark:text-red-300">
        <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
        <p className="text-sm font-medium">{error}</p>
      </div>
    )
  }

  const phases = roadmap?.phases || []
  if (phases.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/90 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md text-center transition-colors">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Skill Gaps Found!</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">You are fully qualified for your target role.</p>
      </div>
    )
  }

  const totalSteps = phases.length
  const completedCount = Object.values(completedSteps).filter(Boolean).length
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Map className="w-6 h-6 text-brand-500" />
              Your Interactive Learning Path
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm font-medium">Complete these modules to master the skills you are missing.</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mb-1.5">{progressPercent}% Completed</div>
            <div className="w-full md:w-48 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="relative pl-4 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 py-4">
          {phases.map((phase, idx) => {
            const isCompleted = completedSteps[idx]
            return (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div 
                  className={`absolute -left-[21px] md:-left-[37px] top-1 w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                    isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white"
                  }`}
                  onClick={() => toggleStep(idx)}
                  title="Mark as complete"
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>

                <div className={`transition-all duration-300 ${isCompleted ? "opacity-60" : ""}`}>
                  <h3 className={`text-lg font-bold ${isCompleted ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"}`}>
                    {phase.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {phase.est_hours || 10} hours
                    </span>
                    <span className="flex items-center gap-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-800/60">
                      <BookOpen className="w-3.5 h-3.5" /> {phase.focus_skills?.join(", ")}
                    </span>
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Recommended Resource</p>
                    <p className="text-sm text-slate-900 dark:text-white mb-3 font-semibold">{phase.resource || "AI Recommended Tutorial"}</p>
                    
                    {phase.url ? (
                      <a 
                        href={phase.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Learning <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold">
                        <Map className="w-4 h-4" /> Recommended Search Topic
                      </span>
                    )}
                    
                    <button
                      onClick={() => toggleStep(idx)}
                      className={`ml-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors border ${
                        isCompleted 
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700" 
                          : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-200"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> 
                      {isCompleted ? "Completed" : "Mark as Complete"}
                    </button>
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
