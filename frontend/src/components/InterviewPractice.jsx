import { useEffect, useState } from 'react'
import { Loader2, PlayCircle, CheckCircle2, TrendingUp, RefreshCw, Volume2 } from 'lucide-react'

const API_BASE = 'http://localhost:8000'

export default function InterviewPractice({ sessionId }) {
  const [phase, setPhase] = useState('loading') // loading | ready | submitting | scored | error
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const loadQuestions = async () => {
    setPhase('loading')
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/interview/questions/${sessionId}`, {
        method: 'POST',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Failed to load interview questions')
      }
      const data = await res.json()
      setQuestions(data.questions || [])
      setPhase('ready')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    setPhase('submitting')
    setError(null)
    try {
      const payload = {
        answers: Object.fromEntries(
          questions.map((q) => [String(q.id), answers[q.id] || ''])
        ),
      }
      const res = await fetch(`${API_BASE}/api/interview/evaluate/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Failed to evaluate answers')
      }
      const { data } = await res.json()
      setResult(data)
      setPhase('scored')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setResult(null)
    loadQuestions()
  }

  const speakQuestion = (text) => {
    if (!window.speechSynthesis) {
      alert("Text-to-Speech is not supported in your browser.")
      return
    }
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95 
    utterance.pitch = 1.0
    
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                           voices.find(v => v.lang === 'en-US') || 
                           voices.find(v => v.lang.startsWith('en'))
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    window.speechSynthesis.speak(utterance)
  }

  if (!sessionId) {
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] text-center">
        <PlayCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No active session</h3>
        <p className="text-slate-400 text-sm mt-1">Upload and analyze a resume from the Dashboard first.</p>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/5 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-white/10">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-white">Preparing your mock interview...</h3>
        <p className="text-slate-400 text-sm mt-1">Generating role-specific questions</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700">
        <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadQuestions}
          className="mt-4 bg-white/5 backdrop-blur-md border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20"
        >
          Try again
        </button>
      </div>
    )
  }

  if (phase === 'scored' && result) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h3 className="text-lg font-bold text-white">Interview Results</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">{result.readiness_score}</span>
              <span className="text-slate-400 text-sm">/ 100 readiness</span>
            </div>
          </div>

          {result.adaptive_loop_triggered && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
              <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Your live answers revealed skill gaps your resume didn't show. The Learning Path Agent
                automatically updated your roadmap — check the Dashboard.
              </span>
            </div>
          )}

          <div className="space-y-3">
            {(result.per_question_feedback || []).map((f) => {
              const q = questions.find((qq) => qq.id === f.id)
              const verdictColor =
                f.verdict === 'strong'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                  : f.verdict === 'partial'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-red-500/10 text-red-700 border-red-500/20'
              return (
                <div key={f.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-medium text-white">{q?.question}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${verdictColor}`}>
                      {f.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{f.feedback}</p>
                </div>
              )
            })}
          </div>

          {result.newly_detected_gaps?.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold uppercase text-slate-400 mb-2">Newly detected gaps</h5>
              <div className="flex flex-wrap gap-2">
                {result.newly_detected_gaps.map((g) => (
                  <span key={g} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-medium border border-amber-200">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleRetry}
            className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Practice again
          </button>
        </div>
      </div>
    )
  }

  // phase === 'ready' or 'submitting'
  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
      <h3 className="text-lg font-bold text-white mb-1 border-b pb-3">Mock Interview</h3>
      <p className="text-sm text-slate-400 mt-3 mb-6">
        Answer honestly — your answers here can reveal gaps your resume didn't show, and your
        learning roadmap will adapt automatically.
      </p>

      <div className="space-y-5">
        {questions.map((q, idx) => (
          <div key={q.id}>
            <div className="flex items-start gap-2 mb-1">
              <label className="block text-sm font-semibold text-white">
                {idx + 1}. {q.question}
              </label>
              <button 
                onClick={() => speakQuestion(q.question)}
                title="Read question out loud"
                className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors flex-shrink-0 -mt-0.5"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2">Targets: {q.targets_skill}</p>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-black/20 text-white placeholder-slate-500 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Type your answer..."
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={phase === 'submitting'}
        className="mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        {phase === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Scoring your answers...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" /> Submit for evaluation
          </>
        )}
      </button>
    </div>
  )
}