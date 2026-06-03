import { useState } from 'react'
import axios from 'axios'
import { useTheme, THEMES } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const languages = [
  { key: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
  { key: 'Hindi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { key: 'Tamil', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { key: 'Telugu', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { key: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { key: 'Bengali', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
]

export default function Settings() {
  const { colors: c, theme, setTheme } = useTheme()
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [language, setLanguage] = useState(user?.preferred_language || 'English')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveSettings = async () => {
    setSaving(true)
    try {
      await axios.patch('/api/auth/profile', { name, preferred_language: language })
      await axios.patch('/api/auth/theme', { theme })
      updateUser({ name, preferred_language: language, theme })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Error saving settings')
    } finally { setSaving(false) }
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: '24px',
    border: `1px solid ${c.border}`,
    marginBottom: 16,
    ...extra
  })

  const lbl = () => ({
    fontFamily: 'Inter', fontSize: 10,
    color: c.textMuted, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 16px'
  })

  return (
    <div style={{ padding: '40px 48px', color: c.text }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontWeight: 800, fontSize: 32, color: c.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500 }}>
          Manage your profile, language and app preferences.
        </p>
      </div>

      {/* Profile */}
      <div style={card()}>
        <p style={lbl()}>Profile</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: 'Inter', fontSize: 12, color: c.text, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', height: 44, borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '0 14px', fontSize: 14, fontFamily: 'Inter', background: c.bg, color: c.text, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = c.accent}
              onBlur={e => e.target.style.borderColor = c.border}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Inter', fontSize: 12, color: c.text, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <input value={user?.email || ''} disabled
              style={{ width: '100%', height: 44, borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '0 14px', fontSize: 14, fontFamily: 'Inter', background: `${c.border}30`, color: c.textMuted, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
            />
          </div>
        </div>
      </div>

      {/* Language */}
      <div style={card()}>
        <p style={lbl()}>Preferred language</p>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 16px', lineHeight: 1.6 }}>
          Your future self, onboarding questions and all AI responses will be in this language.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {languages.map(lang => (
            <button key={lang.key} onClick={() => setLanguage(lang.key)}
              style={{
                background: language === lang.key ? `${c.accent}15` : 'transparent',
                border: `1.5px solid ${language === lang.key ? c.accent : c.border}`,
                borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 22, display: 'block', marginBottom: 6 }}>{lang.flag}</span>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: language === lang.key ? c.accent : c.text, margin: '0 0 2px' }}>{lang.label}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: 0 }}>{lang.native}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={card()}>
        <p style={lbl()}>App theme</p>
        <div style={{ display: 'flex', gap: 14 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setTheme(key)}
              style={{
                flex: 1, padding: '16px 12px', borderRadius: 14,
                background: t.swatch,
                border: theme === key ? `2.5px solid ${c.accent}` : `1.5px solid ${c.border}`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, transition: 'all 0.15s',
                transform: theme === key ? 'scale(1.03)' : 'scale(1)'
              }}>
              {theme === key && <span style={{ fontSize: 14, color: key === 'dark' ? '#FBA002' : '#0F9E99' }}>✓</span>}
              <span className="wordmark" style={{ fontSize: 20, color: t.text }}>M</span>
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: t.text, fontWeight: 600, opacity: 0.8 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={card({ border: '1px solid #72203740' })}>
        <p style={{ ...lbl(), color: '#722F37' }}>Danger zone</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { logout(); navigate('/') }}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#722F37', border: '1.5px solid #722F37', borderRadius: 99, padding: '11px 24px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={saveSettings} disabled={saving}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '13px 36px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save settings →'}
        </button>
        {saved && <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#0F9E99', fontWeight: 600 }}>✓ Saved!</span>}
      </div>
    </div>
  )
}


