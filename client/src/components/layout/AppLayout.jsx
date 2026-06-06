import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTheme } from '../../context/ThemeContext'
import useIsMobile from '../../hooks/useIsMobile'

const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/simulate', label: 'Simulate', icon: '🔮' },
  { to: '/realitycheck', label: 'Reality', icon: '⚡' },
  { to: '/resume', label: 'Resume', icon: '📄' },
  { to: '/profile', label: 'Mirror', icon: '🪞' },
]

export default function AppLayout() {
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', height: '100vh', background: c.bg, transition: 'background 0.3s', overflow: 'hidden' }}>

      {/* Sidebar — desktop only */}
      {!isMobile && <Sidebar />}

      {/* Main content */}
      <main className="app-main" style={{ flex: 1, overflowY: 'auto', height: '100vh', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 1100, minWidth: 0, paddingBottom: isMobile ? 80 : 0 }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: c.bgSidebar || c.bgCard,
          borderTop: `1px solid rgba(255,255,255,0.08)`,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
        }}>
          {mobileNavItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <button key={item.to} onClick={() => navigate(item.to)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: isActive ? 'rgba(15,158,153,0.12)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  padding: '8px 12px', borderRadius: 12, flex: 1,
                }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? '#0F9E99' : '#7A6E58', letterSpacing: '0.02em' }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}