/**
 * HackSprint AI — Premium Editorial Programmatic PDF Exporter
 * ─────────────────────────────────────────────────────────
 * Generates an asymmetric, high-end agency design using structural vectors,
 * grid alignment, tint cards, and a stable left-hand accent banner.
 */

import { jsPDF } from 'jspdf'

/**
 * Advanced multi-line text renderer that calculates exact typography layout drops.
 */
function drawWrappedText(doc, text, x, y, width, fontSize, fontStyle = 'normal', color = [15, 23, 42], lineSpacing = fontSize * 1.4) {
  doc.setFont('helvetica', fontStyle)
  doc.setFontSize(fontSize)
  doc.setTextColor(color[0], color[1], color[2])
  
  const lines = doc.splitTextToSize(String(text || ''), width)
  lines.forEach(line => {
    doc.text(line, x, y)
    y += lineSpacing
  })
  return y
}

/**
 * Unique Geometric Section Header Template
 */
function drawSectionHeader(doc, title, y, margin = 54, pageWidth = 595.28) {
  // Mini Structural Pill Indicator
  doc.setFillColor(124, 109, 250) // Purple Accent
  doc.rect(margin, y - 1, 4, 11, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42) // Deep Slate
  doc.text(String(title).toUpperCase(), margin + 12, y + 8)
  
  doc.setDrawColor(241, 245, 249)
  doc.setLineWidth(1)
  doc.line(margin, y + 16, pageWidth - margin, y + 16)
  
  return y + 32
}

