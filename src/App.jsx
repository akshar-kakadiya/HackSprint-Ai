import React from 'react'
import Shell from './components/HackSprintShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Workflow from './pages/Workflow.jsx'
import SprintBoard from './pages/SprintBoard.jsx'
import Architecture from './pages/Architecture.jsx'
import { WorkflowProvider } from './lib/workflowContext.jsx'

function App() {
  const [active, setActive] = React.useState('dashboard')

  const Page =
    active === 'workflow'      ? Workflow
    : active === 'sprint'      ? SprintBoard
    : active === 'architecture'? Architecture
    : Dashboard

  return (
    <WorkflowProvider>
      <Shell active={active} onNavigate={setActive}>
        <Page onNavigate={setActive} />
      </Shell>
    </WorkflowProvider>
  )
}

export default App
