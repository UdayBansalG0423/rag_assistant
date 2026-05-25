import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

// Workspace routes (NeuralDoc chat-first workspace)

function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />
      <Route path="/dashboard/chat/:id" element={<Navigate to="/workspace/:id" replace />} />
      <Route path="/chat" element={<Navigate to="/workspace" replace />} />
      <Route path="/knowledge-base" element={<Navigate to="/workspace" replace />} />
      <Route path="/workspace" element={<Dashboard />} />
      <Route path="/workspace/:id" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="*" element={<Navigate to="/workspace" replace />} />
      </Routes>
    </>
  )
}

export default App
