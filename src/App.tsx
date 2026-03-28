import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import { useSession } from './auth/useSession'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route path="/app" element={<ProtectedRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const AuthGate = () => {
  const { session, loading } = useSession()

  if (loading) {
    return <div className="page-shell">Loading...</div>
  }

  if (session) {
    return <Navigate to="/app" replace />
  }

  return <AuthPage />
}

const ProtectedRoute = () => {
  const { session, loading } = useSession()

  if (loading) {
    return <div className="page-shell">Loading...</div>
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  return <Dashboard />
}

export default App
