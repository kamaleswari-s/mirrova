import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTheme } from '../../context/ThemeContext'

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

  return (
    <>
      <style>{`
        .app-wrapper {
          display: flex;
          height: 100vh;
          background: ${c.bg};
          overflow: hidden;
        }
        .app-sidebar {
          display: flex;
          flex-shrink: 0;
        }
        .app-main {
          flex: 1;
          overflow-y: auto;
          height: 100vh;
          min-width: 0;
        }
        .app-main-inner {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding-bottom: 0;
        }
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .app-sidebar {
            display: none !important;
          }
          .app-main-inner {
            max-width: 100% !important;
            padding-bottom: 72px !important;
          }
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: ${c.bgCard || '#1A2118'};
            border-top: 1px solid rgba(255,255,255,0.1);
            z-index: 999;
            align-items: center;
            justify-content: space-around;
          }
          .mobile-nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 6px 0;
            flex: 1;
          }
          .mobile-nav-icon {
            font-size: 22px;
            line-height: 1;
          }
          .mobile-nav-label {
            font-family: Inter, sans-serif;
            font-size: 9px;
            letter-spacing: 0.02em;
            white-space: nowrap;
          }
        }
      `}</style>

      <div className="app-wrapper">
        <div className="app-sidebar">
          <Sidebar />
        </div>

        <main className="app-main">
          <div className="app-main-inner">
            <Outlet />
          </div>
        </main>

        <nav className="mobile-bottom-nav">
          {mobileNavItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <button
                key={item.to}
                className="mobile-nav-btn"
                onClick={() => navigate(item.to)}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label" style={{ color: isActive ? '#0F9E99' : '#7A6E58', fontWeight: isActive ? 700 : 400 }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}