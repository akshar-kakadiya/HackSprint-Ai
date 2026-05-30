/**
 * HackSprint AI — Groq Service Layer
 * ──────────────────────────────────
 * Model  : llama-3.1-8b-instant  (fast, structured output support)
 * API key: VITE_GROQ_API_KEY (set in .env)
 *
 * Returns a fully validated WorkflowResult object.
 *
 * @typedef {Object} WorkflowResult
 * @property {string}  projectName
 * @property {string}  summary
 * @property {any[]}   competitorAnalysis
 * @property {any[]}   suggestedFeatures
 * @property {Object}  techStack
 * @property {any[]}   roadmap
 * @property {any[]}   sprintTasks
 * @property {any[]}   executionPhases
 */

import Groq from 'groq-sdk'

// ─── Constants ───────────────────────────────────────────────────────────────
const MODEL   = 'llama-3.1-8b-instant'
const TIMEOUT = 30_000 // 30 s hard timeout

// ─── Prompt ──────────────────────────────────────────────────────────────────
function buildPrompt(idea) {
  return `You are HackSprint AI, an expert startup advisor and product strategist.

The user has the following startup idea:
"""
${idea}
"""

Return ONLY a single valid JSON object. No markdown, no code fences, no explanation — just raw JSON.

The JSON must have EXACTLY these top-level keys:

{
  "projectName": "string — a sharp, catchy product name",
  "summary": "string — 1-2 sentence value proposition",
  "competitorAnalysis": [
    {
      "name": "string",
      "summary": "string — what they do",
      "differentiators": ["string"],
      "gaps": "string — their weakness / your opportunity"
    }
  ],
  "suggestedFeatures": [
    {
      "title": "string",
      "priority": "P0 | P1 | P2",
      "rationale": "string — why this feature matters"
    }
  ],
  "techStack": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "auth": ["string"],
    "hosting": ["string"],
    "observability": ["string"]
  },
  "roadmap": [
    {
      "title": "string — phase name",
      "goals": "string — what gets done",
      "metrics": "string — how success is measured"
    }
  ],
  "sprintTasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "P0 | P1 | P2",
      "estimate": "S | M | L",
      "sprint": "Sprint 1 | Sprint 2 | Sprint 3"
    }
  ],
  "executionPhases": [
    {
      "title": "string",
      "desc": "string",
      "duration": "string — e.g. Week 1-2"
    }
  ]
}

Rules:
- competitorAnalysis: exactly 3-5 entries
- suggestedFeatures: exactly 6-10 entries with mix of P0/P1/P2
- techStack: 2-4 items per category
- roadmap: exactly 3 phases
- sprintTasks: exactly 8-12 tasks spread across Sprint 1 and Sprint 2
- executionPhases: exactly 3 entries
- All strings must be specific to the user's idea — no generic placeholders
- Return ONLY the JSON object. Nothing else.`.trim()
}

// ─── Main export ─────────────────────────────────────────────────────────────
/**
 * Generate a full workflow plan from a project idea using Groq.
 *
 * @param {string} projectIdea
 * @returns {Promise<WorkflowResult>}
 */
export async function generateWorkflow(projectIdea) {
  const idea = String(projectIdea ?? '').trim()
  if (!idea) throw new Error('Project idea cannot be empty.')

  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  // ── Key validation ──────────────────────────────────────────────────────
  if (!apiKey || apiKey.length < 20) {
    console.warn('[HackSprint] VITE_GROQ_API_KEY is missing or invalid. Add it to .env')
    throw new Error('Groq API key is not configured. Add VITE_GROQ_API_KEY to your .env file.')
  }

  console.log(`[HackSprint] 🚀 Starting Groq request — model: ${MODEL}`)
  console.log(`[HackSprint] 💡 Idea: "${idea.slice(0, 80)}${idea.length > 80 ? '…' : ''}"`)

  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true })

  // ── API call with timeout ────────────────────────────────────────────────
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  let rawText = ''

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are HackSprint AI. You ALWAYS respond with pure JSON and nothing else. No markdown, no explanation.',
        },
        {
          role: 'user',
          content: buildPrompt(idea),
        },
      ],
      temperature: 0.45,
      max_tokens: 4096,
    })

    rawText = completion?.choices?.[0]?.message?.content ?? ''

    console.log(`[HackSprint] ✅ Groq response received — ${rawText.length} chars`)
    console.log(`[HackSprint] 📦 Raw preview: ${rawText.slice(0, 200)}…`)

  } catch (err) {
    clearTimeout(timer)

    if (err.name === 'AbortError') {
      throw new Error('The AI request timed out after 30 seconds. Please try again.')
    }

    // Groq SDK wraps HTTP errors
    if (err?.status === 401) {
      throw new Error('Invalid Groq API key. Check your VITE_GROQ_API_KEY in .env.')
    }
    if (err?.status === 429) {
      throw new Error('Groq rate limit reached. Wait a moment and try again.')
    }
    if (err?.status >= 500) {
      throw new Error('Groq service is temporarily unavailable. Please try again shortly.')
    }

    console.error('[HackSprint] ❌ Groq API error:', err)
    throw new Error(err?.message || 'Failed to reach the Groq API. Check your connection.')
  }

  clearTimeout(timer)

  // ── Parse & validate ─────────────────────────────────────────────────────
  const data = safeParseJSON(rawText)
  const result = validateAndNormalize(data, idea)

  console.log('[HackSprint] 🎯 Workflow generated successfully:', {
    projectName: result.projectName,
    competitors: result.competitorAnalysis.length,
    features: result.suggestedFeatures.length,
    tasks: result.sprintTasks.length,
  })

  return result
}

// ─── Parsers ─────────────────────────────────────────────────────────────────
function safeParseJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Groq returned an empty response.')
  }

  // First try direct parse
  try {
    return JSON.parse(text.trim())
  } catch { /* try extraction */ }

  // Strip markdown code fences if model ignored instructions
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  try {
    return JSON.parse(stripped)
  } catch { /* try brace extraction */ }

  // Extract outermost { ... }
  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1))
    } catch { /* fallthrough */ }
  }

  console.error('[HackSprint] ❌ Failed to parse Groq response:', text.slice(0, 400))
  throw new Error('The AI returned an unreadable response. Please try rephrasing your idea.')
}

function validateAndNormalize(data, fallbackIdea) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Groq returned an unexpected data shape.')
  }

  const toArray = (v) => {
    if (Array.isArray(v)) return v
    if (v && typeof v === 'object') {
      const candidate = v.items || v.list || v.data
      if (Array.isArray(candidate)) return candidate
      return [v]
    }
    if (typeof v === 'string') return [{ title: v }]
    return []
  }

  return {
    projectName:       String(data.projectName || deriveProjectName(fallbackIdea)),
    summary:           String(data.summary || ''),
    competitorAnalysis: toArray(data.competitorAnalysis),
    suggestedFeatures:  toArray(data.suggestedFeatures),
    techStack:          (data.techStack && typeof data.techStack === 'object' && !Array.isArray(data.techStack))
                          ? data.techStack
                          : { stack: toArray(data.techStack) },
    roadmap:            toArray(data.roadmap),
    sprintTasks:        toArray(data.sprintTasks),
    executionPhases:    toArray(data.executionPhases),
  }
}

function deriveProjectName(idea) {
  const words = idea.trim().split(/\s+/).slice(0, 4)
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
