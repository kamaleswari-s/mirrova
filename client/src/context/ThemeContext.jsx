import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export const THEMES = {
  ivory: {
    name: 'ivory',
    bg: '#EFE9E0',
    bgCard: '#FFFFFF',
    bgMid: '#E8E2D8',
    bgSidebar: '#1A2118',
    text: '#1A2118',
    textMuted: '#5A5A5A',
    textSubtle: '#8A8A8A',
    accent: '#0F9E99',
    accentText: '#EFE9E0',
    btnPrimary: '#0F9E99',
    btnPrimaryText: '#EFE9E0',
    btnSecondary: '#1A2118',
    btnSecondaryText: '#EFE9E0',
    border: 'rgba(26,33,24,0.12)',
    borderStrong: 'rgba(26,33,24,0.25)',
    swatch: '#EFE9E0',
    label: 'Soft Ivory',
  },
  dutch: {
    name: 'dutch',
    bg: '#C8D98A',
    bgCard: '#D4E394',
    bgMid: '#BCCF7E',
    bgSidebar: '#2A3A10',
    text: '#1A2400',
    textMuted: '#3A4A10',
    textSubtle: '#5A6A30',
    accent: '#722F37',
    accentText: '#EEFFBB',
    btnPrimary: '#722F37',
    btnPrimaryText: '#EEFFBB',
    btnSecondary: '#2A3A10',
    btnSecondaryText: '#EEFFBB',
    border: 'rgba(26,36,0,0.15)',
    borderStrong: 'rgba(26,36,0,0.3)',
    swatch: '#C8D98A',
    label: 'Forest Dutch',
  },
  dark: {
    name: 'dark',
    bg: '#1A2118',
    bgCard: '#313B2F',
    bgMid: '#252E23',
    bgSidebar: '#111810',
    text: '#F2E8D1',
    textMuted: '#B5A98A',
    textSubtle: '#7A6E58',
    accent: '#FBA002',
    accentText: '#1A2118',
    btnPrimary: '#FBA002',
    btnPrimaryText: '#1A2118',
    btnSecondary: '#F2E8D1',
    btnSecondaryText: '#1A2118',
    border: 'rgba(242,232,209,0.1)',
    borderStrong: 'rgba(242,232,209,0.2)',
    swatch: '#1A2118',
    label: 'Deep Olive',
  }
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState('ivory')

  useEffect(() => {
    if (user?.theme) setThemeState(user.theme)
  }, [user])

  const setTheme = async (themeName) => {
    setThemeState(themeName)
    try {
      await axios.patch('/api/auth/theme', { theme: themeName })
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)