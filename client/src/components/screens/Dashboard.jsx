import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function Dashboard() {
  const { user } = useAuth()
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [futures, setFutures] = useState([])
  const [plan, setPlan] = useState(null)
  const [realityCheck, setRealityCheck] = useState(null)
  const [chatMessages, setChatMessages] = useState([])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    axios.get('/api/futures').then(r => {
      setFutures(r.data)
      const chosen = r.data.find(f => f.is_chosen)
      if (chosen) {
        axios.get(`/api/chat/history/${chosen.id}`)
          .then(r => setChatMessages(r.data)).catch(() => {})
      }
    }).catch(() => {})
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
    axios.get('/api/realitycheck').then(r => setRealityCheck(r.data)).catch(() => {})
  }, [])

  const chosenSelf = futures.find(f => f.is_chosen)
  const completedTasks = plan?.tasks?.filter(t => t.completed)?.length || 0
  const totalTasks = plan?.tasks?.length || 27
  const nextTask = plan?.tasks?.find(t => !t.completed)
  const gapScore = Math.min(100, Math.round((completedTasks / totalTasks) * 100) + 15)
  const futureQuotes = chatMessages.filter(m => m.role === 'assistant')
  const dailyQuote = futureQuotes.length > 0 ? futureQuotes[new Date().getDate() % futureQuotes.length] : null

  const scoreColor = (score) => {
    if (score >= 80) return '#0F9E99'
    if (score >= 60) return '#D4A842'
    if (score >= 40) return '#FBA002'
    return '#722F37'
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: '20px 24px',
    border: `1px solid ${c.border}`,
    ...extra
  })

  const lbl = (color) => ({
    fontFamily: 'Inter', fontSize: 10,
    color: color || c.textMuted,
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', margin: '0 0 10px'
  })

  const quickActions = [
    { label: 'Simulate', icon: '🔮', path: '/simulate', color: '#615091' },
    { label: 'Reality Check', icon: '⚡', path: '/realitycheck', color: '#722F37' },
    { label: 'Skills', icon: '📊', path: '/skills', color: '#0F9E99' },
    { label: 'Career SWOT', icon: '⊞', path: '/swot', color: '#FBA002' },
    { label: 'Resume', icon: '📄', path: '/resume', color: '#38683D' },
    { label: 'Spark Plan', icon: '📅', path: '/sparkplan', color: '#D4A842' },
  ]

  return (
    <div style={{ padding: '40px 48px', color: c.text }}>

      {/* GREETING */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: c.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {greeting}, {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 15, color: c.accent, margin: 0, fontWeight: 500 }}>
          {chosenSelf ? `You're on your way to becoming a ${chosenSelf.job_title}.` : 'Your future self is waiting to meet you.'}
        </p>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ONBOARDING CHECKLIST — only show if incomplete */}
          {(!chosenSelf || !realityCheck || !plan) && (
            <div style={{ background: 'linear-gradient(135deg, #1A2118, #0E1512)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(15,158,153,0.2)' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                🚀 Get started — 3 steps to unlock your full career intelligence
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { done: !!chosenSelf, label: 'Meet your future selves', sub: 'See 3 AI versions of yourself in 2029', path: '/simulate', cta: 'Go →' },
                  { done: !!realityCheck, label: 'Get your Reality Check', sub: 'Find out honestly where you stand', path: '/realitycheck', cta: 'Go →' },
                  { done: !!plan, label: 'Generate your Spark Plan', sub: 'Build your 90-day action plan', path: '/sparkplan', cta: 'Go →' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: step.done ? 'rgba(15,158,153,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${step.done ? 'rgba(15,158,153,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: step.done ? '#0F9E99' : 'transparent', border: `2px solid ${step.done ? '#0F9E99' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.done
                        ? <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>
                        : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: step.done ? '#0F9E99' : '#F2E8D1', margin: '0 0 2px' }}>{step.label}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#7A6E58', margin: 0 }}>{step.sub}</p>
                    </div>
                    {!step.done && (
                      <button onClick={() => navigate(step.path)}
                        style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: '#0F9E99', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>
                        {step.cta}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NORTH STAR */}
          <div style={{ background: '#1A2118', borderRadius: 20, padding: '28px', border: '1px solid rgba(251,160,2,0.2)' }}>
            <p style={lbl('#FBA002')}>Your north star</p>
            {chosenSelf ? (
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#FBA002', margin: '0 0 4px', lineHeight: 1.2 }}>{chosenSelf.job_title}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#B5A98A', margin: '0 0 16px', fontWeight: 500 }}>{chosenSelf.company_type} · {chosenSelf.city} · {chosenSelf.year}</p>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resonance</span>
                      <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700 }}>{chosenSelf.resonance_score || 0}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(251,160,2,0.15)', borderRadius: 99 }}>
                      <div style={{ height: 4, width: `${chosenSelf.resonance_score || 0}%`, background: '#FBA002', borderRadius: 99 }} />
                    </div>
                  </div>
                  <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13, color: '#F2E8D1', margin: '0 0 18px', lineHeight: 1.7, borderLeft: '2px solid rgba(251,160,2,0.4)', paddingLeft: 12 }}>
                    "{chosenSelf.intro_quote}"
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate('/simulate')}
                      style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '10px 20px', cursor: 'pointer' }}>
                      Chat with future self →
                    </button>
                    <button onClick={() => navigate('/simulate')}
                      style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: '#B5A98A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '10px 20px', cursor: 'pointer' }}>
                      Change path
                    </button>
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'center', background: 'rgba(251,160,2,0.08)', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(251,160,2,0.15)' }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 40, color: '#FBA002', margin: '0 0 2px', lineHeight: 1 }}>
                    {Math.max(0, Math.round((new Date(chosenSelf.year, 0) - new Date()) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>days left</p>
                  <div style={{ width: '100%', height: 3, background: 'rgba(251,160,2,0.15)', borderRadius: 99, marginTop: 12 }}>
                    <div style={{ height: 3, width: `${gapScore}%`, background: '#FBA002', borderRadius: 99 }} />
                  </div>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', margin: '6px 0 0', fontWeight: 600 }}>{gapScore}% complete</p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', margin: '0 0 16px', lineHeight: 1.6 }}>
                  You haven't chosen your future self yet. Meet 3 AI versions of yourself — 5 years from now.
                </p>
                <button onClick={() => navigate('/simulate')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
                  Meet your future self →
                </button>
              </div>
            )}
          </div>

          {/* TODAY'S MESSAGE */}
          {dailyQuote && (
            <div style={card({ background: `${c.accent}08`, border: `1px solid ${c.accent}25` })}>
              <p style={lbl(c.accent)}>Today's message from your future self</p>
              <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
                "{dailyQuote.content.slice(0, 200)}{dailyQuote.content.length > 200 ? '...' : ''}"
              </p>
            </div>
          )}

          {/* SPARK PLAN PROGRESS */}
          <div style={card({ borderLeft: `4px solid ${c.accent}` })}>
            <p style={lbl(c.accent)}>Spark plan progress</p>
            {plan && nextTask ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: c.text, margin: 0 }}>{nextTask.title}</p>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted }}>{completedTasks}/{totalTasks} done</span>
                </div>
                <div style={{ height: 6, background: `${c.accent}15`, borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completedTasks / totalTasks) * 100}%`, background: c.accent, borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { label: 'M1', done: completedTasks >= 9 },
                      { label: 'M2', done: completedTasks >= 18 },
                      { label: 'M3', done: completedTasks >= 27 },
                    ].map(m => (
                      <div key={m.label} style={{ width: 28, height: 28, borderRadius: 8, background: m.done ? c.accent : `${c.accent}15`, border: `1.5px solid ${m.done ? c.accent : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: m.done ? '#fff' : c.textMuted }}>{m.done ? '✓' : m.label}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/sparkplan')}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '9px 18px', cursor: 'pointer' }}>
                    Continue →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0 }}>No spark plan yet.</p>
                <button onClick={() => navigate('/sparkplan')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '9px 18px', cursor: 'pointer' }}>
                  Generate plan →
                </button>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div style={card()}>
            <p style={lbl()}>Quick actions</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {quickActions.map(action => (
                <button key={action.path} onClick={() => navigate(action.path)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 10px', borderRadius: 12, border: `1px solid ${c.border}`, background: c.bgMid, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = `${action.color}10` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = c.bgMid }}
                >
                  <span style={{ fontSize: 20 }}>{action.icon}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: c.textMuted, textAlign: 'center', lineHeight: 1.3 }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* REALITY CHECK SCORE */}
          <div style={card()}>
            <p style={lbl()}>Reality check score</p>
            {realityCheck ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                    <circle cx="32" cy="32" r="24" fill="none" stroke={`${scoreColor(realityCheck.overall_score)}20`} strokeWidth="6" />
                    <circle cx="32" cy="32" r="24" fill="none"
                      stroke={scoreColor(realityCheck.overall_score)}
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 24 * realityCheck.overall_score / 100} ${2 * Math.PI * 24}`}
                      strokeLinecap="round"
                      transform="rotate(-90 32 32)"
                    />
                    <text x="32" y="36" textAnchor="middle" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 13, fill: scoreColor(realityCheck.overall_score) }}>{realityCheck.overall_score}</text>
                  </svg>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: c.text, margin: '0 0 4px' }}>{realityCheck.score_label}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{realityCheck.headline}</p>
                  </div>
                </div>
                {realityCheck.this_week_action && (
                  <div style={{ background: `${c.accent}10`, borderRadius: 10, padding: '10px 14px', border: `1px solid ${c.accent}25`, marginBottom: 12 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>🎯 Do this week</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{realityCheck.this_week_action}</p>
                  </div>
                )}
                <button onClick={() => navigate('/realitycheck')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '9px', cursor: 'pointer', width: '100%' }}>
                  View full report →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 14px', lineHeight: 1.6 }}>
                  Get a brutally honest score on where you stand — and what to do next.
                </p>
                <button onClick={() => navigate('/realitycheck')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#722F37', color: '#EEFFBB', border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%' }}>
                  Get reality check →
                </button>
              </>
            )}
          </div>

          {/* GAP METER */}
          <div style={card()}>
            <p style={lbl()}>Gap meter</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 10px', fontWeight: 500 }}>
              Distance between you now and your target role
            </p>
            <div style={{ height: 8, background: `${c.accent}15`, borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${gapScore}%`, background: `linear-gradient(90deg, #722F37, ${c.accent})`, borderRadius: 99, transition: 'width 0.8s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', fontWeight: 600 }}>Where you are</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.accent, fontWeight: 700 }}>{gapScore}% bridged</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.accent, fontWeight: 600 }}>Target role</span>
            </div>
          </div>

          {/* PATH CLARITY */}
          <div style={card()}>
            <p style={lbl()}>Path clarity</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="56" height="56" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                <circle cx="32" cy="32" r="24" fill="none" stroke={`${c.accent}20`} strokeWidth="5" />
                <circle cx="32" cy="32" r="24" fill="none" stroke={c.accent} strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 24 * gapScore / 100} ${2 * Math.PI * 24}`}
                  strokeLinecap="round" transform="rotate(-90 32 32)" />
                <text x="32" y="37" textAnchor="middle" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 12, fill: c.accent }}>{gapScore}%</text>
              </svg>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: c.text, margin: '0 0 4px' }}>
                  {gapScore < 30 ? 'Just starting out' : gapScore < 60 ? 'Building momentum' : gapScore < 85 ? 'Getting clear' : 'Almost there!'}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>
                  {gapScore < 30 ? 'Complete your first features to build clarity.' : gapScore < 60 ? "Keep going — you're making real progress." : "You're close. Push through the last mile."}
                </p>
              </div>
            </div>
          </div>

          {/* STREAK */}
          <div style={card()}>
            <p style={lbl()}>Day streak</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>🔥</span>
              <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: '#FBA002', lineHeight: 1 }}>{user?.streak || 0}</span>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, fontWeight: 500 }}>days in a row</span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: 20, borderRadius: 5, background: `${c.accent}15`, border: `1px solid ${c.border}` }} />
                  <span style={{ fontFamily: 'Inter', fontSize: 9, color: c.textMuted, fontWeight: 600 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NEXT MILESTONE */}
          {plan && (
            <div style={card({ borderLeft: `4px solid #D4A842` })}>
              <p style={lbl('#D4A842')}>Next milestone</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: c.text, margin: '0 0 4px' }}>
                {completedTasks < 9 ? 'Complete Month 1' : completedTasks < 18 ? 'Complete Month 2' : 'Complete Month 3'}
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0, fontWeight: 500 }}>
                {Math.max(0, (completedTasks < 9 ? 9 : completedTasks < 18 ? 18 : 27) - completedTasks)} tasks remaining
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}