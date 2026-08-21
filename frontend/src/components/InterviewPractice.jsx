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
<<<<<<< HEAD
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-800">Preparing your 20-question mock test...</h3>
        <p className="text-slate-500 text-sm mt-1">Generating 10 MCQs and 10 Open-Ended technical scenarios</p>
=======
      <div className="flex flex-col items-center justify-center h-64 bg-white/5 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-white/10">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-white">Preparing your mock interview...</h3>
        <p className="text-slate-400 text-sm mt-1">Generating role-specific questions</p>
>>>>>>> f8ed98d0188750af755f2cf8a2894732292a13d6
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
<<<<<<< HEAD
            <div>
              <h3 className="text-lg font-bold text-slate-800">Interview Results</h3>
              <p className="text-xs text-slate-500">Evaluated across all 20 questions</p>
            </div>
=======
            <h3 className="text-lg font-bold text-white">Interview Results</h3>
>>>>>>> f8ed98d0188750af755f2cf8a2894732292a13d6
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
<<<<<<< HEAD
                  : 'bg-red-50 text-red-700 border-red-200'
              
              const isMcq = q?.type === 'mcq' || (q?.options && q.options.length > 0)
              const userAns = answers[q?.id]

              return (
                <div key={f.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/30">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 mr-2">Q{f.id} {isMcq ? '(MCQ)' : '(Open)'}</span>
                      <span className="text-sm font-medium text-slate-800">{q?.question}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${verdictColor}`}>
                      {f.verdict}
                    </span>
                  </div>
                  {isMcq && userAns && (
                    <p className="text-xs font-medium text-slate-600 mt-1">
                      Your answer: <span className="text-brand-600 font-semibold">{userAns}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{f.feedback}</p>
=======
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
>>>>>>> f8ed98d0188750af755f2cf8a2894732292a13d6
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

<<<<<<< HEAD
  const answeredCount = questions.filter(q => !!answers[q.id] && answers[q.id].trim() !== '').length
  const mcqQuestions = questions.filter(q => q.type === 'mcq' || (q.options && q.options.length > 0))
  const openQuestions = questions.filter(q => q.type !== 'mcq' && (!q.options || q.options.length === 0))

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Comprehensive Mock Test</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            20 total questions (10 Multiple Choice + 10 Technical Scenarios).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
            {answeredCount} / {questions.length} Answered
          </span>
        </div>
=======
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
>>>>>>> f8ed98d0188750af755f2cf8a2894732292a13d6
      </div>

      {/* Part 1: Multiple Choice Questions */}
      {mcqQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-sm border-b pb-2">
            <HelpCircle className="w-4 h-4 text-brand-500" />
            <span>Part 1: Multiple Choice Questions ({mcqQuestions.length} Questions)</span>
          </div>

          <div className="space-y-4">
            {mcqQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded mr-2">
                      Q{idx + 1} (MCQ)
                    </span>
                    <span className="text-xs text-slate-400">Targets: {q.targets_skill}</span>
                    <h4 className="text-sm font-semibold text-slate-800 mt-1.5">{q.question}</h4>
                  </div>
                  <button 
                    onClick={() => speakQuestion(q.question)}
                    title="Read question out loud"
                    className="p-1 text-brand-500 hover:bg-brand-50 rounded-full transition-colors flex-shrink-0"
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
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
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
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm border-b pb-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <span>Part 2: Open-Ended Technical & Scenario Questions ({openQuestions.length} Questions)</span>
          </div>

          <div className="space-y-4">
            {openQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded mr-2">
                      Q{mcqQuestions.length + idx + 1} (Scenario)
                    </span>
                    <span className="text-xs text-slate-400">Targets: {q.targets_skill}</span>
                    <h4 className="text-sm font-semibold text-slate-800 mt-1.5">{q.question}</h4>
                  </div>
                  <button 
                    onClick={() => speakQuestion(q.question)}
                    title="Read question out loud"
                    className="p-1 text-brand-500 hover:bg-brand-50 rounded-full transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
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
<<<<<<< HEAD
        className="mt-6 w-full sm:w-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
=======
        className="mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
>>>>>>> f8ed98d0188750af755f2cf8a2894732292a13d6
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