import { useEffect, useState } from 'react'
import { Loader2, PlayCircle, CheckCircle2, TrendingUp, RefreshCw, Volume2, HelpCircle, FileText } from 'lucide-react'

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
        <h3 className="text-lg font-medium text-white">Preparing your 20-question mock test...</h3>
        <p className="text-slate-400 text-sm mt-1">Generating 10 MCQs and 10 Open-Ended technical scenarios</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadQuestions}
          className="mt-4 bg-white/5 backdrop-blur-md border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20"
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
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Interview Results</h3>
              <p className="text-xs text-slate-400">Evaluated across all 20 questions</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">{result.readiness_score}</span>
              <span className="text-slate-400 text-sm">/ 100 readiness</span>
            </div>
          </div>

          {result.adaptive_loop_triggered && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
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
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : f.verdict === 'partial'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              
              const isMcq = q?.type === 'mcq' || (q?.options && q.options.length > 0)
              const userAns = answers[q?.id]

              return (
                <div key={f.id} className="border border-white/10 rounded-lg p-4 bg-black/20">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 mr-2">Q{f.id} {isMcq ? '(MCQ)' : '(Open)'}</span>
                      <span className="text-sm font-medium text-white">{q?.question}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${verdictColor}`}>
                      {f.verdict}
                    </span>
                  </div>
                  {isMcq && userAns && (
                    <p className="text-xs font-medium text-slate-300 mt-1">
                      Your answer: <span className="text-emerald-400 font-semibold">{userAns}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{f.feedback}</p>
                </div>
              )
            })}
          </div>

          {result.newly_detected_gaps?.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-semibold uppercase text-slate-400 mb-2">Newly detected gaps</h5>
              <div className="flex flex-wrap gap-2">
                {result.newly_detected_gaps.map((g) => (
                  <span key={g} className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">
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

  const answeredCount = questions.filter(q => !!answers[q.id] && answers[q.id].trim() !== '').length
  const mcqQuestions = questions.filter(q => q.type === 'mcq' || (q.options && q.options.length > 0))
  const openQuestions = questions.filter(q => q.type !== 'mcq' && (!q.options || q.options.length === 0))

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Comprehensive Mock Test</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            20 total questions (10 Multiple Choice + 10 Technical Scenarios).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            {answeredCount} / {questions.length} Answered
          </span>
        </div>
      </div>

      {/* Part 1: Multiple Choice Questions */}
      {mcqQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-white/10 pb-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Part 1: Multiple Choice Questions ({mcqQuestions.length} Questions)</span>
          </div>

          <div className="space-y-4">
            {mcqQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-white/10 rounded-xl bg-black/20 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mr-2">
                      Q{idx + 1} (MCQ)
                    </span>
                    <span className="text-xs text-slate-400">Targets: {q.targets_skill}</span>
                    <h4 className="text-sm font-semibold text-white mt-1.5">{q.question}</h4>
                  </div>
                  <button 
                    onClick={() => speakQuestion(q.question)}
                    title="Read question out loud"
                    className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || []).map((opt) => {
                    const selected = answers[q.id] === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`text-left p-3 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-emerald-500/40 hover:bg-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 2: Open-Ended Technical Scenarios */}
      {openQuestions.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm border-b border-white/10 pb-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Part 2: Open-Ended Technical & Scenario Questions ({openQuestions.length} Questions)</span>
          </div>

          <div className="space-y-4">
            {openQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-white/10 rounded-xl bg-black/20 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded mr-2">
                      Q{mcqQuestions.length + idx + 1} (Scenario)
                    </span>
                    <span className="text-xs text-slate-400">Targets: {q.targets_skill}</span>
                    <h4 className="text-sm font-semibold text-white mt-1.5">{q.question}</h4>
                  </div>
                  <button 
                    onClick={() => speakQuestion(q.question)}
                    title="Read question out loud"
                    className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-black/20 text-white placeholder-slate-500 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Type your detailed answer..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={phase === 'submitting'}
        className="mt-6 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {phase === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Scoring your answers...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" /> Submit all 20 answers for evaluation
          </>
        )}
      </button>
    </div>
  )
}