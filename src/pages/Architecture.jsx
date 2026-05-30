import React from 'react'
import { motion } from 'framer-motion'

const PIPELINE = [
  {
    step: '01',
    title: 'User Idea',
    desc: 'Describe your startup project in natural language or pick curated templates.',
    tech: 'React Context',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    step: '02',
    title: 'AI Research',
    desc: 'Groq Llama-3.1 LLaMA model extracts target markets, competitors, and gaps.',
    tech: 'Llama 3.1 8B',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096m.813 5.096a15.996 15.996 0 011.026-6.28M9 21a15.996 15.996 0 00-1.026-6.28m11.23 7.822c.165-.547.25-1.127.25-1.722a9 9 0 00-16.2 0c0 .595.085 1.175.25 1.722m15.7 0a9 9 0 00-15.7 0" />
      </svg>
    )
  },
  {
    step: '03',
    title: 'Workflow Planning',
    desc: 'Generates structured feature backlogs, MVP milestones, and recommended stacks.',
    tech: 'JSON Schema',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    step: '04',
    title: 'Sprint Execution',
    desc: 'Populates an interactive, drag-and-drop agile board with estimates and details.',
    tech: 'DnD Engine',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )
  },
  {
    step: '05',
    title: 'Export & Delivery',
    desc: 'Compiles a printable, presentation-grade A4 PDF brief and raw structured JSON.',
    tech: 'jsPDF direct',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function Architecture() {
  const [activeStep, setActiveStep] = React.useState(0)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          display: 'block',
          marginBottom: '0.5rem'
        }}>
          System Specifications
        </span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: '0.375rem' }}>
          Platform Pipeline
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', maxWidth: '480px', lineHeight: 1.5 }}>
          How HackSprint AI converts brief product concepts into structured, delivery-ready engineering workspaces.
        </p>
      </motion.div>

      {/* Visual Canvas Block */}
      <motion.div
        variants={fadeUp}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow Accent in canvas background */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(124,109,250,0.02) 0%, rgba(124,109,250,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Node Flow row - horizontal on desktop, vertical on mobile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            position: 'relative',
            zIndex: 1,
          }}
          className="flex-col lg:flex-row"
        >
          {PIPELINE.map((node, idx) => {
            const isActive = activeStep === idx
            const isLast = idx === PIPELINE.length - 1

            return (
              <React.Fragment key={node.title}>
                {/* Node Card */}
                <div
                  onClick={() => setActiveStep(idx)}
                  style={{
                    flex: 1,
                    background: isActive ? 'var(--bg-2)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border-2)' : 'transparent'}`,
                    borderRadius: '12px',
                    padding: '1.25rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minWidth: '150px',
                    width: '100%',
                    boxShadow: isActive ? '0 4px 20px rgba(0,0,0,0.4)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--surface-2)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                >
                  {/* Icon Badge */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isActive ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? 'rgba(124,109,250,0.3)' : 'var(--border)'}`,
                    color: isActive ? 'var(--accent)' : 'var(--text-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    transition: 'all 0.2s ease',
                  }}>
                    {node.icon}
                  </div>

                  {/* Title */}
                  <p style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--text)' : 'var(--text-2)',
                    letterSpacing: '-0.015em',
                    marginBottom: '0.2rem'
                  }}>
                    {node.title}
                  </p>

                  {/* Step Tech */}
                  <span style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-3)',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                  }}>
                    {node.tech}
                  </span>
                </div>

                {/* Arrow Connector (between nodes, hidden on mobile) */}
                {!isLast && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--border-2)',
                      flexShrink: 0
                    }}
                    className="hidden lg:flex"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Progressive Detail explainer card below */}
        <div style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            display: 'block',
            marginBottom: '0.375rem',
          }}>
            Step {PIPELINE[activeStep].step} Detailed Flow
          </span>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            {PIPELINE[activeStep].title}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0, maxWidth: '560px' }}>
            {PIPELINE[activeStep].desc}
          </p>
        </div>
      </motion.div>

      {/* Explainer features grid */}
      <motion.div
        variants={fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          { title: 'Restrained Processing', body: 'Llama models validate structural schemas directly for accurate workflow generations.' },
          { title: 'Linear-Grade Kanban', body: 'Agile deliverables map instantly to sprint columns with full local state storage.' },
          { title: 'Premium Documenting', body: 'jsPDF direct drawings export publication-quality A4 strategic briefs.' },
        ].map(item => (
          <div
            key={item.title}
            style={{
              padding: '1.25rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.0125em', marginBottom: '0.4rem' }}>
              {item.title}
            </p>
            <p style={{ fontSize: '0.78125rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
              {item.body}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
