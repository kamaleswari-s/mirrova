import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [futures, setFutures] = useState([])
  const [plan, setPlan] = useState(null)
  const [realityCheck, setRealityCheck] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    axios.get('/api/futures').then(r => setFutures(r.data)).catch(() => {})
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
    axios.get('/api/realitycheck').then(r => setRealityCheck(r.data)).catch(() => {})
  }, [])

  const chosenSelf = futures.find(f => f.is_chosen)
  const completedTasks = plan?.tasks?.filter(t => t.completed)?.length || 0
  const totalTasks = plan?.tasks?.length || 27

  const sharePassport = () => {
    const url = `${window.location.origin}/passport/${user?.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: '24px',
    border: `1px solid ${c.border}`,
    ...extra
  })

  const lbl = (color) => ({
    fontFamily: 'Inter', fontSize: 10,
    color: color || c.textMuted,
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', margin: '0 0 12px'
  })

  return (
    <div style={{ padding: '40px 48px', color: c.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: c.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            My Mirror
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500 }}>
            Your career identity, progress and journey — all in one place.
          </p>
        </div>
        <button onClick={sharePassport}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: copied ? '#0F9E99' : c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 24px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
          {copied ? '✓ Link copied!' : '🎓 Share passport →'}
        </button>
      </div>

      {/* Passport preview banner */}
      <div onClick={() => navigate(`/passport/${user?.id}`)}
        style={{ background: 'linear-gradient(135deg, #1A2118, #0E1512)', borderRadius: 16, padding: '20px 28px', marginBottom: 24, border: '1px solid rgba(15,158,153,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(15,158,153,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(15,158,153,0.3)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(15,158,153,0.15)', border: '1px solid rgba(15,158,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            🎓
          </div>
          <div>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: '0 0 4px' }}>Your Employability Passport</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: 0, fontWeight: 500 }}>
              Share with employers — shows your career readiness, skills and target role
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {realityCheck && (
            <div style={{ textAlign: 'center', background: 'rgba(15,158,153,0.1)', borderRadius: 10, padding: '8px 16px', border: '1px solid rgba(15,158,153,0.2)' }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 20, color: '#0F9E99', margin: '0 0 2px' }}>{realityCheck.overall_score}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', margin: 0, fontWeight: 600 }}>SCORE</p>
            </div>
          )}
          <span style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: '#0F9E99' }}>View →</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Identity card */}
          <div style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0 }}>
                {user?.avatar_initials || '?'}
              </div>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 22, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{user?.name}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0, fontWeight: 500 }}>
                  {user?.mode} mode · {user?.preferred_language || 'English'}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Future selves', value: futures.length, color: '#FBA002' },
                { label: 'Resonance', value: chosenSelf ? `${chosenSelf.resonance_score || 0}%` : '—', color: c.accent },
                { label: 'Tasks done', value: completedTasks, color: '#615091' },
              ].map(s => (
                <div key={s.label} style={{ background: c.bg, borderRadius: 12, padding: '12px', textAlign: 'center', border: `1px solid ${c.border}` }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 22, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.textMuted, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Profile details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Current field', value: user?.current_field },
                { label: 'Dream direction', value: user?.dream_direction },
                { label: 'Email', value: user?.email },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? `1px solid ${c.border}` : 'none' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: c.text, textAlign: 'right', maxWidth: '55%' }}>{row.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Journey progress */}
          <div style={card()}>
            <p style={lbl()}>Journey progress</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Onboarding complete', done: true, color: '#0F9E99' },
                { label: 'Future selves generated', done: futures.length > 0, color: '#FBA002' },
                { label: 'Future self chosen', done: !!chosenSelf, color: '#FBA002' },
                { label: 'Reality Check done', done: !!realityCheck, color: '#722F37' },
                { label: 'Spark plan generated', done: !!plan, color: '#0F9E99' },
                { label: 'First task completed', done: completedTasks > 0, color: '#0F9E99' },
                { label: 'Passport shared', done: false, color: '#615091' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: item.done ? item.color : 'transparent', border: `2px solid ${item.done ? item.color : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    {item.done && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: item.done ? c.text : c.textMuted, fontWeight: item.done ? 600 : 400 }}>{item.label}</span>
                  {!item.done && <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, marginLeft: 'auto', fontStyle: 'italic' }}>pending</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Chosen future self */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(251,160,2,0.2)' }}>
            <p style={lbl('#FBA002')}>Your chosen future self</p>
            {chosenSelf ? (
              <>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#FBA002', margin: '0 0 4px' }}>{chosenSelf.job_title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#B5A98A', margin: '0 0 16px', fontWeight: 500 }}>{chosenSelf.company_type} · {chosenSelf.city} · {chosenSelf.year}</p>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#7A6E58', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resonance score</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#FBA002', fontWeight: 700 }}>{chosenSelf.resonance_score || 0}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(251,160,2,0.15)', borderRadius: 99 }}>
                    <div style={{ height: 4, width: `${chosenSelf.resonance_score || 0}%`, background: '#FBA002', borderRadius: 99 }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13, color: '#F2E8D1', margin: '0 0 16px', lineHeight: 1.7, borderLeft: '2px solid rgba(251,160,2,0.4)', paddingLeft: 14 }}>
                  "{chosenSelf.intro_quote}"
                </p>
                <button onClick={() => navigate('/simulate')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%' }}>
                  Chat with future self →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', margin: '0 0 14px', lineHeight: 1.6 }}>
                  No future self chosen yet.
                </p>
                <button onClick={() => navigate('/simulate')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%' }}>
                  Meet your future self →
                </button>
              </>
            )}
          </div>

          {/* Reality check summary */}
          {realityCheck && (
            <div style={card()}>
              <p style={lbl()}>Reality check summary</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${c.accent}15`, border: `3px solid ${c.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 16, color: c.accent }}>{realityCheck.overall_score}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: c.text, margin: '0 0 4px' }}>{realityCheck.score_label}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{realityCheck.headline}</p>
                </div>
              </div>
              <button onClick={() => navigate('/realitycheck')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '9px', cursor: 'pointer', width: '100%' }}>
                View full reality check →
              </button>
            </div>
          )}

          {/* Spark plan progress */}
          <div style={card()}>
            <p style={lbl()}>Spark plan progress</p>
            {plan ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: c.accent }}>{completedTasks}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted }}>of {totalTasks} tasks</span>
                </div>
                <div style={{ height: 6, background: `${c.accent}15`, borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completedTasks / totalTasks) * 100}%`, background: c.accent, borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {[
                    { label: 'M1', done: completedTasks >= 9 },
                    { label: 'M2', done: completedTasks >= 18 },
                    { label: 'M3', done: completedTasks >= 27 },
                  ].map(m => (
                    <div key={m.label} style={{ flex: 1, padding: '8px', borderRadius: 10, background: m.done ? `${c.accent}20` : c.bg, border: `1px solid ${m.done ? c.accent : c.border}`, textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: m.done ? c.accent : c.textMuted }}>{m.done ? '✓' : m.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/sparkplan')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '9px', cursor: 'pointer', width: '100%', marginTop: 12 }}>
                  Continue spark plan →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 12px' }}>No spark plan generated yet.</p>
                <button onClick={() => navigate('/sparkplan')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%' }}>
                  Generate spark plan →
                </button>
              </>
            )}
          </div>

          {/* Preferences */}
          <div style={card()}>
            <p style={lbl()}>Preferences</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Language', value: user?.preferred_language || 'English' },
                { label: 'Mode', value: user?.mode || 'choosing' },
                { label: 'Member since', value: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 2 ? `1px solid ${c.border}` : 'none' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: c.text }}>{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/settings')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%', marginTop: 14 }}>
              Edit in Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}