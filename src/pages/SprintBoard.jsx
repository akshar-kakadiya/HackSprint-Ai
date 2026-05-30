import React from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { motion } from 'framer-motion'
import { useWorkflow } from '../lib/workflowContext.jsx'

/* ─── Default data ─── */
const DEFAULT_DATA = {
  tasks: {
    't1': { title: 'Define PRD & target personas',         priority: 'P0', sprint: 'Sprint 1', desc: 'User stories, success metrics, and project scope.' },
    't2': { title: 'Competitive landscape research',       priority: 'P1', sprint: 'Sprint 1', desc: 'Audit top three competitors, find positioning gaps.' },
    't3': { title: 'Wireframe intake and landing canvas',  priority: 'P0', sprint: 'Sprint 1', desc: 'Static mockups for CTA flows and user validation.' },
    't4': { title: 'Gemini workflow parser backend',       priority: 'P0', sprint: 'Sprint 1', desc: 'Map raw prompts to strict JSON workflow models.' },
    't5': { title: 'Drag-and-drop Kanban interface',       priority: 'P1', sprint: 'Sprint 2', desc: 'Column transitions with local state persistence.' },
    't6': { title: 'Vite build & continuous deploy',       priority: 'P2', sprint: 'Sprint 2', desc: 'Minified assets and Vercel preview deployments.' },
  },
  columns: {
    todo:       { title: 'Todo',       taskIds: ['t1', 't2', 't3'] },
    inprogress: { title: 'In Progress', taskIds: ['t4', 't5'] },
    done:       { title: 'Done',       taskIds: ['t6'] },
  },
  order: ['todo', 'inprogress', 'done'],
}

const PRIORITY_COLOR = {
  P0: { dot: '#ef4444', label: 'Critical' },
  P1: { dot: '#7c6dfa', label: 'High'     },
  P2: { dot: 'rgba(255,255,255,0.25)', label: 'Low' },
}

const COLUMN_META = {
  todo:       { accent: 'rgba(255,255,255,0.04)', indicator: 'rgba(255,255,255,0.3)' },
  inprogress: { accent: 'rgba(124,109,250,0.06)', indicator: '#7c6dfa' },
  done:       { accent: 'rgba(255,255,255,0.02)', indicator: 'rgba(134,239,172,0.7)' },
}

