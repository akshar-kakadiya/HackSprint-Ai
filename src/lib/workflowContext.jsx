import React from 'react'

const WorkflowContext = React.createContext(null)

const ACTIVE_KEY = 'hacksprint.workflow.active.v1'
const SAVED_KEY = 'hacksprint.saved_workflows.v1'

export function WorkflowProvider({ children }) {
  // Active workflow
  const [workflow, setWorkflow] = React.useState(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // List of all saved workflows
  const [savedWorkflows, setSavedWorkflows] = React.useState(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [prefilledIdea, setPrefilledIdea] = React.useState('')

  // Persist active workflow
  React.useEffect(() => {
    try {
      if (workflow) {
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(workflow))
      } else {
        localStorage.removeItem(ACTIVE_KEY)
      }
    } catch (e) {
      console.warn('Failed to persist active workflow:', e)
    }
  }, [workflow])

  // Persist saved list
  React.useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedWorkflows))
    } catch (e) {
      console.warn('Failed to persist saved list:', e)
    }
  }, [savedWorkflows])

  // Save current active workflow to library
  const saveCurrentWorkflow = React.useCallback(() => {
    if (!workflow) return false

    // Avoid duplicates by matching projectName
    const exists = savedWorkflows.some(w => w.projectName === workflow.projectName)
    if (exists) {
      // Update it
      setSavedWorkflows(prev => prev.map(w => 
        w.projectName === workflow.projectName 
          ? { ...w, timestamp: new Date().toISOString(), data: workflow } 
          : w
      ))
      return true
    }

    const newItem = {
      id: `wf_${Date.now()}`,
      projectName: workflow.projectName || 'Untitled Project',
      summary: workflow.summary || 'No description available.',
      timestamp: new Date().toISOString(),
      data: workflow
    }

    setSavedWorkflows(prev => [newItem, ...prev])
    return true
  }, [workflow, savedWorkflows])

  // Delete a workflow from library
  const deleteWorkflow = React.useCallback((id) => {
    setSavedWorkflows(prev => prev.filter(w => w.id !== id))
  }, [])

  // Load a saved workflow as active
  const loadWorkflow = React.useCallback((savedItem) => {
    if (savedItem && savedItem.data) {
      setWorkflow(savedItem.data)
      return true
    }
    return false
  }, [])

  return (
    <WorkflowContext.Provider value={{
      workflow,
      setWorkflow,
      prefilledIdea,
      setPrefilledIdea,
      savedWorkflows,
      saveCurrentWorkflow,
      deleteWorkflow,
      loadWorkflow
    }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const ctx = React.useContext(WorkflowContext)
  if (!ctx) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return ctx
}
