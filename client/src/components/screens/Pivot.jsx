import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '../../hooks/useIsMobile'

export default function Pivot() {
  const { colors: c } = useTheme()
  const { user } = useAuth()
  const isMobile = useIsMobile()
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
    { skill: 'Problem solving', desc: 'Breaking down complex challenges into manageable steps' },
    { skill: 'Analytical thinking', desc: 'Using data and evidence to make decisions' },
    { skill: profile?.top_skill || 'Core skill', desc: 'Your unique strength that transfers directly' },
  ]

  const pathwaySteps = [
    { phase: 'Phase 1', duration: '0–30 days', title: 'Foundation', color: '#722F37', steps: ['Audit your current skills against job descriptions', `Research 10 real ${future?.job_title || 'target role'} job postings`, 'Identify your top 3 skill gaps', 'Set up your learning environment and tools'] },
    { phase: 'Phase 2', duration: '30–60 days', title: 'Build', color: '#FBA002', steps: ['Complete 1 portfolio project in your target domain', `Learn core tools for ${future?.job_title || 'your role'}`, 'Join 2 relevant online communities', 'Start documenting your learning publicly'] },
    { phase: 'Phase 3', duration: '60–90 days', title: 'Signal', color: '#0F9E99', steps: ['Complete a second portfolio project', 'Get 1 freelance or internship project', 'Update LinkedIn and resume with new skills', 'Apply to 5 target roles per week'] },
    { phase: 'Phase 4', duration: '90+ days', title: 'Land', color: '#38683D', steps: ['Continue applying while improving portfolio', 'Reach out to 3 people per week in target industry', 'Prepare for interviews with mock sessions', 'Negotiate your first offer confidently'] },
  ]

  const acquire = [
    { item: 'Build 2 portfolio case studies', time: '30 days', impact: 'Critical', color: '#722F37' },
    { item: `Learn core tools for ${future?.job_title || 'your target role'}`, time: '14 days', impact: 'High', color: '#FBA002' },
    { item: 'Get 1 freelance or internship project', time: '60 days', impact: 'High', color: '#FBA002' },
    { item: 'Build your online presence', time: '7 days', impact: 'Medium', color: '#0F9E99' },
    { item: 'Network with 3 people in your target field', time: 'Ongoing', impact: 'High', color: '#FBA002' },
  ]

  const card = (extra = {}) => ({
    background: c.bgCard, borderRadius: 16,
    padding: isMobile ? '16px' : '24px',
    border: `1px solid ${c.border}`, ...extra
  })

  const lbl = (color) => ({
    fontFamily: 'Inter', fontSize: 10,
    color: color || c.textMuted, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px'
  })

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px 48px', color: c.text }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-heading" style={{ fontSize: isMobile ? 26 : 32, color: c.text, marginBottom: 8 }}>Pivot Bridge</h1>
        <p style={{ fontFamily: 'Inter', fontSize: isMobile ? 13 : 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
          You haven't wasted anything. Every step brought you here. Let's build your bridge.
        </p>
      </div>

      {/* FROM → TO bridge */}
      <div style={{ background: '#1A2118', borderRadius: 20, padding: isMobile ? '18px 16px' : '28px', marginBottom: 20, border: '1px solid rgba(15,158,153,0.2)' }}>
        <p style={lbl('#0F9E99')}>Your pivot bridge</p>

        {/* From → To — stack on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr', gap: isMobile ? 10 : 16, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: isMobile ? '14px' : '20px' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px', fontWeight: 600 }}>Where you are</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 16 : 18, color: '#F2E8D1', margin: '0 0 4px' }}>{profile?.current_field || '—'}</p>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: 0 }}>{user?.name || 'You'} · Today</p>
          </div>

          {/* Arrow — horizontal on desktop, vertical hint on mobile */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <div style={{ width: isMobile ? 20 : 2, height: isMobile ? 2 : 20, background: 'rgba(15,158,153,0.3)', borderRadius: 99 }} />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(15,158,153,0.15)', border: '1px solid rgba(15,158,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>→</div>
            <div style={{ width: isMobile ? 20 : 2, height: isMobile ? 2 : 20, background: 'rgba(15,158,153,0.3)', borderRadius: 99 }} />
          </div>

          <div style={{ background: 'rgba(15,158,153,0.1)', borderRadius: 14, padding: isMobile ? '14px' : '20px', border: '1px solid rgba(15,158,153,0.2)' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px', fontWeight: 600 }}>Where you're going</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 16 : 18, color: '#0F9E99', margin: '0 0 4px' }}>{future?.job_title || profile?.dream_direction || '—'}</p>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: 0 }}>{future?.company_type || 'Your target'} · {future?.year || '2029'}</p>
          </div>
        </div>

        {/* Transferable skills */}
        <p style={lbl('#FBA002')}>What transfers directly</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 8 }}>
          {transfers.map((t, i) => (
            <div key={i} style={{ background: 'rgba(251,160,2,0.08)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(251,160,2,0.15)' }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#FBA002', margin: '0 0 4px' }}>{t.skill}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#7A6E58', margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 16 }}>

        {/* LEFT — Pathway */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card()}>
            <p style={lbl()}>Step-by-step pathway</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 20px', lineHeight: 1.6 }}>
              From <strong style={{ color: c.text }}>{profile?.current_field || 'your field'}</strong> to <strong style={{ color: c.accent }}>{future?.job_title || 'your target role'}</strong>
            </p>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: c.border, borderRadius: 99, zIndex: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {pathwaySteps.map((phase, pi) => (
                  <div key={pi} style={{ display: 'flex', gap: 14, marginBottom: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phase.color}20`, border: `2px solid ${phase.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 11, color: phase.color }}>{pi + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: c.text, margin: 0 }}>{phase.title}</p>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: phase.color, background: `${phase.color}15`, padding: '2px 10px', borderRadius: 99, fontWeight: 600 }}>{phase.duration}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {phase.steps.map((step, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: c.bgMid, borderRadius: 8, border: `1px solid ${c.border}` }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: phase.color, flexShrink: 0, marginTop: 5 }} />
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/sparkplan')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px 28px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', alignSelf: 'flex-start' }}>
            Build my 90-day spark plan →
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Timeline calculator */}
          <div style={card({ borderLeft: `4px solid ${c.accent}` })}>
            <p style={lbl(c.accent)}>Timeline calculator</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 14px', lineHeight: 1.6 }}>
              Hours per day you can commit?
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <input type="range" min={1} max={8} step={1} value={hours}
                onChange={e => setHours(Number(e.target.value))}
                style={{ flex: 1, accentColor: c.accent }} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: c.accent, minWidth: 36 }}>{hours}h</span>
            </div>
            <div style={{ background: `${c.accent}10`, borderRadius: 12, padding: '14px', border: `1px solid ${c.accent}25`, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: '0 0 4px', fontWeight: 500 }}>At {hours}h/day you'll be job-ready in</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: c.accent, margin: '0 0 2px', lineHeight: 1 }}>{months}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, fontWeight: 600 }}>month{months > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* What to acquire */}
          <div style={card()}>
            <p style={lbl()}>What to acquire — by impact</p>
            {acquire.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < acquire.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 14, color: a.color, minWidth: 20 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: c.text, margin: '0 0 2px', lineHeight: 1.3 }}>{a.item}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.textMuted, margin: 0 }}>{a.time}</p>
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: a.color, background: `${a.color}15`, padding: '2px 8px', borderRadius: 99, flexShrink: 0, border: `1px solid ${a.color}30` }}>{a.impact}</span>
              </div>
            ))}
          </div>

          {/* Honest truth */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: isMobile ? '16px' : '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={lbl('#FBA002')}>The honest truth</p>
            <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13, color: '#B5A98A', margin: 0, lineHeight: 1.8 }}>
              "Most people who pivot successfully don't do it faster — they do it <strong style={{ color: '#FBA002' }}>smarter</strong>. Your background in <strong style={{ color: '#F2E8D1' }}>{profile?.current_field || 'your field'}</strong> is not a liability. It's your edge."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}