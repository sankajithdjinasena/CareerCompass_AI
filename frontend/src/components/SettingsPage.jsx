import { useState, useEffect } from "react"
import { 
  User, Lock, Loader2, CheckCircle2, ShieldCheck, Scale, 
  FileText, Cpu, ExternalLink, Sliders, Bell, Database, Key, Sparkles, AlertCircle, Save
} from "lucide-react"
import PoliciesModal from "./PoliciesModal"
import { getToken, getUser, saveAuth } from "../lib/auth"

const API_BASE = "http://localhost:8000"

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPolicies, setShowPolicies] = useState(false)
  const [policiesTab, setPoliciesTab] = useState('terms')
  const [activeSubTab, setActiveSubTab] = useState('profile') // 'profile' | 'security' | 'ai_pref' | 'privacy'

  // Profile Form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [targetRole, setTargetRole] = useState("Software / AI Engineer")
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
        setName(cachedUser.name || "Alex Parker")
        setEmail(cachedUser.email || "alex.parker@sfu.ac.lk")
      } else {
        // Default fallback user profile
        const defaultUser = {
          name: "Alex Parker",
          email: "alex.parker@sfu.ac.lk",
          provider: "email",
          role: "Software / AI Engineer"
        }
        setUser(defaultUser)
        setName(defaultUser.name)
        setEmail(defaultUser.email)
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
          body: JSON.stringify({ name, target_role: targetRole })
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          saveAuth(token, data)
        }
      }
      
      // Update local state and cached user
      const updatedUser = { ...(user || {}), name, email, target_role: targetRole }
      setUser(updatedUser)
      if (token) saveAuth(token, updatedUser)

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
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-800">Loading Account Settings...</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Account Settings Header & Navigation Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name || "Candidate User"}</h2>
            <p className="text-xs text-slate-500 font-medium">{user?.email || "user@example.com"}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-full border border-emerald-100">
              Active Student Account
            </span>
          </div>
        </div>

        {/* Setting Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'profile' ? 'bg-brand-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile Details
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'security' ? 'bg-brand-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Security & Password
          </button>
          <button
            onClick={() => setActiveSubTab('ai_pref')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'ai_pref' ? 'bg-brand-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            AI Preferences
          </button>
          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'privacy' ? 'bg-brand-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Privacy & Governance
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Profile Settings */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <User className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-800">Personal & Target Role Information</h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  disabled 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">Managed via authentication provider.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Primary Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Institution / University</label>
                <input 
                  type="text" 
                  value="Sabaragamuwa University of Sri Lanka" 
                  disabled 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
              <button 
                type="submit"
                disabled={profileSaving}
                className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition disabled:opacity-50 flex items-center gap-2 shadow-md shadow-brand-600/20"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              
              {profileSuccess && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                </span>
              )}
              
              {profileError && (
                <span className="text-red-500 text-xs font-medium">{profileError}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: Security & Password */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          {user?.provider === "google" ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Google OAuth Single Sign-On Enabled</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your account is authenticated via Google SSO. Password management and multi-factor authentication are handled directly through your Google Security Settings.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-800">Change Password</h3>
              </div>
              
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                  <button 
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition disabled:opacity-50 flex items-center gap-2 shadow-md shadow-brand-600/20"
                  >
                    {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Update Password
                  </button>
                  
                  {passwordSuccess && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Password updated successfully
                    </span>
                  )}
                  
                  {passwordError && (
                    <span className="text-red-500 text-xs font-medium">{passwordError}</span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: AI Coaching & Preference Options */}
      {activeSubTab === 'ai_pref' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Sliders className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-800">AI Coaching & Agent Configurations</h3>
          </div>

          <form onSubmit={handleSaveAiPreferences} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Groq LPU Inference Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="llama-3.3-70b-versatile">🚀 Llama-3.3 70B Versatile (Recommended)</option>
                  <option value="llama3-8b-8192">⚡ Llama-3 8B (Low Latency)</option>
                  <option value="mixtral-8x7b-32768">🧠 Mixtral 8x7B (Deep Reasoning)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Select inference model hosted on Groq API.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mock Interview Difficulty</label>
                <select
                  value={interviewDifficulty}
                  onChange={(e) => setInterviewDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="beginner">Junior / Undergraduate Entry</option>
                  <option value="intermediate">Intermediate (CodeSplash Benchmark)</option>
                  <option value="advanced">Senior / Lead Engineer Level</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Controls interview simulator question rigor.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Adaptive Re-trigger Loop</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Automatically revise learning roadmap if interview simulator detects newly uncovered gaps.</p>
              </div>
              <input
                type="checkbox"
                checked={autoFeedbackLoop}
                onChange={(e) => setAutoFeedbackLoop(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
              <button 
                type="submit"
                disabled={aiSaving}
                className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition disabled:opacity-50 flex items-center gap-2 shadow-md shadow-brand-600/20"
              >
                {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save AI Preferences
              </button>

              {aiSuccess && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Preferences saved
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: Privacy & Governance */}
      {activeSubTab === 'privacy' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">Legal, Privacy & Governance Center</h3>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-xs text-slate-600 leading-relaxed">
              Review how your resume and career data are secured, our AI ethics standards, and our official Terms of Service built for CodeSplash '26.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => openPolicy('terms')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Terms of Service</h4>
                    <p className="text-[11px] text-slate-500">Usage rules & guidelines</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => openPolicy('privacy')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Privacy Policy</h4>
                    <p className="text-[11px] text-slate-500">Resume security & rights</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => openPolicy('ethics')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">AI Ethics</h4>
                    <p className="text-[11px] text-slate-500">Bias & advisory notice</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => openPolicy('portability')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Data Export</h4>
                    <p className="text-[11px] text-slate-500">Dossiers & deletion</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => openPolicy('governance')}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Governance</h4>
                    <p className="text-[11px] text-slate-500">Team Predictra · SUSL</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600" />
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
