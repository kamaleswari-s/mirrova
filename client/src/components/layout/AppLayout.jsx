import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTheme } from '../../context/ThemeContext'

export default function AppLayout() {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg, transition: 'background 0.3s' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}