import { useState, useEffect } from "react"
import { 
  User, Lock, Loader2, CheckCircle2, ShieldCheck, Scale, 
  FileText, Cpu, ExternalLink, Sliders, Save, Key
} from "lucide-react"
import PoliciesModal from "./PoliciesModal"
import { getToken, getUser, saveAuth } from "../lib/auth"

const API_BASE = "http://localhost:8000"

export default function SettingsPage({ onProfileUpdate }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPolicies, setShowPolicies] = useState(false)
  const [policiesTab, setPoliciesTab] = useState('terms')
  const [activeSubTab, setActiveSubTab] = useState('profile') // 'profile' | 'security' | 'ai_pref' | 'privacy'

  // Profile Form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [targetRole, setTargetRole] = useState("Software / AI Engineer")
  const [skills, setSkills] = useState([])      // list of skill strings
  const [skillInput, setSkillInput] = useState("") // current text in skills input
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")

  // AI Preferences State
  const [aiModel, setAiModel] = useState("llama-3.3-70b-versatile")
  const [interviewDifficulty, setInterviewDifficulty] = useState("intermediate")
  const [autoFeedbackLoop, setAutoFeedbackLoop] = useState(true)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSuccess, setAiSuccess] = useState(false)

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const openPolicy = (tab) => {
    setPoliciesTab(tab)
    setShowPolicies(true)
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken() || localStorage.getItem("cc_auth_token")
      const cachedUser = getUser()
      
      // Load cached user if available
      if (cachedUser) {
        setUser(cachedUser)
        setName(cachedUser.name || "")
        setEmail(cachedUser.email || "")
        if (cachedUser.target_role) setTargetRole(cachedUser.target_role)
        if (Array.isArray(cachedUser.skills)) setSkills(cachedUser.skills)
      }

      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data)
            setName(data.name || "")
            setEmail(data.email || "")
            if (data.target_role) setTargetRole(data.target_role)
            if (Array.isArray(data.skills)) setSkills(data.skills)
          }
        } catch (err) {
          console.error("Using cached profile:", err)
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError("")
    setProfileSuccess(false)

    try {
      const token = getToken() || localStorage.getItem("cc_auth_token")
      if (token) {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, target_role: targetRole, skills })
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          // Persist updated user (including target_role and skills) to localStorage
          saveAuth(token, data)
          // Notify App.jsx to refresh authUser for the dashboard
          if (onProfileUpdate) onProfileUpdate(data)
        } else {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail || "Failed to update profile")
        }
      }

      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err.message || "Failed to update profile")
    } finally {
      setProfileSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordError("")
    setPasswordSuccess(false)

    try {
      const token = getToken() || localStorage.getItem("cc_auth_token")
      if (token) {
        const res = await fetch(`${API_BASE}/api/auth/password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            current_password: currentPassword,
            new_password: newPassword
          })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Failed to update password")
      }
      
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSaveAiPreferences = (e) => {
    e.preventDefault()
    setAiSaving(true)
    setTimeout(() => {
      setAiSaving(false)
      setAiSuccess(true)
      setTimeout(() => setAiSuccess(false), 3000)
    }, 600)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900/90 rounded-xl shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Account Settings...</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Account Settings Header & Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border-2 border-white dark:border-slate-700">
            {user?.picture
              ? <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U'}
                </div>
            }
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name || "Candidate User"}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{user?.email || "user@example.com"}</p>
            <span className="inline-block mt-1 px-3 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300 dark:border-emerald-800/60">
              Active Student Account
            </span>
          </div>
        </div>

        {/* Setting Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'profile' 
                ? 'bg-brand-600 text-white shadow' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Details
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'security' 
                ? 'bg-brand-600 text-white shadow' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security & Password
          </button>
          <button
            onClick={() => setActiveSubTab('ai_pref')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'ai_pref' 
                ? 'bg-brand-600 text-white shadow' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            AI Preferences
          </button>
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'privacy' 
                ? 'bg-brand-600 text-white shadow' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy & Governance
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Profile Settings */}
      {activeSubTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md overflow-hidden transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center gap-3">
            <User className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal & Target Role Information</h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  disabled 
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed font-medium"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Managed via authentication provider.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Primary Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Software / AI Engineer">Software / AI Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Institution / University</label>
                <input 
                  type="text" 
                  value="Sabaragamuwa University of Sri Lanka" 
                  disabled 
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed font-semibold"
                />
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">My Skills</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">These show as your top skills on the dashboard when no resume is uploaded.</p>
              {/* Tag list */}
              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                {skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-brand-100 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300 px-3 py-1 rounded-full text-xs font-bold border border-brand-200 dark:border-brand-700">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(s => s.filter((_, j) => j !== i))}
                      className="text-brand-500 hover:text-red-500 transition-colors ml-0.5 leading-none"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                )}
              </div>
              {/* Input to add new skills */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
                      e.preventDefault()
                      const newSkill = skillInput.trim().replace(/,$/, '')
                      if (newSkill && !skills.includes(newSkill)) {
                        setSkills(s => [...s, newSkill])
                      }
                      setSkillInput('')
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Python, React)"
                  className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSkill = skillInput.trim().replace(/,$/, '')
                    if (newSkill && !skills.includes(newSkill)) {
                      setSkills(s => [...s, newSkill])
                    }
                    setSkillInput('')
                  }}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button 
                type="submit"
                disabled={profileSaving}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center gap-2 shadow"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              
              {profileSuccess && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                </span>
              )}
              
              {profileError && (
                <span className="text-red-600 dark:text-red-400 text-xs font-bold">{profileError}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: Security & Password */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          {user?.provider === "google" ? (
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md p-6 flex items-start gap-4 transition-colors">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Google OAuth Single Sign-On Enabled</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                  Your account is authenticated via Google SSO. Password management and multi-factor authentication are handled directly through your Google Security Settings.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md overflow-hidden transition-colors">
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Change Password</h3>
              </div>
              
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button 
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center gap-2 shadow"
                  >
                    {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Update Password
                  </button>
                  
                  {passwordSuccess && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                      <CheckCircle2 className="w-4 h-4" /> Password updated successfully
                    </span>
                  )}
                  
                  {passwordError && (
                    <span className="text-red-600 dark:text-red-400 text-xs font-bold">{passwordError}</span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: AI Coaching & Preference Options */}
      {activeSubTab === 'ai_pref' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md overflow-hidden transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center gap-3">
            <Sliders className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">AI Coaching & Agent Configurations</h3>
          </div>

          <form onSubmit={handleSaveAiPreferences} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Groq LPU Inference Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="llama-3.3-70b-versatile">Llama-3.3 70B Versatile (Recommended)</option>
                  <option value="llama3-8b-8192">Llama-3 8B (Low Latency)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Deep Reasoning)</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Select inference model hosted on Groq API.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Mock Interview Difficulty</label>
                <select
                  value={interviewDifficulty}
                  onChange={(e) => setInterviewDifficulty(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="beginner">Junior / Undergraduate Entry</option>
                  <option value="intermediate">Intermediate (CodeSplash Benchmark)</option>
                  <option value="advanced">Senior / Lead Engineer Level</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Controls interview simulator question rigor.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Adaptive Re-trigger Loop</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Automatically revise learning roadmap if interview simulator detects newly uncovered gaps.</p>
              </div>
              <input
                type="checkbox"
                checked={autoFeedbackLoop}
                onChange={(e) => setAutoFeedbackLoop(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button 
                type="submit"
                disabled={aiSaving}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center gap-2 shadow"
              >
                {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save AI Preferences
              </button>

              {aiSuccess && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                  <CheckCircle2 className="w-4 h-4" /> Preferences saved
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: Privacy & Governance */}
      {activeSubTab === 'privacy' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md overflow-hidden transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Legal, Privacy & Governance Center</h3>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Review how your resume and career data are secured, our AI ethics standards, and our official Terms of Service built for CodeSplash '26.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => openPolicy('terms')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Terms of Service</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Usage rules & guidelines</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-600" />
              </button>

              <button
                onClick={() => openPolicy('privacy')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Privacy Policy</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resume security & rights</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-600" />
              </button>

              <button
                onClick={() => openPolicy('ethics')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">AI Ethics</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bias & advisory notice</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-600" />
              </button>

              <button
                onClick={() => openPolicy('portability')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Data Export</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dossiers & deletion</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-600" />
              </button>

              <button
                onClick={() => openPolicy('governance')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Governance</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team Predictra · SUSL</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal & Policies Modal */}
      <PoliciesModal
        isOpen={showPolicies}
        onClose={() => setShowPolicies(false)}
        initialTab={policiesTab}
      />
      
    </div>
  )
}
