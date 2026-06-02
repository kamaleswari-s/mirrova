import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'

import Landing from './components/screens/Landing'
import { Login } from './components/screens/Login'
import { Signup } from './components/screens/Login'
import Onboarding from './components/screens/Onboarding'
import Dashboard from './components/screens/Dashboard'
import Simulate from './components/screens/Simulate'
import BlindSpots from './components/screens/BlindSpots'
import Pivot from './components/screens/Pivot'
import SparkPlan from './components/screens/SparkPlan'
import Profile from './components/screens/Profile'
import RealityCheck from './components/screens/RealityCheck'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A2118' }}>
      <span style={{ fontFamily: 'Moldie, serif', fontSize: 32, color: '#F2E8D1' }}>mirrova</span>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!user.onboarding_complete) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A2118' }}>
      <span style={{ fontFamily: 'Moldie, serif', fontSize: 32, color: '#F2E8D1' }}>mirrova</span>
    </div>
  )

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/blindspots" element={<BlindSpots />} />
          <Route path="/pivot" element={<Pivot />} />
          <Route path="/sparkplan" element={<SparkPlan />} />
          <Route path="/realitycheck" element={<RealityCheck />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  )
}