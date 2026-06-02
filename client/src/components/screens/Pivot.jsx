import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Pivot() {
  const { colors } = useTheme()
  const [hours, setHours] = useState(2)
  const [profile, setProfile] = useState(null)
  const [future, setFuture] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/onboarding/profile').then(r => setProfile(r.data)).catch(() => {})
    axios.get('/api/futures').then(r => {
      const chosen = r.data.find(f => f.is_chosen) || r.data[0]
      setFuture(chosen)
    }).catch(() => {})
  }, [])

  const months = Math.max(1, Math.round(12 / hours))

  const transfers = [
    { skill: 'Problem solving' },
    { skill: 'Analytical thinking' },
    { skill: profile?.top_skill || 'Core skill' },
  ]

  const acquire = [
    { item: 'Build 2 portfolio case studies', time: '30 days', impact: 'Highest' },
    { item: `Learn core tools for ${future?.job_title || 'your target role'}`, time: '14 days', impact: 'High' },
    { item: 'Get 1 freelance or internship project', time: '60 days', impact: 'High' },
    { item: 'Build your online presence', time: '7 days', impact: 'Medium' },
  ]

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, color: colors.text }}>
      <h1 className="page-heading" style={{ fontSize: 32, color: colors.text, marginBottom: 8 }}>Pivot Bridge</h1>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: colors.textMuted, marginBottom: 32 }}>You haven't wasted anything. Let's build your bridge.</p>

      <div style={{ background: colors.bgCard, borderRadius: 20, padding: 24, marginBottom: 28, borderLeft: `4px solid ${colors.accent}` }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: colors.text, margin: '0 0 10px' }}>You haven't wasted a single day.</p>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: colors.textMuted, margin: 0, lineHeight: 1.7 }}>
          Studying <strong style={{ color: colors.text }}>{profile?.current_field || 'your field'}</strong> gave you more than you think. Systems thinking, analytical depth, technical empathy — these are exactly what makes a great <strong style={{ color: colors.text }}>{future?.job_title || profile?.dream_direction || 'professional in your target role'}</strong>. You're not starting over. You're building a bridge.
        </p>
      </div>

      {/* Bridge visual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ background: colors.bgCard, borderRadius: 12, padding: '16px 20px', border: `0.5px solid ${colors.border}`, flex: 1, minWidth: 140 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px', fontWeight: 600 }}>Where you are</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: 0 }}>{profile?.current_field || '—'}</p>
        </div>
        <div style={{ flex: 2, minWidth: 140, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontWeight: 600 }}>Transferable skills</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {transfers.map(t => (
              <span key={t.skill} style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: `${colors.accent}20`, color: colors.accent, padding: '4px 12px', borderRadius: 99, border: `1px solid ${colors.accent}40` }}>{t.skill}</span>
            ))}
          </div>
        </div>
        <div style={{ background: colors.accent, borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px', fontWeight: 600 }}>Where you're going</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff', margin: 0 }}>{future?.job_title || profile?.dream_direction || '—'}</p>
        </div>
      </div>

      {/* Acquire list */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: colors.text, marginBottom: 16 }}>What to acquire — ranked by impact</p>
        {acquire.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `0.5px solid ${colors.border}` }}>
            <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: 20, color: colors.accent, minWidth: 28 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: colors.text, margin: '0 0 2px' }}>{a.item}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: colors.textMuted, margin: 0 }}>{a.time}</p>
            </div>
            <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: `${colors.accent}20`, color: colors.accent, padding: '3px 10px', borderRadius: 99 }}>{a.impact}</span>
          </div>
        ))}
      </div>

      {/* Timeline slider */}
      <div style={{ background: colors.bgCard, borderRadius: 16, padding: 24, border: `0.5px solid ${colors.border}`, marginBottom: 28 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: colors.text, margin: '0 0 16px' }}>How long will it take?</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <label style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, whiteSpace: 'nowrap' }}>Hours per day:</label>
          <input type="range" min={1} max={8} step={1} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: colors.accent, minWidth: 30 }}>{hours}h</span>
        </div>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 16, color: colors.text, margin: 0 }}>
          At {hours} hour{hours > 1 ? 's' : ''}/day → job-ready in approximately{' '}
          <strong style={{ color: colors.accent }}>{months} month{months > 1 ? 's' : ''}</strong>
        </p>
      </div>

      <button onClick={() => navigate('/sparkplan')}
        style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, padding: '14px 32px', cursor: 'pointer' }}>
        Build my 90-day spark plan →
      </button>
    </div>
  )
}