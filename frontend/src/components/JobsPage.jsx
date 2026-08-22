import { useEffect, useState } from "react"
import { Briefcase, Loader2, MapPin, Building, Target, ExternalLink } from "lucide-react"

const API_BASE = "http://localhost:8000"

export default function JobsPage({ sessionId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [jobData, setJobData] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/report/${sessionId}`)
        if (!res.ok) throw new Error("Failed to fetch jobs")
        const data = await res.json()
        setJobData(data.job_matches)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [sessionId])

  if (!sessionId) {
    return (
      <div className="bg-white dark:bg-slate-900/90 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md text-center transition-colors">
        <Briefcase className="w-12 h-12 text-brand-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active session</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Upload and analyze a resume from the Dashboard first.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900/90 rounded-xl shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scouring job boards...</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Finding the best roles for your skill profile</p>
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

  const jobs = jobData?.jobs || []

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-brand-500" />
              Live Job Matches
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm font-medium">
              Based on your resume and target role, we found {jobs.length} open roles that fit your profile.
            </p>
          </div>
          
          <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-lg px-4 py-2">
            <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase block mb-0.5">Target Role</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{jobData?.role || "All Roles"}</span>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No jobs found right now.</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Try updating your resume or target role.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-brand-400 transition-all bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 group flex flex-col h-full shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                      <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 leading-none">
                        {job.match_score || job.match_percentage}%
                      </div>
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mt-1">
                        Match
                      </div>
                    </div>
                    
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded">
                      {job.type}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4 flex-grow">
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(job.required_skills || []).slice(0, 5).map(skill => (
                      <span key={skill} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md font-semibold">
                        {skill}
                      </span>
                    ))}
                    {(job.required_skills?.length > 5) && (
                      <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs px-2.5 py-1 rounded-md font-semibold">
                        +{job.required_skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/60">
                  <a 
                    href={job.url || `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company + " careers")}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-bold transition-colors shadow"
                  >
                    {job.url ? "View Job Application" : "Search for Job"}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
