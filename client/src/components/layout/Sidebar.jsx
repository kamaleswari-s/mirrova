import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme, THEMES } from '../../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/simulate', label: 'Simulate', icon: '🔮' },
  { to: '/realitycheck', label: 'Reality Check', icon: '⚡' },
  { to: '/blindspots', label: 'Blind Spots', icon: '🎯' },
  { to: '/pivot', label: 'Pivot', icon: '🔄' },
  { to: '/sparkplan', label: 'Spark Plan', icon: '📅' },
  { to: '/profile', label: 'My Mirror', icon: '🪞' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, setTheme, colors } = useTheme()
  const navigate = useNavigate()

  return (
    <aside style={{
      background: colors.bgSidebar,
      width: 220,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      flexShrink: 0,
      transition: 'background 0.3s'
    }}>

      {/* Logo */}
      <div style={{ padding: '0 24px 28px' }}>
        <span className="wordmark" style={{ fontSize: 26, color: '#F2E8D1', letterSpacing: '-0.02em' }}>mirrova</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'italic',
              fontWeight: isActive ? 700 : 500,
              fontSize: 13,
              textDecoration: 'none',
              background: isActive ? `${colors.accent}22` : 'transparent',
              color: isActive ? colors.accent : '#B5A98A',
              transition: 'all 0.15s',
              letterSpacing: '0.01em'
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.className.includes('active')) {
                e.currentTarget.style.background = `${colors.accent}10`
                e.currentTarget.style.color = '#F2E8D1'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.getAttribute('aria-current')) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#B5A98A'
              }
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme switcher */}
      <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', fontWeight: 600 }}>Theme</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setTheme(key)} title={t.label}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: t.swatch,
                border: theme === key ? `2.5px solid ${colors.accent}` : '1.5px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', padding: 0, flexShrink: 0,
                transition: 'border 0.2s, transform 0.15s',
                transform: theme === key ? 'scale(1.1)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: colors.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Fraunces', fontWeight: 900, fontSize: 13,
            color: colors.accentText, flexShrink: 0,
            border: `2px solid ${colors.accent}40`
          }}>
            {user?.avatar_initials || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#F2E8D1', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <button onClick={() => { logout(); navigate('/') }}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: 11, color: '#722F37', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}