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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A2118' }}>
      <span className="wordmark" style={{ fontSize: 32, color: '#F2E8D1' }}>mirrova</span>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { user } = useAuth()
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/blindspots" element={<BlindSpots />} />
          <Route path="/pivot" element={<Pivot />} />
          <Route path="/sparkplan" element={<SparkPlan />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  )
}