import { useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'

export default function ResumeUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ROLES = [
    'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 
    'DevOps Engineer', 'Cybersecurity Analyst', 'Mobile App Developer', 
    'Cloud Engineer', 'QA / Test Engineer', 'Business Analyst',
    'Network Engineer', 'UI/UX Designer', 'Product Manager', 
    'Game Developer', 'Database Administrator', 'Site Reliability Engineer'
  ]

  const handleUpload = async () => {
    if (!file || !targetRole) return
    
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // 1. Upload
      const res = await fetch('http://localhost:8000/api/upload-resume', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const sid = data.session_id
      
      // 2. Trigger Pipeline (runs in background)
      const pipelineRes = await fetch(`http://localhost:8000/api/run-pipeline/${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_role: targetRole })
      })
      
      if (!pipelineRes.ok) {
        throw new Error('Failed to start analysis pipeline')
      }
      
      onUploadComplete(sid)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-red-500 text-sm max-w-xs truncate" title={error}>{error}</p>}
      
      {targetRole !== 'custom' && !(!ROLES.includes(targetRole) && targetRole !== 'auto') ? (
        <select 
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          disabled={loading}
          className="bg-slate-800 border border-white/20 text-white px-3 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="auto">Auto-Detect Best Fit</option>
          {ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
          <option value="custom">Other (Custom Role)...</option>
        </select>
      ) : (
        <div className="flex items-center gap-1">
          <input
            type="text"
            autoFocus
            placeholder="e.g. Quantum Engineer"
            value={targetRole === 'custom' ? '' : targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={loading}
            className="bg-black/20 border border-white/20 text-white placeholder-slate-400 px-3 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48"
          />
          <button
            type="button"
            onClick={() => setTargetRole('auto')}
            className="text-slate-400 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative">
        <input 
          type="file" 
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Upload Resume PDF"
        />
        <button 
          disabled={loading}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-brand-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" />
          {file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : 'Select Resume'}
        </button>
      </div>

      <button 
        onClick={handleUpload}
        disabled={!file || !targetRole || loading}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
      </button>
    </div>
  )
}
