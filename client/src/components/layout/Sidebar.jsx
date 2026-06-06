import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme, THEMES } from '../../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/simulate', label: 'Simulate', icon: '🔮' },
  { to: '/skills', label: 'Skills', icon: '📊' },
  { to: '/realitycheck', label: 'Reality Check', icon: '⚡' },
  { to: '/swot', label: 'Career SWOT', icon: '⊞' },
  { to: '/resume', label: 'Resume', icon: '📄' },
  { to: '/rejection', label: 'Rejection Decoder', icon: '🔍' },
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
      width: 240,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      overflow: 'hidden'
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 24px 16px' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 26, color: '#F2E8D1' }}>mirrova</span>
        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4A4A4A', margin: '3px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AI Career Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, padding: '0 10px', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 10,
              fontFamily: 'Inter, sans-serif',
              fontWeight: isActive ? 600 : 400,
              fontStyle: 'italic',
              fontSize: 13,
              textDecoration: 'none',
              background: isActive ? `${colors.accent}22` : 'transparent',
              color: isActive ? colors.accent : '#8A7E6A',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme switcher */}
      <div style={{ padding: '12px 20px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4A4A4A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontWeight: 600 }}>Theme</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setTheme(key)} title={t.label}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: t.swatch,
                border: theme === key ? `2.5px solid ${colors.accent}` : '1.5px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', padding: 0,
                transition: 'border 0.2s, transform 0.15s',
                transform: theme === key ? 'scale(1.15)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '12px 20px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: colors.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter', fontWeight: 800, fontSize: 13,
            color: '#fff', flexShrink: 0
          }}>
            {user?.avatar_initials || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#F2E8D1', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4A4A4A', margin: 0, fontWeight: 500 }}>
              {user?.preferred_language || 'English'} · {user?.mode}
            </p>
          </div>
          <button onClick={() => navigate('/settings')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: 0, opacity: 0.6 }}
            title="Settings">
            ⚙️
          </button>
        </div>
      </div>
    </aside>
  )
}