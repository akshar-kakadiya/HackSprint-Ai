import React from 'react'
import { motion } from 'framer-motion'
import { useWorkflow } from '../lib/workflowContext.jsx'
import { exportToPDF, exportToJSON } from '../services/pdfExporter.js'

/* ─────────────────────────────────────────────────────────
   Normalizer helpers (kept from previous version)
───────────────────────────────────────────────────────── */
function normalizeList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [{ name: value }]
  if (typeof value === 'object') {
    const c = value.items || value.list || value.competitors || value.features || value.data
    if (Array.isArray(c)) return c
    return [value]
  }
  return []
}

function asArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    if (value.includes(',')) return value.split(',').map(x => x.trim()).filter(Boolean)
    if (value.includes('\n')) return value.split('\n').map(x => x.trim()).filter(Boolean)
    return [value]
  }
  return [value]
}

function normalizePhases(roadmap) {
  if (!roadmap) return []
  if (Array.isArray(roadmap)) return roadmap.map(normalizePhase).filter(Boolean)
  if (typeof roadmap === 'object') {
    const arr = roadmap.phases || roadmap.roadmap || roadmap.steps || roadmap.milestones || roadmap.items
    if (Array.isArray(arr)) return arr.map(normalizePhase).filter(Boolean)
  }
  return []
}

function normalizePhase(p) {
  if (!p) return null
  if (typeof p === 'string') return { title: p, goals: '' }
  const title = p.title || p.phase || p.name || p.milestone || 'Phase'
  const goals = p.goals || p.goal || p.objectives || p.description || ''
  const metrics = p.metrics || p.successMetrics || p.success || ''
  return { title: String(title), goals: String(goals), metrics: String(metrics) }
}

function countItems(value) {
  if (!value) return 0
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') {
    const arr = value.items || value.list || value.data
    if (Array.isArray(arr)) return arr.length
    return Object.keys(value).length || 1
  }
  return 1
}

