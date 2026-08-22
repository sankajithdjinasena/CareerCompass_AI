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
      <div className="bg-white dark:bg-slate-900/90 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md text-center transition-colors">
        <PlayCircle className="w-12 h-12 text-brand-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active session</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Upload and analyze a resume from the Dashboard first.</p>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900/90 rounded-xl shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preparing your 20-question mock test...</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Generating 10 MCQs and 10 Open-Ended technical scenarios</p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-800 dark:text-red-300">
        <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
        <p className="text-sm font-medium">{error}</p>
        <button
          onClick={loadQuestions}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition"
        >
          Try again
        </button>
      </div>
    )
  }

  if (phase === 'scored' && result) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Interview Results</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Evaluated across all 20 questions</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{result.readiness_score}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">/ 100 readiness</span>
            </div>
          </div>

          {result.adaptive_loop_triggered && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-sm rounded-lg p-4 mb-4 flex items-start gap-2.5 font-medium">
              <RefreshCw className="w-5 h-5 mt-0.5 text-amber-500 flex-shrink-0" />
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
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                  : f.verdict === 'partial'
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                  : 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/60'
              
              const isMcq = q?.type === 'mcq' || (q?.options && q.options.length > 0)
              const userAns = answers[q?.id]

              return (
                <div key={f.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Q{f.id} {isMcq ? '(MCQ)' : '(Open)'}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{q?.question}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${verdictColor}`}>
                      {f.verdict}
                    </span>
                  </div>
                  {isMcq && userAns && (
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                      Your answer: <span className="text-brand-600 dark:text-brand-400 font-bold">{userAns}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">{f.feedback}</p>
                </div>
              )
            })}
          </div>

          {result.newly_detected_gaps?.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Newly detected gaps</h5>
              <div className="flex flex-wrap gap-2">
                {result.newly_detected_gaps.map((g) => (
                  <span key={g} className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded text-xs font-semibold border border-amber-200 dark:border-amber-800/60">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleRetry}
            className="mt-6 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow"
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
    <div className="bg-white dark:bg-slate-900/90 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Comprehensive Mock Test</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
            20 total questions (10 Multiple Choice + 10 Technical Scenarios).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800/60">
            {answeredCount} / {questions.length} Answered
          </span>
        </div>
      </div>

      {/* Part 1: Multiple Choice Questions */}
      {mcqQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            <HelpCircle className="w-4 h-4 text-brand-500" />
            <span>Part 1: Multiple Choice Questions ({mcqQuestions.length} Questions)</span>
          </div>

          <div className="space-y-4">
            {mcqQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/60 px-2 py-0.5 rounded mr-2">
                      Q{idx + 1} (MCQ)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Targets: {q.targets_skill}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{q.question}</h4>
                  </div>
                  <button 
                    onClick={() => speakQuestion(q.question)}
                    title="Read question out loud"
                    className="p-1.5 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(q.options || []).map((opt) => {
                    const selected = answers[q.id] === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`text-left p-3 rounded-lg border text-sm font-semibold transition-all ${
                          selected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Part 2: Open-Ended Technical & Scenario Questions ({openQuestions.length} Questions)</span>
          </div>

          <div className="space-y-4">
            {openQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded mr-2">
                      Q{mcqQuestions.length + idx + 1} (Scenario)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Targets: {q.targets_skill}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{q.question}</h4>
                  </div>
                  <button 
                    onClick={() => speakQuestion(q.question)}
                    title="Read question out loud"
                    className="p-1.5 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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
        className="mt-6 w-full sm:w-auto bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
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