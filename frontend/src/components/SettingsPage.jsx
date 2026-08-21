
import { useState, useEffect } from "react"
import { User, Lock, Loader2, CheckCircle2 } from "lucide-react"

const API_BASE = "http://localhost:8000"

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Profile Form
  const [name, setName] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          setName(data.name || "")
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError("")
    setProfileSuccess(false)

    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      })

      if (!res.ok) throw new Error("Failed to update profile")
      
      const data = await res.json()
      setUser(data)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err.message)
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
      const token = localStorage.getItem("auth_token")
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-800">Loading settings...</h3>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="text-lg font-bold mb-2">Not logged in</h3>
        <p className="text-sm">Please log in to manage your settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Profile Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-3">
          <User className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-800">Profile Settings</h2>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={user.email} 
                disabled 
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="submit"
              disabled={profileSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile
            </button>
            
            {profileSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Profile updated
              </span>
            )}
            
            {profileError && (
              <span className="text-red-500 text-sm">{profileError}</span>
            )}
          </div>
        </form>
      </div>

      {/* Password Settings */}
      {user.provider === "email" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                type="submit"
                disabled={passwordSaving}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
              
              {passwordSuccess && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Password changed
                </span>
              )}
              
              {passwordError && (
                <span className="text-red-500 text-sm">{passwordError}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {user.provider === "google" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
            <img src={user.picture || "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"} alt="Google" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Google Authentication</h3>
            <p className="text-sm text-slate-500 mt-1">You signed in using your Google account. To change your password, please visit your Google Account settings.</p>
          </div>
        </div>
      )}
      
    </div>
  )
}

