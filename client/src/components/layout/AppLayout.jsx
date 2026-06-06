import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTheme } from '../../context/ThemeContext'
import useIsMobile from '../../hooks/useIsMobile'

const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/simulate', label: 'Future', icon: '🔮' },
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
    <div style={{
      display: 'flex',
      height: '100vh',
      background: c.bg,
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* Sidebar — desktop only */}
      {!isMobile && <Sidebar />}

      {/* Main content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        height: '100vh',
        width: '100%',
        minWidth: 0,
      }}>
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : 1100,
          margin: '0 auto',
          paddingBottom: isMobile ? 72 : 0,
        }}>
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
          height: 60,
          background: c.bgCard || '#1A2118',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {mobileNavItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 0',
                  flex: 1,
                  minWidth: 0,
                }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontFamily: 'Inter',
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#0F9E99' : '#7A6E58',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}>
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