function labelize(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function deriveExecutionPhasesFromTasks(tasks) {
  const list = normalizeList(tasks)
  if (!list.length) return []
  const groups = new Map()
  for (const t of list) {
    const label = t?.sprint || t?.sprintLabel || t?.phase || 'Execution'
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(t)
  }
  return Array.from(groups.entries()).slice(0, 3).map(([label, items]) => ({
    title: String(label),
    desc: `${items.length} task${items.length === 1 ? '' : 's'}`,
  }))
}

/* ─────────────────────────────────────────────────────────
   Framer variants
───────────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
}

/* ─────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────── */
export default function Workflow({ onNavigate }) {
  const { workflow, saveCurrentWorkflow } = useWorkflow()
  const [saveStatus, setSaveStatus] = React.useState('idle')
  const [pdfStatus, setPdfStatus] = React.useState('idle')

  React.useEffect(() => {
    setSaveStatus('idle')
  }, [workflow])

  if (!workflow) return <EmptyState onNavigate={onNavigate} />

  const projectName    = workflow?.projectName
  const summary        = workflow?.summary
  const competitors    = workflow?.competitorAnalysis
  const features       = workflow?.suggestedFeatures
  const techStack      = workflow?.techStack
  const roadmap        = workflow?.roadmap
  const sprintTasks    = workflow?.sprintTasks
  const phases         = normalizePhases(roadmap)

  // Prefer Groq executionPhases, fall back to roadmap phases, then derive from tasks
  const execPhases = (() => {
    if (Array.isArray(workflow?.executionPhases) && workflow.executionPhases.length > 0) {
      return workflow.executionPhases.map(p => ({ title: p.title, desc: p.desc || p.description || '', duration: p.duration || '' }))
    }
    if (phases.length) return phases.map(p => ({ title: p.title, desc: p.goals, duration: '' }))
    return deriveExecutionPhasesFromTasks(sprintTasks)
  })()

  function handleSave() {
    if (saveStatus === 'saved') return
    const ok = saveCurrentWorkflow()
    if (ok) {
      setSaveStatus('saved')
    }
  }

  async function handleExportPDF() {
    if (pdfStatus === 'exporting') return
    setPdfStatus('exporting')
    try {
      await exportToPDF(workflow)
    } catch (e) {
      console.error('[PDF Export] Failed:', e)
    } finally {
      setPdfStatus('idle')
    }
  }

  function handleExportJSON() {
    exportToJSON(workflow)
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
    >
      {/* Page title — uses AI-generated project name */}
      <motion.div
        variants={fadeUp}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', margin: 0 }}>
              {projectName || 'Workflow'}
            </h1>
            {projectName && (
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                color: 'var(--accent)', opacity: 0.7,
              }}>
                AI-generated
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: '640px', margin: 0 }}>
            {summary || 'AI-generated startup execution plan'}
          </p>
        </div>

        {/* Premium Actions Group */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saved'}
            style={{
              padding: '0.45rem 0.875rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: saveStatus === 'saved' ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
              color: saveStatus === 'saved' ? '#4ade80' : 'var(--text-2)',
              borderColor: saveStatus === 'saved' ? 'rgba(34,197,94,0.2)' : 'var(--border)',
              cursor: saveStatus === 'saved' ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (saveStatus !== 'saved') {
                e.currentTarget.style.borderColor = 'var(--border-2)'
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.color = 'var(--text)'
              }
            }}
            onMouseLeave={e => {
              if (saveStatus !== 'saved') {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.color = 'var(--text-2)'
              }
            }}
          >
            {saveStatus === 'saved' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5l-7 7-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Saved to Library
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M12 2H4a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2zM2 6h12M5 14V9h6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Workspace
              </>
            )}
          </button>

          <button
            onClick={handleExportPDF}
            disabled={pdfStatus === 'exporting'}
            style={{
              padding: '0.45rem 0.875rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text-2)',
              cursor: pdfStatus === 'exporting' ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (pdfStatus !== 'exporting') {
                e.currentTarget.style.borderColor = 'var(--border-2)'
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.color = 'var(--text)'
              }
            }}
            onMouseLeave={e => {
              if (pdfStatus !== 'exporting') {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--surface-2)'
                e.currentTarget.style.color = 'var(--text-2)'
              }
            }}
          >
            {pdfStatus === 'exporting' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" style={{ opacity: 0.2 }} />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M9 1.5v4.5h4.5M9 1.5H3.5a1.5 1.5 0 00-1.5 1.5v10a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V6L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export PDF
              </>
            )}
          </button>

          <button
            onClick={handleExportJSON}
            style={{
              padding: '0.45rem 0.875rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-2)'
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface-2)'
              e.currentTarget.style.color = 'var(--text-2)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M5.5 13H4a1.5 1.5 0 01-1.5-1.5v-3A1.5 1.5 0 001 7a1.5 1.5 0 001.5-1.5v-3A1.5 1.5 0 014 1h1.5M10.5 13H12a1.5 1.5 0 001.5-1.5v-3A1.5 1.5 0 0115 7a1.5 1.5 0 01-1.5-1.5v-3A1.5 1.5 0 0012 1h-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export JSON
          </button>
        </div>
      </motion.div>

      {/* Summary row */}
      <motion.div variants={fadeUp}>
        <SummaryRow competitors={competitors} features={features} tasks={sprintTasks} />
      </motion.div>

      {/* Two-column grid */}
      <motion.div
        variants={fadeUp}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}
      >
        <Section title="Competitors" subtitle="Market gaps and positioning">
          <CompetitorsView value={competitors} />
        </Section>
        <Section title="Suggested Features" subtitle="Prioritized MVP scope">
          <FeaturesView value={features} />
        </Section>
      </motion.div>

      <motion.div
        variants={fadeUp}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}
      >
        <Section title="Tech Stack" subtitle="Recommended technologies">
          <TechStackView value={techStack} />
        </Section>
        <Section title="MVP Roadmap" subtitle="Phase-by-phase milestone plan">
          <RoadmapView phases={phases} raw={roadmap} />
        </Section>
      </motion.div>

      {/* Full-width timeline */}
      <motion.div variants={fadeUp}>
        <Section title="Execution Timeline" subtitle="Sprint delivery map">
          <ExecutionView phases={execPhases} />
        </Section>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────────── */
