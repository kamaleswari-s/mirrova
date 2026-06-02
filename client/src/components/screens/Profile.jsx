import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const { colors, theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [futures, setFutures] = useState([])
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    axios.get('/api/futures').then(r => setFutures(r.data)).catch(() => {})
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
  }, [])

  const chosenSelf = futures.find(f => f.is_chosen)
  const completedTasks = plan?.tasks?.filter(t => t.completed)?.length || 0

  return (
    <div style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 1000, color: colors.text }}>

      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar card */}
        <div style={{ background: colors.bgCard, borderRadius: 20, padding: '28px 24px', border: `0.5px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 26, color: colors.accentText, flexShrink: 0 }}>
              {user?.avatar_initials || '?'}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={name} onChange={e => setName(e.target.value)}
                    style={{ flex: 1, height: 38, borderRadius: 99, border: `1px solid ${colors.borderStrong}`, padding: '0 14px', fontSize: 14, fontFamily: 'Inter', background: colors.bg, color: colors.text, outline: 'none' }} />
                  <button onClick={() => { updateUser({ name }); setEditing(false) }}
                    style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: colors.accent, color: colors.accentText, border: 'none', borderRadius: 99, padding: '0 16px', cursor: 'pointer' }}>Save</button>
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: colors.text, margin: '0 0 2px' }}>{user?.name}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: 0, fontWeight: 500 }}>{user?.mode} mode</p>
                </>
              )}
            </div>
            <button onClick={() => setEditing(e => !e)}
              style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: colors.accent, color: colors.accentText, border: 'none', borderRadius: 99, padding: '8px 18px', cursor: 'pointer' }}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Future selves', value: futures.length, color: '#FBA002' },
              { label: 'Resonance', value: chosenSelf ? `${chosenSelf.resonance_score || 0}%` : '—', color: colors.accent },
              { label: 'Tasks done', value: completedTasks, color: '#615091' },
            ].map(s => (
              <div key={s.label} style={{ background: colors.bgMid, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Identity card */}
        <div style={{ background: colors.bgCard, borderRadius: 20, padding: '24px', border: `0.5px solid ${colors.border}` }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: '0 0 16px' }}>Identity</p>
          {[
            { label: 'Current field', value: user?.current_field },
            { label: 'Dream direction', value: user?.dream_direction },
            { label: 'Mode', value: user?.mode },
            { label: 'Email', value: user?.email },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `0.5px solid ${colors.border}` }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: colors.text, textAlign: 'right', maxWidth: '55%' }}>{row.value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Theme card */}
        <div style={{ background: colors.bgCard, borderRadius: 20, padding: '24px', border: `0.5px solid ${colors.border}` }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: '0 0 14px' }}>App theme</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[['ivory', '#EFE9E0', 'Soft Ivory'], ['dutch', '#C8D98A', 'Forest Dutch'], ['dark', '#1A2118', 'Deep Olive']].map(([k, bg, label]) => (
              <button key={k} onClick={() => setTheme(k)}
                style={{ flex: 1, padding: '12px 8px', borderRadius: 12, background: bg, border: theme === k ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'border 0.2s' }}>
                {theme === k && <span style={{ fontSize: 12, color: k === 'dark' ? '#FBA002' : '#0F9E99', fontWeight: 700 }}>✓</span>}
                <span style={{ fontFamily: 'Inter', fontSize: 11, color: k === 'dark' ? '#F2E8D1' : '#1A2118', fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Chosen future self */}
        <div style={{ background: '#1A2118', borderRadius: 20, padding: '24px', cursor: 'pointer', border: '1px solid rgba(251,160,2,0.3)' }} onClick={() => navigate('/simulate')}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Your chosen future self</p>
          {chosenSelf ? (
            <>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#FBA002', margin: '0 0 4px' }}>{chosenSelf.job_title}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#B5A98A', margin: '0 0 16px', fontWeight: 500 }}>{chosenSelf.company_type} · {chosenSelf.city} · {chosenSelf.year}</p>
              <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.7, borderLeft: '3px solid #FBA002', paddingLeft: 14 }}>"{chosenSelf.intro_quote}"</p>
            </>
          ) : (
            <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 15, color: '#B5A98A', margin: 0 }}>No future self chosen yet. Go simulate →</p>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ background: colors.bgCard, borderRadius: 20, padding: '24px', border: `0.5px solid ${colors.border}` }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: '0 0 14px' }}>Quick actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '◈ Re-simulate my future selves', to: '/simulate', primary: true },
              { label: '◉ Check my blind spots', to: '/blindspots', primary: false },
              { label: '⚡ View my spark plan', to: '/sparkplan', primary: false },
            ].map(btn => (
              <button key={btn.label} onClick={() => navigate(btn.to)}
                style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: btn.primary ? colors.btnPrimary : colors.bgMid, color: btn.primary ? colors.btnPrimaryText : colors.text, border: btn.primary ? 'none' : `1px solid ${colors.border}`, borderRadius: 99, padding: '13px 24px', cursor: 'pointer', textAlign: 'left' }}>
                {btn.label}
              </button>
            ))}
            <button onClick={() => { logout(); navigate('/') }}
              style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#722F37', border: '1.5px solid #722F37', borderRadius: 99, padding: '13px 24px', cursor: 'pointer', textAlign: 'left' }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Membership */}
        <div style={{ background: colors.bgCard, borderRadius: 20, padding: '24px', border: `0.5px solid ${colors.border}` }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: '0 0 4px' }}>Free plan</p>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 14px', fontWeight: 500 }}>All core features included. No credit card needed.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Future Self Chat', 'Blind Spot Report', 'Pivot Bridge', '90-Day Plan'].map(f => (
              <span key={f} style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, background: `${colors.accent}18`, color: colors.accent, padding: '4px 12px', borderRadius: 99, border: `1px solid ${colors.accent}30` }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}