export async function exportToPDF(workflow) {
  if (!workflow) return

  const projectName = workflow.projectName || 'Untitled Project'
  console.log(`[Premium PDF Exporter] Generating editorial blueprint for ${projectName}`)

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  const PAGE_WIDTH = 595.28
  const PAGE_HEIGHT = 841.89
  const MARGIN = 54 
  const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN 

  let y = 60 

  // Layout safe-bound checks with immediate mutation handling
  function checkAndHandleSpace(currentY, heightNeeded) {
    const bottomLimit = PAGE_HEIGHT - MARGIN - 20
    if (currentY + heightNeeded > bottomLimit) {
      doc.addPage()
      return MARGIN + 25 
    }
    return currentY
  }

  const toList = (val) => {
    if (Array.isArray(val)) return val
    if (val && typeof val === 'object') {
      const arr = val.items || val.list || val.data
      if (Array.isArray(arr)) return arr
      return [val]
    }
    return []
  }

  const competitors = toList(workflow.competitorAnalysis)
  const features    = toList(workflow.suggestedFeatures)
  const roadmap     = toList(workflow.roadmap)
  const sprintTasks = toList(workflow.sprintTasks)
  const techStack   = workflow.techStack || {}

  // ─────────────────────────────────────────────────────────
  // 1. SIGNATURE ASYMMETRIC VISUAL ANCHOR (Page 1 Left Rail)
  // ─────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42) // Dark Slate Solid Block
  doc.rect(0, 0, 32, PAGE_HEIGHT, 'F')
  
  // Safe string translation rotation matrix instead of saveGraphicsState
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(124, 109, 250) // Purple Accent
  // 1, 0, 0, 1 handles positioning, but moving the origin via matrix angle rotation is safest
  doc.text('STRATEGY BLUEPRINT SPEC', 20, 140, null, 90)

  // Adjust content alignment offsets dynamically away from the left rail
  const LEFT_OFFSET = MARGIN + 6 
  const ADJUSTED_WIDTH = PAGE_WIDTH - LEFT_OFFSET - MARGIN

  // ─────────────────────────────────────────────────────────
  // 2. AGENCY COVER STYLE TOPPING
  // ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('HACKSPRINT AUTOMATION ENGINE v1.2', LEFT_OFFSET, y)
  y += 24

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(15, 23, 42)
  const titleLines = doc.splitTextToSize(projectName, ADJUSTED_WIDTH)
  titleLines.forEach(line => {
    doc.text(line, LEFT_OFFSET, y)
    y += 32
  })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 116, 139)
  doc.text('System Deployment Metrics & Strategic Vector Specification', LEFT_OFFSET, y)
  y += 35

  // Interlocking Split Grid Metadata
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(1)
  doc.rect(LEFT_OFFSET, y, ADJUSTED_WIDTH, 42, 'FD')

  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: 'long' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('INITIALIZED ON', LEFT_OFFSET + 16, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(51, 65, 85)
  doc.text(dateStr, LEFT_OFFSET + 16, y + 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('SYSTEM SCOPE', LEFT_OFFSET + 240, y + 16)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(124, 109, 250)
  doc.text('AGILE MVP PIPELINE', LEFT_OFFSET + 240, y + 28)
  y += 70

  // Core Executive Summary Wrap
  const summaryText = workflow.summary || 'A customized startup execution plan detailing competitor landscape, product features, engineering recommendations, and milestones.'
  y = drawWrappedText(doc, summaryText, LEFT_OFFSET, y, ADJUSTED_WIDTH, 9.5, 'normal', [71, 85, 105], 15)
  y += 35

  // ─────────────────────────────────────────────────────────
  // 3. COMPETITOR COMPARISON MATRIX (Card Style)
  // ─────────────────────────────────────────────────────────
  if (competitors.length > 0) {
    y = checkAndHandleSpace(y, 120)
    y = drawSectionHeader(doc, 'Market Competitor Landscape', y, LEFT_OFFSET, PAGE_WIDTH)

    competitors.slice(0, 3).forEach(c => {
      const name = c.name || c.competitor || 'Competitor'
      const desc = c.summary || c.description || 'No value proposition available.'
      const gaps = c.gaps || c.opportunities || 'Market gap analysis not provided.'

      const descLines = doc.splitTextToSize(`Value Prop: ${desc}`, ADJUSTED_WIDTH - 24)
      const gapLines = doc.splitTextToSize(`Market Gap: ${gaps}`, ADJUSTED_WIDTH - 24)
      
      const totalBoxHeight = 24 + (descLines.length * 12) + (gapLines.length * 12) + 12
      y = checkAndHandleSpace(y, totalBoxHeight + 10)

      doc.setFillColor(250, 250, 251)
      doc.setDrawColor(241, 245, 249)
      doc.setLineWidth(1)
      doc.rect(LEFT_OFFSET, y, ADJUSTED_WIDTH, totalBoxHeight, 'FD')

      doc.setFillColor(15, 23, 42)
      doc.rect(LEFT_OFFSET + 12, y + 12, 5, 5, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(name.toUpperCase(), LEFT_OFFSET + 24, y + 17)

      let currentCardY = y + 32
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(71, 85, 105)
      descLines.forEach(line => {
        doc.text(line, LEFT_OFFSET + 24, currentCardY)
        currentCardY += 12
      })

      currentCardY += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(180, 83, 9) 
      gapLines.forEach(line => {
        doc.text(line, LEFT_OFFSET + 24, currentCardY)
        currentCardY += 12
      })

      y += totalBoxHeight + 12
    })
    y += 15
  }

  // ─────────────────────────────────────────────────────────
  // 4. ARCHITECTURAL TECH TAG CLOUD
  // ─────────────────────────────────────────────────────────
  if (Object.keys(techStack).length > 0) {
    y = checkAndHandleSpace(y, 120)
    y = drawSectionHeader(doc, 'Engineering Stack Matrix', y, LEFT_OFFSET, PAGE_WIDTH)

    let cloudX = LEFT_OFFSET
    let cloudY = y

    Object.entries(techStack).slice(0, 8).forEach(([key, val]) => {
      const rawLabel = key.replace(/_/g, ' ')
      const valueString = Array.isArray(val) ? val[0] : String(val)
      const combinedTag = `${rawLabel.toUpperCase()}: ${valueString}`
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      const textWidth = doc.getTextWidth(combinedTag) + 16 
      
      if (cloudX + textWidth > PAGE_WIDTH - MARGIN) {
        cloudX = LEFT_OFFSET
        cloudY += 22
      }

      y = checkAndHandleSpace(cloudY, 25)

      doc.setFillColor(241, 245, 249)
      doc.rect(cloudX, cloudY, textWidth, 16, 'F')
      
      doc.setTextColor(51, 65, 85)
      doc.text(combinedTag, cloudX + 8, cloudY + 11)

      cloudX += textWidth + 8
    })
    y = cloudY + 35
  }

  // ─────────────────────────────────────────────────────────
  // 5. SUGGESTED FEATURES WITH IMPACT PILLS
  // ─────────────────────────────────────────────────────────
  if (features.length > 0) {
    y = checkAndHandleSpace(y, 100)
    y = drawSectionHeader(doc, 'Suggested MVP Feature Scope', y, LEFT_OFFSET, PAGE_WIDTH)

    features.slice(0, 5).forEach((f) => {
      const title = f.title || f.feature || 'Feature Parameter'
      const rationale = f.rationale || f.reason || 'Primary product functional module.'
      const prio = String(f.priority || 'P1').toUpperCase()

      const ratLines = doc.splitTextToSize(rationale, ADJUSTED_WIDTH - 75)
      const elementHeight = Math.max(35, ratLines.length * 12 + 16)

      y = checkAndHandleSpace(y, elementHeight + 10)

      const badgeColor = prio === 'P0' ? [254, 226, 226] : [238, 242, 255]
      const textColor = prio === 'P0' ? [220, 38, 38] : [79, 70, 229]
      
      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2])
      doc.rect(LEFT_OFFSET, y, 34, 14, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.text(prio, LEFT_OFFSET + 17, y + 10, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(title, LEFT_OFFSET + 48, y + 10)

      let lineY = y + 22
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(100, 116, 139)
      ratLines.forEach(line => {
        doc.text(line, LEFT_OFFSET + 48, lineY)
        lineY += 12
      })

      y += elementHeight + 6
    })
    y += 20
  }

  // ─────────────────────────────────────────────────────────
  // 6. PROGRESSIVE ROADMAP CHRONOLOGY
  // ─────────────────────────────────────────────────────────
  if (roadmap.length > 0) {
    y = checkAndHandleSpace(y, 120)
    y = drawSectionHeader(doc, 'Chronological MVP Phase Roadmap', y, LEFT_OFFSET, PAGE_WIDTH)

    const timelineBarX = LEFT_OFFSET + 12

    roadmap.slice(0, 4).forEach((r, i, arr) => {
      const title = r.title || r.phase || `Phase Operational Target ${i + 1}`
      const goals = r.goals || r.goal || ''

      const goalLines = doc.splitTextToSize(goals, ADJUSTED_WIDTH - 32)
      const containerHeight = 20 + (goalLines.length * 12) + 12

      y = checkAndHandleSpace(y, containerHeight)

      if (i < arr.length - 1) {
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(1.5)
        doc.line(timelineBarX, y + 6, timelineBarX, y + containerHeight)
      }

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(124, 109, 250)
      doc.setLineWidth(2)
      doc.circle(timelineBarX, y + 6, 4, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      doc.text(title, timelineBarX + 16, y + 9)

      let blockRunnerY = y + 21
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(71, 85, 105)
      goalLines.forEach(line => {
        doc.text(line, timelineBarX + 16, blockRunnerY)
        blockRunnerY += 12
      })

      y += containerHeight
    })
    y += 20
  }

  // ─────────────────────────────────────────────────────────
  // 7. SPRINT CARD EXPANSIONS
  // ─────────────────────────────────────────────────────────
  if (sprintTasks.length > 0) {
    y = checkAndHandleSpace(y, 120)
    y = drawSectionHeader(doc, 'Sprint Board Deliverables Extraction', y, LEFT_OFFSET, PAGE_WIDTH)

    sprintTasks.slice(0, 6).forEach(task => {
      const title = task.title || 'Backlog Unit'
      const desc = task.desc || task.description || ''
      const status = String(task.status || 'Backlog').toUpperCase()

      const taskLines = doc.splitTextToSize(desc, ADJUSTED_WIDTH - 24)
      const wrapperSize = 28 + (taskLines.length * 12) + 8

      y = checkAndHandleSpace(y, wrapperSize + 10)

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.75)
      doc.rect(LEFT_OFFSET, y, ADJUSTED_WIDTH, wrapperSize, 'FD')

      doc.setFillColor(226, 232, 240)
      doc.rect(LEFT_OFFSET, y, 3, wrapperSize, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(title, LEFT_OFFSET + 12, y + 16)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text(`STATUS: ${status}`, PAGE_WIDTH - MARGIN - 12, y + 16, { align: 'right' })

      let descRunnerY = y + 29
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(100, 116, 139)
      taskLines.forEach(line => {
        doc.text(line, LEFT_OFFSET + 12, descRunnerY)
        descRunnerY += 12
      })

      y += wrapperSize + 8
    })
  }

  // ─────────────────────────────────────────────────────────
  // POST-RENDER CYCLIC INJECTIONS (Running Footers/Headers)
  // ─────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    if (i > 1) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(148, 163, 184)
      doc.text(`HACKSPRINT BLUEPRINT CONFIG  //  ${projectName.toUpperCase()}`, LEFT_OFFSET, 36)
      
      doc.setDrawColor(241, 245, 249)
      doc.setLineWidth(0.5)
      doc.line(LEFT_OFFSET, 42, PAGE_WIDTH - MARGIN, 42)
    }

    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.75)
    doc.line(LEFT_OFFSET, PAGE_HEIGHT - 44, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 44)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text('Automated Technical Specification Structure • Confidential Engine Logs', LEFT_OFFSET, PAGE_HEIGHT - 32)
    doc.text(`PAGE ${i} / ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 32, { align: 'right' })
  }

  const fileName = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_blueprint.pdf`
  doc.save(fileName)
  return true
}

/**
 * Download JSON file fallback engine
 */
export function exportToJSON(workflow) {
  if (!workflow) return
  const projectName = workflow.projectName || 'hacksprint'
  const fileName = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_workflow.json`
  const jsonStr = JSON.stringify(workflow, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}