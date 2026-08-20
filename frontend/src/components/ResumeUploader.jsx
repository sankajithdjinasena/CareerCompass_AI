import { useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'

export default function ResumeUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async () => {
    if (!file) return
    
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
        body: JSON.stringify({ target_role: 'data_scientist' })
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
          className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          {file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : 'Select Resume'}
        </button>
      </div>

      <button 
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
      </button>
    </div>
  )
}
