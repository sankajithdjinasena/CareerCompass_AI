import { useState, useEffect } from 'react'
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, Sparkles, 
  User, Mail, Phone, GraduationCap, Briefcase, Award, Download, Lightbulb, Target, 
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
    experience: [
      { title: "Software Engineer Intern", company: "TechCorp Solutions", period: "2023 - Present", description: "Developed scalable REST microservices using Python FastAPI and React frontend components." },
      { title: "AI Project Assistant", company: "University AI Lab", period: "2022 - 2023", description: "Built NLP pipeline for document classification and skill extraction." }
    ],
    education: [
      { degree: "B.Sc. (Hons) in Software Engineering", institution: "University of Technology", year: "2021 - 2025", gpa: "3.85" }
    ],
    projects: [
      { name: "CareerCompass AI", tech: "React, Python, Groq AI", description: "Multi-agent career path analyzer and resume parser." }
    ]
  }

  const profile = reportData?.profile || demoProfile
  const allSkills = profile?.all_skills || demoProfile.all_skills
  const categorizedSkills = profile?.categorized_skills
  const experienceList = profile?.experience || demoProfile.experience
  const educationList = profile?.education || demoProfile.education
  const projectList = profile?.projects || demoProfile.projects
  const atsScore = reportData?.raw_skill_gaps?.readiness_pct ?? 88

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(profile, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (nameStr) => {
    if (!nameStr) return 'AP'
    return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Upload Card Header */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-500" />
              {sessionId ? 'Resume Analysis Complete' : 'Upload Your Resume'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl font-medium">
              Upload your PDF resume to run our 5-agent AI pipeline. Extract structured skill profiles, benchmark against industry target roles, and optimize ATS score.
            </p>
          </div>

          {/* Upload Controls */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {targetRole !== 'custom' && !(!ROLES.includes(targetRole) && targetRole !== 'auto') ? (
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={loading}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="auto">Auto-Detect Role</option>
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="custom">Other (Custom Role)...</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Quantum Engineer"
                  value={targetRole === 'custom' ? '' : targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={loading}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
                />
                <button
                  type="button"
                  onClick={() => setTargetRole('auto')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative flex-1">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 truncate">
                <UploadCloud className="w-4 h-4 text-brand-500" />
                <span className="truncate">{file ? file.name : 'Choose PDF Resume'}</span>
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Parse Resume'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Parsed Profile
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'insights'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            ATS & AI Insights
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === 'raw'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON Profile Data
          </button>
        </div>

        <div className="flex items-center gap-2">
          {fetchingReport && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
              Refreshing...
            </span>
          )}
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Info & Skill Badges */}
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{profile.name || 'Candidate Name'}</h3>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold text-xs rounded-full border border-brand-200 dark:border-brand-800/60">
                    {profile.target_role || 'Target Candidate'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
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
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Executive Summary</p>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    "{profile.summary}"
                  </p>
                </div>
              )}
            </div>

            {/* Categorized Skills Card */}
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Extracted Skills ({allSkills.length})
                </h4>
              </div>

              {categorizedSkills ? (
                Object.entries(categorizedSkills).map(([category, skills]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(skills) && skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {allSkills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 text-xs font-semibold rounded-md">
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
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-4 transition-colors">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Briefcase className="w-5 h-5 text-brand-500" />
                Work & Practical Experience
              </h4>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {experienceList.length > 0 ? (
                  experienceList.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-4 space-y-1' : 'space-y-1'}>
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{exp.title}</h5>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{exp.company}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-normal">{exp.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No formal work experience parsed. Highlighting academic projects below.</p>
                )}
              </div>
            </div>

            {/* Education & Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-3 transition-colors">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <GraduationCap className="w-5 h-5 text-brand-500" />
                  Education
                </h4>

                {educationList.length > 0 ? (
                  educationList.map((edu, idx) => (
                    <div key={idx} className="space-y-1 border-l-2 border-brand-500 pl-3">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{edu.degree}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{edu.institution}</p>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                        <span>{edu.year}</span>
                        {edu.gpa && <span className="font-extrabold text-emerald-600 dark:text-emerald-400">GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Education details pending parse.</p>
                )}
              </div>

              {/* Key Projects */}
              <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-3 transition-colors">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Award className="w-5 h-5 text-brand-500" />
                  Featured Projects
                </h4>

                {projectList.length > 0 ? (
                  projectList.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{proj.name}</p>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-mono font-semibold">{proj.tech}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal">{proj.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No projects explicitly tagged in resume.</p>
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
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md text-center flex flex-col justify-center items-center">
              <div className="relative w-28 h-28 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${atsScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{atsScore}%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">ATS Match</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">Resume compatibility for target role <strong className="text-slate-900 dark:text-white">{profile.target_role || 'Candidate'}</strong>.</p>
            </div>

            {/* Strength Highlights */}
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Resume Strengths
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Strong technical foundation in core skills ({allSkills.slice(0, 3).join(', ') || 'Python, React'})</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Clear education credentials from accredited university</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Demonstrated hands-on experience in software projects</span>
                </li>
              </ul>
            </div>

            {/* AI Optimization Tips */}
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Optimization Tips
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  <Lightbulb className="w-4 h-4 inline mr-1.5 text-amber-500" /><strong>Quantify Achievements:</strong> Add numerical metrics (e.g. "improved speed by 35%") to your project bullet points.
                </li>
                <li className="bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 p-3 rounded-lg border border-brand-200 dark:border-brand-800/50">
                  <Target className="w-4 h-4 inline mr-1.5 text-brand-500" /><strong>Target Keywords:</strong> Include key frameworks like PyTorch or Docker explicitly in project descriptions.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Data Tab */}
      {activeTab === 'raw' && (
        <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 font-mono text-xs overflow-x-auto shadow-lg relative">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800 text-slate-400">
            <span className="font-bold">Structured Candidate Profile Schema (JSON)</span>
            <button
              onClick={handleCopyJSON}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition font-sans font-semibold"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-emerald-400">{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
