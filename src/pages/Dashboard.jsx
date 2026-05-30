import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateWorkflow } from '../services/groq.js'
import { useWorkflow } from '../lib/workflowContext.jsx'

/* ---------- Example prompts ---------- */
const EXAMPLES = [
  { label: 'AI Resume Analyzer',     prompt: 'An AI-powered resume analyzer that parses resumes and job descriptions, scores skill alignment, and generates a structured list of targeted improvements.' },
  { label: 'Smart Parking System',   prompt: 'A smart city parking platform with real-time vacancy mapping, slot reservation, distance-based routing, and automated ticket processing.' },
  { label: 'Fitness Tracking App',   prompt: 'A premium fitness tracker with AI health coaching, progressive workout plans, meal calorie scanning, and long-term progress visualization.' },
  { label: 'Campus Event Platform',  prompt: 'A university campus event hub featuring schedule management, digital ticketing, QR check-in, and student social discovery.' },
]

/* ---------- AI step sequence ---------- */
const STEPS = [
  {
    title: 'Analyzing startup idea',
    lines: [
      'Deconstructing concept and target user personas…',
      'Mapping core problem space and success criteria…',
      '✓ Analysis complete',
    ],
  },
  {
    title: 'Researching competitors',
    lines: [
      'Scanning market for direct and indirect players…',
      'Extracting positioning gaps and differentiators…',
      '✓ Competitive landscape mapped',
    ],
  },
  {
    title: 'Generating roadmap',
    lines: [
      'Structuring 3-phase progressive rollout strategy…',
      'Defining MVP scope and milestone success metrics…',
      '✓ Roadmap generated',
    ],
  },
  {
    title: 'Creating sprint tasks',
    lines: [
      'Breaking milestones into sized story cards…',
      'Assigning priority and dependency chains…',
      '✓ Sprint backlog ready',
    ],
  },
  {
    title: 'Building architecture',
    lines: [
      'Selecting optimal tech stack and deployment target…',
      'Composing system data and API boundaries…',
      '✓ Architecture finalized',
    ],
  },
]

/* ---------- Dashboard (landing) ---------- */
export default function Dashboard({ onNavigate }) {
  const [idea, setIdea]         = React.useState('')
  const [loading, setLoading]   = React.useState(false)
  const [apiResult, setApiResult] = React.useState(null)
  const [error, setError]       = React.useState('')
  const { setWorkflow, prefilledIdea, setPrefilledIdea } = useWorkflow()
  const textareaRef = React.useRef(null)
  const canGenerate = idea.trim().length > 10

  /* Handle prefill from Workflow empty state */
  React.useEffect(() => {
    if (!prefilledIdea) return
    const p = prefilledIdea
    setIdea(p)
    setPrefilledIdea('')
    triggerGenerate(p)
  }, [prefilledIdea])          // eslint-disable-line

  function pickExample(prompt) {
    setIdea(prompt)
    setError('')
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  async function handleGenerate() {
    if (!canGenerate) return
    triggerGenerate(idea)
  }

  function triggerGenerate(text) {
    setError('')
    setLoading(true)
    setApiResult(null)
    setWorkflow(null)
    generateWorkflow(text)
      .then((data) => setApiResult({ ok: true, data }))
      .catch((e)  => setApiResult({ ok: false, error: e?.message || 'Something went wrong.' }))
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <GeneratingView
          key="generating"
          idea={idea}
          apiResult={apiResult}
          onComplete={(data) => {
            setWorkflow(data)
            setLoading(false)
            onNavigate('workflow')
          }}
          onFailure={(msg) => {
            setError(msg)
            setLoading(false)
          }}
        />
      ) : (
        <LandingView
          key="landing"
          idea={idea}
          setIdea={setIdea}
          error={error}
          canGenerate={canGenerate}
          textareaRef={textareaRef}
          onGenerate={handleGenerate}
          onPickExample={pickExample}
          onNavigate={onNavigate}
        />
      )}
    </AnimatePresence>
  )
}

