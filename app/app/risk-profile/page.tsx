'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react'
import type { RiskProfile } from '@/types'
import { useRiskProfile } from '@/contexts/RiskProfileContext'

const PROFILES: {
  id: RiskProfile
  label: string
  description: string
  buyThreshold: number
  sellThreshold: number
  color: string
  bgActive: string
  borderActive: string
  dot: string
}[] = [
  {
    id: 'low',
    label: 'Low Risk',
    description: 'Conservative. Only triggers BUY on high-confidence positive sentiment. Ideal for preserving capital.',
    buyThreshold: 75,
    sellThreshold: 45,
    color: 'text-blue-600 dark:text-blue-300',
    bgActive: 'bg-blue-100 dark:bg-blue-900/20',
    borderActive: 'border-blue-500/50',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  {
    id: 'moderate',
    label: 'Moderate Risk',
    description: 'Balanced. Requires solid sentiment signals to act. Suitable for most investors.',
    buyThreshold: 60,
    sellThreshold: 55,
    color: 'text-[#22c55e]',
    bgActive: 'bg-[#22c55e]/10',
    borderActive: 'border-[#22c55e]/50',
    dot: 'bg-[#22c55e]',
  },
  {
    id: 'high',
    label: 'High Risk',
    description: 'Aggressive. Triggers BUY on moderate positive sentiment. Higher potential upside and downside.',
    buyThreshold: 45,
    sellThreshold: 70,
    color: 'text-orange-600 dark:text-orange-300',
    bgActive: 'bg-orange-100 dark:bg-orange-900/20',
    borderActive: 'border-orange-500/50',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
]

const QUIZ_QUESTIONS: {
  id: number
  scenario: string
  answers: { label: string; score: number }[]
}[] = [
  {
    id: 1,
    scenario: 'The market drops 20% in a single week. What do you do?',
    answers: [
      { label: 'Sell to protect what I have left', score: 1 },
      { label: 'Hold and wait for recovery', score: 2 },
      { label: 'Buy more — prices are on sale', score: 3 },
    ],
  },
  {
    id: 2,
    scenario: 'You have $10,000 to invest. How do you allocate it?',
    answers: [
      { label: 'Bonds and blue-chip stocks only', score: 1 },
      { label: 'Mix of stable stocks and a few growth plays', score: 2 },
      { label: 'Concentrate in high-growth or volatile names', score: 3 },
    ],
  },
  {
    id: 3,
    scenario: 'A stock you own is up 60% in two months. You:',
    answers: [
      { label: 'Take all profits now', score: 1 },
      { label: 'Sell half, let the rest ride', score: 2 },
      { label: 'Hold or buy more — it is on a run', score: 3 },
    ],
  },
  {
    id: 4,
    scenario: 'Your portfolio is down 40%. How do you feel?',
    answers: [
      { label: 'Stressed — I need to exit before it gets worse', score: 1 },
      { label: 'Concerned, but I will stay patient', score: 2 },
      { label: 'Opportunity — time to average down hard', score: 3 },
    ],
  },
  {
    id: 5,
    scenario: 'What is your investment time horizon?',
    answers: [
      { label: 'Less than 1 year', score: 1 },
      { label: '1–3 years', score: 2 },
      { label: '5+ years', score: 3 },
    ],
  },
]

function scoreToProfile(total: number): RiskProfile {
  if (total <= 8) return 'low'
  if (total <= 11) return 'moderate'
  return 'high'
}

type Mode = 'choose' | 'select' | 'quiz' | 'done'

export default function RiskProfilePage() {
  const { riskProfile, setRiskProfile } = useRiskProfile()
  const [mode, setMode] = useState<Mode>('choose')
  const [selected, setSelected] = useState<RiskProfile>(riskProfile)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<RiskProfile | null>(null)

  const active = PROFILES.find((p) => p.id === selected)!

  function saveProfile(r: RiskProfile) {
    setRiskProfile(r)
    setSelected(r)
    setMode('done')
  }

  function handleQuizAnswer(score: number) {
    const updated = [...quizAnswers, score]
    setQuizAnswers(updated)
    if (updated.length === QUIZ_QUESTIONS.length) {
      const total = updated.reduce((a, b) => a + b, 0)
      const result = scoreToProfile(total)
      setQuizResult(result)
      saveProfile(result)
    } else {
      setQuizStep(quizStep + 1)
    }
  }

  function resetQuiz() {
    setQuizStep(0)
    setQuizAnswers([])
    setQuizResult(null)
    setMode('quiz')
  }

  function backToChoose() {
    setMode('choose')
    setQuizStep(0)
    setQuizAnswers([])
    setQuizResult(null)
  }

  // ─── Landing: choose mode ───────────────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div className="max-w-xl">
        <h1 className="text-lg font-semibold text-foreground mb-2">Risk Profile</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your risk profile controls how aggressively the signal engine reacts to sentiment data.
          {riskProfile && (
            <span className="ml-2">
              Current: <span className="capitalize font-medium text-foreground/80">{riskProfile}</span>
            </span>
          )}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => { setSelected(riskProfile); setMode('select') }}
            className="text-left p-5 rounded-xl border border-border bg-card hover:border-foreground/25 hover:bg-accent transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Quick Select</span>
              <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">I know my style</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pick Low, Moderate, or High risk directly and see what it means for your signals.
            </p>
          </button>

          <button
            onClick={() => setMode('quiz')}
            className="text-left p-5 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/5 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#22c55e]/60 uppercase tracking-wide">5 Questions</span>
              <ChevronRight size={14} className="text-[#22c55e]/40 group-hover:text-[#22c55e]/80 transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Take the quiz</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Answer 5 market scenarios and we will figure out your risk profile automatically.
            </p>
          </button>
        </div>
      </div>
    )
  }

  // ─── Quick Select ───────────────────────────────────────────────────────────
  if (mode === 'select') {
    return (
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToChoose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-foreground">Choose Risk Profile</h1>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {PROFILES.map((profile) => {
            const isActive = selected === profile.id
            return (
              <button
                key={profile.id}
                onClick={() => setSelected(profile.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? `${profile.bgActive} ${profile.borderActive}`
                    : 'bg-card border-border hover:border-foreground/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-medium text-sm mb-1 ${isActive ? profile.color : 'text-foreground'}`}>
                      {profile.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{profile.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    isActive ? profile.borderActive : 'border-border'
                  }`}>
                    {isActive && <div className={`w-2 h-2 rounded-full ${profile.dot}`} />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Threshold preview */}
        <div className="p-5 rounded-xl bg-card border border-border mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
            Signal Thresholds — {active.label}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">BUY trigger</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{active.buyThreshold}%</p>
              <p className="text-xs text-muted-foreground mt-1">positive sentiment confidence</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">SELL trigger</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{active.sellThreshold}%</p>
              <p className="text-xs text-muted-foreground mt-1">negative sentiment confidence</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => saveProfile(selected)}
          className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-sm transition-colors"
        >
          Save Profile
        </button>
      </div>
    )
  }

  // ─── Quiz ───────────────────────────────────────────────────────────────────
  if (mode === 'quiz') {
    const q = QUIZ_QUESTIONS[quizStep]
    const progress = ((quizStep) / QUIZ_QUESTIONS.length) * 100

    return (
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToChoose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-foreground">Risk Quiz</h1>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{quizStep + 1} / {QUIZ_QUESTIONS.length}</span>
        </div>

        <p className="text-base font-medium text-foreground mb-6 leading-snug">{q.scenario}</p>

        <div className="flex flex-col gap-3">
          {q.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleQuizAnswer(answer.score)}
              className="text-left p-4 rounded-xl border border-border bg-card hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5 text-sm text-foreground/80 hover:text-foreground transition-all"
            >
              <span className="text-muted-foreground mr-3 font-mono text-xs">{String.fromCharCode(65 + i)}</span>
              {answer.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Done ───────────────────────────────────────────────────────────────────
  const saved = PROFILES.find((p) => p.id === riskProfile)!

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle2 size={20} className="text-[#22c55e]" />
        <h1 className="text-lg font-semibold text-foreground">Profile Saved</h1>
      </div>

      <div className={`p-6 rounded-xl border ${saved.bgActive} ${saved.borderActive} mb-6`}>
        <p className={`text-sm font-semibold mb-1 ${saved.color}`}>{saved.label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-5">{saved.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">BUY trigger</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{saved.buyThreshold}%</p>
            <p className="text-xs text-muted-foreground mt-1">positive confidence</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">SELL trigger</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{saved.sellThreshold}%</p>
            <p className="text-xs text-muted-foreground mt-1">negative confidence</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        This profile is now applied to your Dashboard and Analytics signal calculations.
      </p>

      <div className="flex gap-3">
        <button
          onClick={backToChoose}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors"
        >
          Change Profile
        </button>
        {quizResult && (
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors"
          >
            <RotateCcw size={13} />
            Retake Quiz
          </button>
        )}
      </div>
    </div>
  )
}
