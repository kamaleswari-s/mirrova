import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export const THEMES = {
  ivory: {
    name: 'ivory',
    label: 'Soft Ivory',
    swatch: '#EFE9E0',
    bg: '#EFE9E0',
    bgCard: '#FFFFFF',
    bgMid: '#E8E2D8',
    bgSidebar: '#1A2118',
    text: '#1A2118',
    textMuted: '#5A5A5A',
    textSubtle: '#8A8A8A',
    accent: '#0F9E99',
    accentText: '#FFFFFF',
    btnPrimary: '#0F9E99',
    btnPrimaryText: '#FFFFFF',
    btnSecondary: '#1A2118',
    btnSecondaryText: '#EFE9E0',
    border: 'rgba(26,33,24,0.12)',
    borderStrong: 'rgba(26,33,24,0.22)',
  },

  midnight: {
    name: 'midnight',
    label: 'Midnight',
    swatch: '#1B2340',
    bg: '#1B2340',
    bgCard: '#222B4F',
    bgMid: '#162038',
    bgSidebar: '#0F1628',
    text: '#E8D9C8',
    textMuted: '#9A8878',
    textSubtle: '#6A5848',
    accent: '#B09080',
    accentText: '#0F1628',
    btnPrimary: '#B09080',
    btnPrimaryText: '#0F1628',
    btnSecondary: '#E8D9C8',
    btnSecondaryText: '#0F1628',
    border: 'rgba(232,217,200,0.12)',
    borderStrong: 'rgba(232,217,200,0.22)',
  },

  espresso: {
    name: 'espresso',
    label: 'Espresso',
    swatch: '#1A0F0A',
    bg: '#1A0F0A',
    bgCard: '#2C1F18',
    bgMid: '#231610',
    bgSidebar: '#110A06',
    text: '#E8EDD8',
    textMuted: '#B8BA98',
    textSubtle: '#888A68',
    accent: '#C8C49A',
    accentText: '#1A0F0A',
    btnPrimary: '#C8C49A',
    btnPrimaryText: '#1A0F0A',
    btnSecondary: '#3D2B1F',
    btnSecondaryText: '#E8EDD8',
    border: 'rgba(232,237,216,0.1)',
    borderStrong: 'rgba(232,237,216,0.2)',
  },

  academia: {
    name: 'academia',
    label: 'Dark Academia',
    swatch: '#0F0E0E',
    bg: '#0F0E0E',
    bgCard: '#1C1A1A',
    bgMid: '#161414',
    bgSidebar: '#080707',
    text: '#F0F0F0',
    textMuted: '#A89A8A',
    textSubtle: '#6A5A4A',
    accent: '#7A8A3A',
    accentText: '#F0F0F0',
    btnPrimary: '#7A8A3A',
    btnPrimaryText: '#F0F0F0',
    btnSecondary: '#5A6A2A',
    btnSecondaryText: '#F0F0F0',
    border: 'rgba(122,138,58,0.2)',
    borderStrong: 'rgba(122,138,58,0.35)',
  }
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState('ivory')

  useEffect(() => {
    if (user?.theme && THEMES[user.theme]) {
      setThemeState(user.theme)
    }
  }, [user])

  const setTheme = async (themeName) => {
    setThemeState(themeName)
    try {
      await axios.patch('/api/auth/theme', { theme: themeName })
    } catch {}
  }

  const colors = THEMES[theme] || THEMES.ivory

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)