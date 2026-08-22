import { useEffect, useState } from 'react'
import { Loader2, Mail, CheckCircle2, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardGrid({ sessionId }) {
  const [status, setStatus] = useState('processing')
  const [data, setData] = useState(null)
  const [expandedSkills, setExpandedSkills] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    setStatus('processing')
    setData(null)

    const pollStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/report/${sessionId}`)
        if (res.ok) {
          const report = await res.json()
          if (report.status === 'completed') {
            setStatus('completed')
            setData(report)
          } else if (report.status === 'failed' || report.status === 'error') {
            setStatus('failed')
            setData({ error: report.errors?.[0] || 'Unknown error occurred during analysis.' })
          } else {
            setTimeout(pollStatus, 3000)
          }
        } else {
          setTimeout(pollStatus, 3000)
        }
      } catch (err) {
        setTimeout(pollStatus, 3000)
      }
    }
    
    pollStatus()
  }, [sessionId])

  if (status === 'processing' && sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Agents Analyzing...</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 text-center max-w-sm">
          Extracting skills, finding gaps, and matching jobs.
        </p>
        <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-950/30 rounded-lg border border-brand-200 dark:border-brand-800/50 max-w-md">
          <p className="text-xs text-brand-800 dark:text-brand-300 font-medium text-center leading-relaxed">
            Note: We are using a free-tier Groq API which has strict rate limits. 
            The 4 AI agents may take <span className="font-bold">2-3 minutes</span> to complete their sequential analysis. 
            Please do not refresh the page.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-800 dark:text-red-300">
        <h3 className="text-lg font-bold mb-2">Analysis Failed</h3>
        <p>{data?.error}</p>
      </div>
    )
  }

  const isDemo = !sessionId || !data;
  const profile = isDemo ? { name: "Alex Parker", email: "alex.parker@email.com", all_skills: ["Python", "Java", "AWS", "Machine Learning", "Docker", "SQL", "React", "Node.js"] } : data.profile;
  const skill_gaps = isDemo ? { role: "AI/ML Engineer", missing_skills: { must_have: ["PyTorch", "TensorFlow", "Keras", "MLOps"] } } : data.skill_gaps;
  const learning_roadmap = isDemo ? { phases: [{ phase_number: 1, title: "Python Advanced", week_range: "Week 1-2", focus_skills: ["Python", "Data Structures"] }, { phase_number: 2, title: "Machine Learning Basics", week_range: "Week 3-5", focus_skills: ["Scikit-learn", "Pandas"] }, { phase_number: 3, title: "Deep Learning Concepts", week_range: "Week 6-8", focus_skills: ["PyTorch", "Neural Networks"] }] } : (data.learning_roadmap || { phases: [] });
  const job_matches = isDemo ? { jobs: [{ title: "Lead AI Engineer", company: "Google", match_score: 96 }, { title: "Senior MLE", company: "Netflix", match_score: 95 }, { title: "AI Developer", company: "Amazon", match_score: 89 }] } : (data.job_matches || { jobs: [] });

  // Prepare chart data
  const chartData = [
    { name: 'Core', candidate: 80, target: 100 },
    { name: 'Tools', candidate: 60, target: 80 },
    { name: 'Cloud', candidate: 70, target: 70 },
  ]

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="flex items-center gap-3 p-4 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl text-brand-900 dark:text-brand-200 shadow-sm">
          <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Sample Demo View:</span> Upload your resume using the button at the top right to analyze your profile and see live personalized insights.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Profile Widget */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md relative overflow-hidden transition-colors">
          {isDemo && (
            <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg tracking-wider">
              DEMO DATA
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Candidate Profile
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center font-bold text-xl border border-brand-200 dark:border-brand-500/30">
              {profile?.name ? profile.name.charAt(0) : 'U'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{profile?.name || 'Unknown User'}</h4>
              <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm gap-1.5 mt-0.5 font-medium">
                <Mail className="w-4 h-4 text-slate-400" /> {profile?.email || 'No email provided'}
              </div>
            </div>
          </div>
          
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Top Skills</h5>
          <div className="flex flex-wrap gap-2">
            {profile?.all_skills?.slice(0, expandedSkills ? undefined : 8).map(skill => (
              <span key={skill} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-md text-xs font-semibold border border-slate-200 dark:border-slate-700">
                {skill}
              </span>
            ))}
            {!expandedSkills && profile?.all_skills?.length > 8 && (
              <button 
                onClick={() => setExpandedSkills(true)}
                className="bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-md text-xs font-bold border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/50 cursor-pointer transition-colors"
              >
                +{profile.all_skills.length - 8} more
              </button>
            )}
            {expandedSkills && profile?.all_skills?.length > 8 && (
              <button 
                onClick={() => setExpandedSkills(false)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Show less
              </button>
            )}
          </div>
        </div>

        {/* 2. Skill Gaps Widget */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md relative transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            Skill Gaps Analysis
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
            Target Role: <span className="font-bold text-brand-600 dark:text-brand-400">{skill_gaps?.role || 'Developer'}</span>
          </p>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                <Bar dataKey="candidate" fill="#0ea5e9" radius={[4,4,0,0]} barSize={22} />
                <Bar dataKey="target" fill="#cbd5e1" radius={[4,4,0,0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Missing Key Skills</h5>
            <div className="flex flex-wrap gap-2">
              {(skill_gaps?.missing_skills?.must_have || []).slice(0, 4).map(skill => (
                <span key={skill} className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded text-xs font-semibold border border-amber-200 dark:border-amber-800/60">
                  {skill}
                </span>
              ))}
              {!(skill_gaps?.missing_skills?.must_have?.length) && (
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">None! Great match!</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Learning Roadmap Widget */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md relative transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            AI Learning Roadmap
          </h3>
          {!(learning_roadmap?.phases?.length) && <p className="text-slate-500 dark:text-slate-400 text-sm">No roadmap phases generated.</p>}
          <div className="space-y-4 mt-6">
            {(learning_roadmap?.phases || []).slice(0, 3).map((phase, idx) => (
              <div key={idx} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    idx === 0 
                      ? 'bg-brand-500 text-white shadow' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {phase.phase_number || (idx + 1)}
                  </div>
                  {idx < 2 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 absolute top-7 left-3.5 -ml-[1px]"></div>}
                </div>
                <div className="pb-4 pt-0.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{phase.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{phase.week_range}</p>
                  <div className="mt-2 text-xs text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40 inline-block px-2.5 py-1 rounded font-semibold">
                    {(phase.focus_skills || []).slice(0,3).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Top Job Matches Widget */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md relative transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Top Job Matches
          </h3>
          {!(job_matches?.jobs?.length) && <p className="text-slate-500 dark:text-slate-400 text-sm">No job matches found.</p>}
          <div className="space-y-3">
            {(job_matches?.jobs || []).slice(0, 4).map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[180px]">{job.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">{job.company}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{job.match_score || job.match_percentage}%</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Match</div>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
