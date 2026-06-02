import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme, THEMES } from '../../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '⌂' },
  { to: '/simulate', label: 'Simulate', icon: '◈' },
  { to: '/blindspots', label: 'Blind Spots', icon: '◉' },
  { to: '/pivot', label: 'Pivot', icon: '⇌' },
  { to: '/sparkplan', label: 'Spark Plan', icon: '⚡' },
  { to: '/profile', label: 'My Mirror', icon: '◎' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, setTheme, colors } = useTheme()
  const navigate = useNavigate()

  return (
    <aside style={{ background: colors.bgSidebar, width: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0, transition: 'background 0.3s' }}>
      <div style={{ padding: '0 24px 28px' }}>
        <span className="wordmark" style={{ fontSize: 26, color: '#F2E8D1', letterSpacing: '-0.02em' }}>mirrova</span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 99,
              fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
              background: isActive ? `${colors.accent}25` : 'transparent',
              color: isActive ? colors.accent : '#B5A98A',
              transition: 'all 0.15s'
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Theme switcher */}
      <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#B5A98A', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Theme</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setTheme(key)} title={t.label}
              style={{ width: 28, height: 28, borderRadius: '50%', background: t.swatch, border: theme === key ? `2px solid ${colors.accent}` : '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'border 0.2s' }}
            />
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 13, color: colors.accentText, flexShrink: 0 }}>
            {user?.avatar_initials || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: '#F2E8D1', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <button onClick={() => { logout(); navigate('/') }} style={{ fontFamily: 'Lora', fontStyle: 'italic', fontSize: 11, color: '#722F37', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
          </div>
        </div>
      </div>
    </aside>
  )
}