/* ---------- Landing view ---------- */
function LandingView({ idea, setIdea, error, canGenerate, textareaRef, onGenerate, onPickExample, onNavigate }) {
  const { savedWorkflows, loadWorkflow, deleteWorkflow } = useWorkflow()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        paddingTop: '3.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >


      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="heading-xl"
        style={{ marginBottom: '1rem' }}
      >
        From Idea to Execution
        <br />
        <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>in Seconds.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        style={{
          fontSize: '1rem',
          color: 'var(--text-2)',
          lineHeight: 1.65,
          marginBottom: '2.5rem',
          maxWidth: '480px',
        }}
      >
        Describe your startup idea. HackSprint AI generates a complete execution plan — competitor analysis, roadmap, sprint backlog, and system architecture.
      </motion.p>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.4 }}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-2)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.3)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onGenerate()
            }}
            placeholder="Describe your startup idea — e.g. an AI tool that turns user feedback into prioritized sprint tasks…"
            rows={5}
            style={{
              display: 'block',
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '1.25rem 1.25rem 0.75rem',
              fontSize: '0.9375rem',
              color: 'var(--text)',
              lineHeight: 1.6,
              fontFamily: 'inherit',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.875rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 400 }}>
              ⌘ Enter to generate
            </span>
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              Generate
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.75 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '0.75rem',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              color: 'rgba(252,165,165,0.9)',
              textAlign: 'left',
            }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Example prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.625rem', fontWeight: 500 }}>
          Try an example
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {EXAMPLES.map(({ label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => onPickExample(prompt)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '99px',
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                color: 'var(--text-2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-2)'
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-2)'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent Workspaces section */}
      {savedWorkflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'left' }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>
            Recent Workspaces
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxWidth: '540px', margin: '0 auto' }}>
            {savedWorkflows.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.875rem 1.125rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onClick={() => {
                  loadWorkflow(item)
                  onNavigate('workflow')
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-2)'
                  e.currentTarget.style.background = 'var(--surface-2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--surface)'
                }}
              >
                <div style={{ overflow: 'hidden', paddingRight: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.015em' }}>
                    {item.projectName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.summary}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteWorkflow(item.id)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-3)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#ef4444'
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-3)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M2.5 4h11M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4m2 0v9.5A1.5 1.5 0 0111.5 15h-7A1.5 1.5 0 013 13.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ---------- Generating / AI thinking view ---------- */
function GeneratingView({ idea, apiResult, onComplete, onFailure }) {
  const [step, setStep]         = React.useState(0)
  const [lineIdx, setLineIdx]   = React.useState(0)
  const [done, setDone]         = React.useState(new Set())

  /* advance through log lines */
  React.useEffect(() => {
    if (step >= STEPS.length) return
    const current = STEPS[step]
    const interval = setInterval(() => {
      setLineIdx(prev => {
        if (prev < current.lines.length - 1) return prev + 1
        clearInterval(interval)
        setTimeout(() => {
          setDone(d => new Set([...d, step]))
          if (step < STEPS.length - 1) {
            setStep(s => s + 1)
            setLineIdx(0)
          } else {
            setStep(STEPS.length)
          }
        }, 600)
        return prev
      })
    }, 420)
    return () => clearInterval(interval)
  }, [step])

  /* wait for API + steps both done */
  React.useEffect(() => {
    if (step < STEPS.length) return
    if (!apiResult) return
    if (apiResult.ok) {
      setTimeout(() => onComplete(apiResult.data), 800)
    } else {
      onFailure(apiResult.error)
    }
  }, [step, apiResult])        // eslint-disable-line

  const progress = Math.min((done.size / STEPS.length) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 10, 11, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Radial soft accent aura */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(124,109,250,0.06) 0%, rgba(124,109,250,0) 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
        zIndex: -1,
        animation: 'glowPulse 5s ease-in-out infinite',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Groq Llama Orchestration
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.5rem' }}>
            Synthesizing Workspace
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%' }}>
            "{idea}"
          </p>
        </div>

        {/* Steps container with vertical timeline line */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {/* Vertical line connecting the steps */}
          <div style={{
            position: 'absolute',
            left: '8px',
            top: '20px',
            bottom: '20px',
            width: '1px',
            background: 'rgba(255,255,255,0.06)',
            zIndex: 0
          }} />

          {STEPS.map((s, idx) => {
            const isActive    = idx === step
            const isComplete  = done.has(idx)
            const isPending   = !isActive && !isComplete

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                style={{
                  position: 'relative',
                  padding: '0.75rem 0 0.75rem 1.75rem',
                  zIndex: 1
                }}
              >
                {/* Step indicator dot */}
                <div style={{
                  position: 'absolute',
                  left: '0px',
                  top: '12px',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg)',
                  borderRadius: '50%',
                }}>
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      style={{
                        width: '14px', height: '14px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="rgba(255,255,255,0.85)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  ) : isActive ? (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      boxShadow: '0 0 10px var(--accent)',
                      animation: 'pulse 1.4s ease infinite'
                    }} />
                  ) : (
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-2)' }} />
                  )}
                </div>

                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text)' : isComplete ? 'var(--text-2)' : 'var(--text-3)',
                  transition: 'color 0.2s',
                  display: 'block'
                }}>
                  {s.title}
                </span>

                {/* Log stream */}
                {isActive && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {s.lines.slice(0, lineIdx + 1).map((line, li) => (
                      <motion.p
                        key={li}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontSize: '0.71875rem',
                          fontFamily: "'SF Mono', 'Fira Code', monospace",
                          color: li === lineIdx ? 'var(--text-2)' : 'var(--text-3)',
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </motion.div>
  )
}
