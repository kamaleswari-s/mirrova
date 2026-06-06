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
import Pivot from './components/screens/Pivot'
import SparkPlan from './components/screens/SparkPlan'
import Profile from './components/screens/Profile'
import RealityCheck from './components/screens/RealityCheck'
import Settings from './components/screens/Settings'
import TeacherDashboard from './components/screens/TeacherDashboard'
import SkillsAssessment from './components/screens/SkillsAssessment'
import Passport from './components/screens/Passport'
import RejectionDecoder from './components/screens/RejectionDecoder'
import CareerSWOT from './components/screens/CareerSWOT'
import ResumeIntelligence from './components/screens/ResumeIntelligence'
import Discover from './components/screens/Discover'

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
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/passport/:userId" element={<Passport />} />

        {/* Protected routes */}
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/skills" element={<SkillsAssessment />} />
          <Route path="/realitycheck" element={<RealityCheck />} />
          <Route path="/swot" element={<CareerSWOT />} />
          <Route path="/resume" element={<ResumeIntelligence />} />
          <Route path="/rejection" element={<RejectionDecoder />} />
          <Route path="/pivot" element={<Pivot />} />
          <Route path="/sparkplan" element={<SparkPlan />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  )
}