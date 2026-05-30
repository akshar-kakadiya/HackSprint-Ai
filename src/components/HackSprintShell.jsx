import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const NAV = [
  { id: 'dashboard', label: 'Home' },
  { id: 'workflow',  label: 'Workflow' },
  { id: 'sprint',    label: 'Sprint' },
  { id: 'architecture', label: 'Architecture' },
]

export default function Shell({ active, onNavigate, children }) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => setMenuOpen(false), [active])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ambient background — very subtle, not gradient-heavy */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '30%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,109,250,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Top navigation bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'rgba(10,10,11,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                background: 'rgba(124,109,250,0.18)',
                border: '1px solid rgba(124,109,250,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L10 6L6 11M2 6H10" stroke="rgba(180,160,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              HackSprint
            </span>
          </button>

          {/* Desktop nav links */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}
            className="hidden sm:flex"
          >
            {NAV.map((item) => {
              const isActive = item.id === active
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  style={{
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '0.3125rem 0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--text)' : 'var(--text-2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--text)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--text-2)'
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-2)',
                borderRadius: '8px',
                padding: '0.3125rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'var(--text-2)'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
              New project
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="sm:hidden"
              onClick={() => setMenuOpen(true)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                padding: '0.3125rem 0.5rem',
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
              aria-label="Open menu"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 60,
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '220px',
                background: 'var(--bg-2)',
                borderLeft: '1px solid var(--border)',
                zIndex: 70,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onNavigate(item.id); setMenuOpen(false) }}
                  style={{
                    background: item.id === active ? 'var(--surface-2)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.625rem 0.875rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: item.id === active ? 500 : 400,
                    color: item.id === active ? 'var(--text)' : 'var(--text-2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 4rem',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
