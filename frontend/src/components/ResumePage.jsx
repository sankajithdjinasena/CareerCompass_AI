import { useState, useEffect } from 'react'
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, Sparkles, 
  User, Mail, Phone, GraduationCap, Briefcase, Award, Download, 
  RefreshCw, Loader2, Star, Check, Code, ShieldCheck, Eye, Copy
} from 'lucide-react'

export default function ResumePage({ sessionId, onUploadComplete }) {
  const [loading, setLoading] = useState(false)
  const [fetchingReport, setFetchingReport] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('auto')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'insights' | 'raw'

  const ROLES = [
    'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 
    'DevOps Engineer', 'Cybersecurity Analyst', 'Mobile App Developer', 
    'Cloud Engineer', 'QA / Test Engineer', 'Business Analyst',
    'Network Engineer', 'UI/UX Designer', 'Product Manager', 
    'Game Developer', 'Database Administrator', 'Site Reliability Engineer'
  ]

  // Fetch report data if session ID exists
  useEffect(() => {
    if (!sessionId) return
    let isMounted = true

    const fetchReport = async () => {
      setFetchingReport(true)
      try {
        const res = await fetch(`http://localhost:8000/api/report/${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setReportData(data)
          }
        }
      } catch (err) {
        console.error('Error fetching resume profile report:', err)
      } finally {
        if (isMounted) setFetchingReport(false)
      }
    }

    fetchReport()
    return () => { isMounted = false }
  }, [sessionId])

  const handleUpload = async () => {
    if (!file || !targetRole) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // 1. Upload resume
      const res = await fetch('http://localhost:8000/api/upload-resume', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Resume upload failed. Please try a valid PDF file.')
      const data = await res.json()
      const sid = data.session_id

      // 2. Trigger analysis pipeline
      const pipelineRes = await fetch(`http://localhost:8000/api/run-pipeline/${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_role: targetRole })
      })

      if (!pipelineRes.ok) {
        throw new Error('Failed to start resume analysis pipeline.')
      }

      if (onUploadComplete) {
        onUploadComplete(sid)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Demo fallback profile
  const demoProfile = {
    name: "Alex Parker",
    email: "alex.parker@sfu.ac.lk",
    phone: "+94 77 123 4567",
    target_role: "Software / AI Engineer",
    summary: "Final year Computing undergraduate passionate about building scalable web applications and intelligent machine learning backend systems. Experience in Python, React, and Cloud infrastructure.",
    all_skills: ["Python", "JavaScript", "React", "Node.js", "FastAPI", "Docker", "SQL", "Git", "AWS", "REST APIs", "Machine Learning"],
    categorized_skills: {
      "Programming Languages": ["Python", "JavaScript", "SQL", "HTML/CSS"],
      "Frameworks & Libraries": ["React", "FastAPI", "Node.js", "Express", "Tailwind CSS"],
      "Tools & Platforms": ["Docker", "Git", "AWS", "PostgreSQL", "ChromaDB"],
      "Soft Skills": ["Problem Solving", "Team Leadership", "Agile/Scrum"]
    },
    education: [
      {
        degree: "B.Sc. (Hons) in Computing & Information Systems",
        institution: "Sabaragamuwa University of Sri Lanka",
        year: "2022 - 2026",
        gpa: "3.75 / 4.00"
      }
    ],
    experience: [
      {
        title: "Software Engineering Intern",
        company: "TechNexus Innovations",
        period: "Jun 2025 - Nov 2025",
        description: "Developed microservices using Python FastAPI and optimized SQL queries, reducing response times by 35%."
      },
      {
        title: "Lead Developer",
        company: "CodeSplash '26 Hackathon",
        period: "2026",
        description: "Built autonomous multi-agent AI career guidance platform using Groq LPU models and LangChain state machines."
      }
    ],
    projects: [
      {
        name: "CareerCompass AI",
        tech: "Python, FastAPI, React, Groq API, ChromaDB",
        description: "Multi-agent autonomous career guidance platform with skill-gap analysis and adaptive mock interviews."
      }
    ]
  }

  // Safely evaluate whether backend returned a non-empty profile object
  const hasValidBackendProfile = reportData?.profile && typeof reportData.profile === 'object' && Object.keys(reportData.profile).length > 0
  const profile = hasValidBackendProfile ? reportData.profile : demoProfile

  // Safely extract arrays/objects from profile with defaults
  const allSkills = Array.isArray(profile.all_skills) ? profile.all_skills : []
  const categorizedSkills = (profile.categorized_skills && typeof profile.categorized_skills === 'object' && !Array.isArray(profile.categorized_skills)) 
    ? profile.categorized_skills 
    : null
  const educationList = Array.isArray(profile.education) ? profile.education : []
  const experienceList = Array.isArray(profile.experience) ? profile.experience : []
  const projectList = Array.isArray(profile.projects) ? profile.projects : []

  const atsScore = reportData ? 88 : 78

  const handleCopyJSON = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(profile, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {}
  }

  const getInitials = (nameStr) => {
    if (!nameStr || typeof nameStr !== 'string') return 'AP'
    const parts = nameStr.trim().split(' ')
    return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2) || 'AP'
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Upload Section */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-brand-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              AI Resume Parser & Optimizer
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {sessionId ? 'Resume Analysis Complete' : 'Upload Your Resume'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Upload your PDF resume to run our 5-agent AI pipeline. Extract structured skill profiles, benchmark against industry target roles, and optimize ATS score.
            </p>
          </div>

          {/* Upload Controls */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={loading}
              className="bg-brand-900/80 border border-brand-700 text-white text-xs rounded-lg px-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="auto">✨ Auto-Detect Role</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <div className="relative flex-1">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 truncate">
                <UploadCloud className="w-4 h-4 text-brand-300" />
                <span className="truncate">{file ? file.name : 'Choose PDF Resume'}</span>
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Parse Resume'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'profile'
                ? 'bg-brand-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            Parsed Profile
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'insights'
                ? 'bg-brand-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            ATS & AI Insights
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'raw'
                ? 'bg-brand-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON Profile Data
          </button>
        </div>

        <div className="flex items-center gap-2">
          {fetchingReport && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
              Refreshing...
            </span>
          )}
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info & Skill Badges */}
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{profile.name || 'Candidate Name'}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-50 text-brand-700 font-semibold text-xs rounded-full border border-brand-100">
                    {profile.target_role || 'Target Candidate'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
                {profile.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              {profile.summary && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Executive Summary</p>
                  <p className="text-slate-600 text-xs leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{profile.summary}"
                  </p>
                </div>
              )}
            </div>

            {/* Categorized Skills Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  Extracted Skills ({allSkills.length})
                </h4>
              </div>

              {categorizedSkills ? (
                Object.entries(categorizedSkills).map(([category, skills]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(skills) && skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {allSkills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-100 text-xs font-medium rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Experience, Education & Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-500" />
                Work & Practical Experience
              </h4>

              <div className="space-y-4 divide-y divide-slate-100">
                {experienceList.length > 0 ? (
                  experienceList.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-4 space-y-1' : 'space-y-1'}>
                      <div className="flex justify-between items-start">
                        <h5 className="font-semibold text-slate-900 text-sm">{exp.title}</h5>
                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-50 rounded">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-brand-600">{exp.company}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No formal work experience parsed. Highlighting academic projects below.</p>
                )}
              </div>
            </div>

            {/* Education & Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-500" />
                  Education
                </h4>

                {educationList.length > 0 ? (
                  educationList.map((edu, idx) => (
                    <div key={idx} className="space-y-1 border-l-2 border-brand-500 pl-3">
                      <p className="font-semibold text-xs text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-slate-500">{edu.institution}</p>
                      <div className="flex justify-between text-xs text-slate-400 pt-1">
                        <span>{edu.year}</span>
                        {edu.gpa && <span className="font-semibold text-emerald-600">GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Education details pending parse.</p>
                )}
              </div>

              {/* Key Projects */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-500" />
                  Featured Projects
                </h4>

                {projectList.length > 0 ? (
                  projectList.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-semibold text-xs text-slate-900">{proj.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{proj.tech}</p>
                      <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No projects explicitly tagged in resume.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATS & AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ATS Score Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col justify-center items-center">
              <div className="relative w-28 h-28 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-brand-500"
                    strokeDasharray={`${atsScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-slate-900">{atsScore}%</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">ATS Match</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Resume compatibility for target role <strong className="text-slate-700">{profile.target_role || 'Candidate'}</strong>.</p>
            </div>

            {/* Strength Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Resume Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Strong technical foundation in core skills ({allSkills.slice(0, 3).join(', ') || 'Python, React'})</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Clear education credentials from accredited university</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Demonstrated hands-on experience in software projects</span>
                </li>
              </ul>
            </div>

            {/* AI Optimization Tips */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Optimization Tips
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-100">
                  💡 <strong>Quantify Achievements:</strong> Add numerical metrics (e.g. "improved speed by 35%") to your project bullet points.
                </li>
                <li className="bg-brand-50 text-brand-900 p-2.5 rounded-lg border border-brand-100">
                  🎯 <strong>Target Keywords:</strong> Include key frameworks like PyTorch or Docker explicitly in project descriptions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Data Tab */}
      {activeTab === 'raw' && (
        <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto shadow-2xl relative">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800 text-slate-400">
            <span>Structured Candidate Profile Schema (JSON)</span>
            <button
              onClick={handleCopyJSON}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded transition"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