export default function SprintBoard() {
  const { workflow } = useWorkflow()
  const [data, setData] = React.useState(DEFAULT_DATA)

  /* Build board from AI workflow tasks */
  React.useEffect(() => {
    if (!workflow?.sprintTasks || !Array.isArray(workflow.sprintTasks)) {
      setData(DEFAULT_DATA)
      return
    }
    const tasks = {}
    const todo = [], inprogress = [], done = []
    workflow.sprintTasks.forEach((t, i) => {
      const id = `g${i}`
      tasks[id] = {
        title:    t.title || `Task ${i + 1}`,
        desc:     t.description || t.desc || '',
        priority: t.priority || 'P1',
        sprint:   t.sprint || 'Sprint 1',
      }
      if (i === 1 || i === 4)  inprogress.push(id)
      else if (i === 2)        done.push(id)
      else                     todo.push(id)
    })
    setData({
      tasks,
      columns: {
        todo:       { title: 'Todo',        taskIds: todo },
        inprogress: { title: 'In Progress', taskIds: inprogress },
        done:       { title: 'Done',        taskIds: done },
      },
      order: ['todo', 'inprogress', 'done'],
    })
  }, [workflow])

  function onDragEnd({ destination, source, draggableId }) {
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const start  = data.columns[source.droppableId]
    const finish = data.columns[destination.droppableId]

    if (start === finish) {
      const ids = Array.from(start.taskIds)
      ids.splice(source.index, 1)
      ids.splice(destination.index, 0, draggableId)
      setData(prev => ({ ...prev, columns: { ...prev.columns, [source.droppableId]: { ...start, taskIds: ids } } }))
      return
    }

    const startIds  = Array.from(start.taskIds)
    startIds.splice(source.index, 1)
    const finishIds = Array.from(finish.taskIds)
    finishIds.splice(destination.index, 0, draggableId)

    setData(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [source.droppableId]:      { ...start,  taskIds: startIds  },
        [destination.droppableId]: { ...finish, taskIds: finishIds },
      },
    }))
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '1.75rem' }}
      >
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.25rem' }}>
          Sprint Board
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
          Drag tasks between columns to update progress
        </p>
      </motion.div>

      <DragDropContext onDragEnd={onDragEnd}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            alignItems: 'start',
          }}
          className="block sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3"
        >
          {data.order.map((colId, ci) => {
            const col   = data.columns[colId]
            const tasks = col.taskIds.map(id => ({ id, ...data.tasks[id] }))
            const meta  = COLUMN_META[colId]

            return (
              <motion.div
                key={colId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  marginBottom: '0.75rem', paddingLeft: '0.25rem',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: meta.indicator, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                    {col.title}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '99px',
                    padding: '0.1rem 0.5rem',
                    fontSize: '0.6875rem',
                    color: 'var(--text-3)',
                    fontWeight: 500,
                  }}>
                    {tasks.length}
                  </span>
                </div>

                <Droppable droppableId={colId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: '360px',
                        background: snapshot.isDraggingOver ? 'rgba(124,109,250,0.04)' : meta.accent,
                        border: `1px solid ${snapshot.isDraggingOver ? 'rgba(124,109,250,0.18)' : 'var(--border)'}`,
                        borderRadius: '14px',
                        padding: '0.625rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {tasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            )
          })}
        </motion.div>
      </DragDropContext>
    </div>
  )
}

function TaskCard({ task, index }) {
  const [hovered, setHovered] = React.useState(false)
  const pMeta = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.P2
  const sprintCode = String(task.sprint || 'Sprint 1').replace(/Sprint\s*/i, 'S')

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: snapshot.isDragging
              ? 'rgba(25, 25, 28, 0.95)'
              : hovered
                ? 'rgba(255, 255, 255, 0.022)'
                : 'rgba(255, 255, 255, 0.012)',
            border: `1px solid ${
              snapshot.isDragging
                ? 'var(--accent)'
                : hovered
                  ? 'rgba(255, 255, 255, 0.09)'
                  : 'var(--border)'
            }`,
            borderRadius: '10px',
            padding: '0.75rem 0.875rem',
            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
            boxShadow: snapshot.isDragging
              ? '0 12px 36px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.3)'
              : hovered
                ? '0 4px 14px rgba(0, 0, 0, 0.28)'
                : '0 1px 2px rgba(0, 0, 0, 0.15)',
            transform: snapshot.isDragging ? 'rotate(1.5deg) scale(1.01)' : 'none',
            transition: snapshot.isDragging ? 'none' : 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            ...provided.draggableProps.style,
          }}
        >
          {/* Priority + sprint */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '5px',
              padding: '0.125rem 0.375rem',
            }}>
              <div style={{ width: '4.5px', height: '4.5px', borderRadius: '50%', background: pMeta.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '0.625rem', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.01em' }}>{pMeta.label}</span>
            </div>
            
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              color: 'var(--accent)',
              background: 'rgba(124, 109, 250, 0.07)',
              padding: '0.1rem 0.375rem',
              borderRadius: '4px',
              border: '1px solid rgba(124, 109, 250, 0.15)'
            }}>
              {sprintCode}
            </span>
          </div>

          {/* Title */}
          <p style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text)',
            letterSpacing: '-0.0125em',
            lineHeight: 1.4,
            marginBottom: task.desc ? '0.35rem' : 0,
          }}>
            {task.title}
          </p>

          {/* Description */}
          {task.desc && (
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-2)',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {task.desc}
            </p>
          )}
        </div>
      )}
    </Draggable>
  )
}