const PROMPTS = [
  {
    title: 'AI Resume Analyzer',
    desc: 'Parse resumes against job descriptions, score alignment, suggest improvements.',
    prompt: 'An AI-powered resume analyzer that parses resumes and job descriptions, scores skill alignment, and generates structured improvement checklists.',
  },
  {
    title: 'Smart Parking System',
    desc: 'Real-time city parking maps, slot reservations, and automated ticketing.',
    prompt: 'A smart city parking platform with real-time vacancy mapping, slot reservation, distance routing, and automated ticket processing.',
  },
  {
    title: 'Fitness Tracking App',
    desc: 'AI health coaching, progressive workouts, meal scanning, and progress graphs.',
    prompt: 'A premium fitness tracker with AI health coaching, progressive workout plans, meal calorie scanning, and long-term progress visualization.',
  },
  {
    title: 'Campus Event Platform',
    desc: 'Unified event hub with digital tickets, QR check-in, and social discovery.',
    prompt: 'A university campus event hub with schedule management, digital ticketing, QR check-in, and student social discovery.',
  },
]

function EmptyState({ onNavigate }) {
  const { setPrefilledIdea } = useWorkflow()

  function pick(prompt) {
    setPrefilledIdea(prompt)
    if (onNavigate) onNavigate('dashboard')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ maxWidth: '640px' }}
    >
      {/* No workflow message */}
      <div style={{
        padding: '1.75rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        marginBottom: '2rem',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem', letterSpacing: '-0.015em' }}>
          No workflow yet
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
          Head to the <strong style={{ color: 'var(--text)', fontWeight: 500 }}>Home</strong> tab, describe your startup idea, and generate a complete execution plan in seconds.
        </p>
      </div>

      {/* Prompt suggestions */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Or start with an example
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
        {PROMPTS.map(item => (
          <button
            key={item.title}
            type="button"
            onClick={() => pick(item.prompt)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '1.125rem 1.25rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
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
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem', letterSpacing: '-0.01em' }}>
              {item.title}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────────────────── */
function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.005)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: '0.15rem' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.78125rem', color: 'var(--text-3)' }}>{subtitle}</p>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Summary row
───────────────────────────────────────────────────────── */
function SummaryRow({ competitors, features, tasks }) {
  const stats = [
    { label: 'Market Competitors',   value: countItems(competitors) },
    { label: 'Suggested MVP Features',      value: countItems(features) },
    { label: 'Sprint Tasks Populated',  value: countItems(tasks) },
  ]
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '1.5rem',
      padding: '0.25rem 0',
    }}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            textAlign: 'left',
          }}
        >
          <div style={{ 
            fontSize: '1.625rem', 
            fontWeight: 600, 
            letterSpacing: '-0.03em', 
            color: 'var(--text)', 
            lineHeight: 1.1 
          }}>
            {s.value}
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-2)', 
            marginTop: '0.35rem',
            fontWeight: 500,
            letterSpacing: '-0.01em'
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Content views
───────────────────────────────────────────────────────── */
function CompetitorsView({ value }) {
  const list = normalizeList(value)
  if (!list.length) return <Muted>No competitor data.</Muted>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {list.slice(0, 4).map((c, i) => {
        const name = c?.name || c?.competitor || c?.company || `Competitor ${i + 1}`
        const summary = c?.summary || c?.description || ''
        const gaps = c?.gaps || c?.opportunities || ''
        const diffs = asArray(c?.differentiators).slice(0, 3)

        return (
          <div key={i} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', lastChild: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-2)',
                flexShrink: 0,
              }}>
                {String(name).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{name}</p>
                {summary && <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: '0.2rem', lineHeight: 1.5 }}>{String(summary).slice(0, 120)}</p>}
              </div>
            </div>
            {diffs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem', paddingLeft: '2.5rem' }}>
                {diffs.map(d => (
                  <Tag key={String(d)}>{String(d)}</Tag>
                ))}
              </div>
            )}
            {gaps && (
              <div style={{
                paddingLeft: '2.5rem',
                fontSize: '0.8125rem',
                color: 'var(--text-2)',
                lineHeight: 1.55,
              }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(180,160,255,0.7)', marginRight: '0.375rem' }}>
                  Gap
                </span>
                {String(gaps).slice(0, 140)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FeaturesView({ value }) {
  const list = normalizeList(value)
  if (!list.length) return <Muted>No feature suggestions found.</Muted>

  const normalized = list
    .map(f => ({
      title: f?.title || f?.feature || f?.name || String(f?.item || ''),
      priority: String(f?.priority || f?.prio || 'P1').toUpperCase(),
      rationale: f?.rationale || f?.reason || f?.why || '',
    }))
    .filter(x => x.title)

  const p0 = normalized.filter(f => f.priority === 'P0')
  const p1 = normalized.filter(f => f.priority === 'P1')
  const p2 = normalized.filter(f => f.priority === 'P2')
  const groups = [
    { label: 'Critical', key: 'P0', color: '#f87171', items: p0 },
    { label: 'High',     key: 'P1', color: '#a78bfa', items: p1 },
    { label: 'Nice to have', key: 'P2', color: '#60a5fa', items: p2 },
  ].filter(g => g.items.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {groups.map(g => (
        <div key={g.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: g.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.01em' }}>
              {g.label}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {g.items.slice(0, 3).map((f, i) => (
              <div key={i} style={{ padding: '0.35rem 0', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '5px', height: '5px', borderRadius: '50%', 
                  background: 'var(--border-2)', marginTop: '0.35rem', flexShrink: 0 
                }} />
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em', margin: 0 }}>{f.title}</p>
                  {f.rationale && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '0.15rem', lineHeight: 1.45, margin: 0 }}>
                      {String(f.rationale).slice(0, 120)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TechStackView({ value }) {
  if (!value) return <Muted>No tech stack configured.</Muted>
  const entries = typeof value === 'object' && !Array.isArray(value)
    ? Object.entries(value)
    : [['Stack', value]]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {entries.map(([k, v]) => (
        <div key={k}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.5rem' }}>
            {labelize(k)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {asArray(v).length
              ? asArray(v).slice(0, 8).map(x => <Tag key={String(x)}>{String(x)}</Tag>)
              : <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>{String(v)}</span>
            }
          </div>
        </div>
      ))}
    </div>
  )
}

function RoadmapView({ phases, raw }) {
  if (!phases.length) {
    if (raw) return <Muted>{JSON.stringify(raw).slice(0, 200)}</Muted>
    return <Muted>No roadmap data.</Muted>
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.25rem', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {phases.slice(0, 4).map((p, i) => (
        <div key={i} style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: '-1.375rem', top: '0.35rem',
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--bg)', border: '2px solid var(--border-2)',
          }} />
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.3rem' }}>
            Phase {i + 1}
          </p>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: '0.3rem' }}>{p.title}</p>
          {p.goals && <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{p.goals}</p>}
          {p.metrics && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(180,160,255,0.7)', marginTop: '0.3rem' }}>
              → {p.metrics}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function ExecutionView({ phases }) {
  if (!phases.length) return <Muted>No execution phases.</Muted>

  const widths = ['72%', '32%', '5%']

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {phases.slice(0, 3).map((p, i) => (
        <div key={i} style={{
          padding: '1.125rem',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              {`Sprint ${i + 1}`}
            </p>
            {p.duration && (
              <span style={{ fontSize: '0.625rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                {p.duration}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: '0.375rem' }}>
            {p.title}
          </p>
          {p.desc && <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{p.desc}</p>}
          <div style={{ marginTop: '1rem', height: '3px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: widths[i] || '0%' }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', background: 'var(--accent)', borderRadius: '99px' }}
            />
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-3)', marginTop: '0.375rem' }}>
            {i === 0 ? 'In progress' : i === 1 ? 'Starting soon' : 'Planned'}
          </p>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Tiny shared components
───────────────────────────────────────────────────────── */
function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '0.2rem 0.5rem',
      fontSize: '0.75rem',
      color: 'var(--text-2)',
      fontWeight: 500,
    }}>
      {children}
    </span>
  )
}

function Muted({ children }) {
  return <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>{children}</p>
}
