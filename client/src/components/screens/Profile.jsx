import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '../../hooks/useIsMobile'

export default function Profile() {
  const { user } = useAuth()
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [futures, setFutures] = useState([])
  const [plan, setPlan] = useState(null)
  const [realityCheck, setRealityCheck] = useState(null)
  const [skills, setSkills] = useState(null)
  const [swot, setSwot] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    axios.get('/api/futures').then(r => setFutures(r.data)).catch(() => {})
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
    axios.get('/api/realitycheck').then(r => setRealityCheck(r.data)).catch(() => {})
    axios.get('/api/skills').then(r => setSkills(r.data)).catch(() => {})
    axios.get('/api/swot').then(r => setSwot(r.data)).catch(() => {})
  }, [])

  const chosenSelf = futures.find(f => f.is_chosen)
  const completedTasks = plan?.tasks?.filter(t => t.completed)?.length || 0
  const totalTasks = plan?.tasks?.length || 27
  const hasSkills = skills && skills.ratings && Object.keys(skills.ratings).length > 0
  const gapAnalysis = skills?.gap_analysis || null

  const sharePassport = () => {
    const url = `${window.location.origin}/passport/${user?.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#0F9E99'
    if (score >= 60) return '#D4A842'
    if (score >= 40) return '#FBA002'
    return '#722F37'
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: isMobile ? '16px' : '24px',
    border: `1px solid ${c.border}`,
    ...extra
  })

  const lbl = (color) => ({
    fontFamily: 'Inter', fontSize: 10,
    color: color || c.textMuted,
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', margin: '0 0 12px'
  })

  const journeyItems = [
    { done: !!chosenSelf }, { done: hasSkills }, { done: !!realityCheck },
    { done: !!swot }, { done: !!plan }, { done: completedTasks > 0 },
  ]
  const completionPct = Math.round((journeyItems.filter(j => j.done).length / journeyItems.length) * 100)

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px 48px', color: c.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 26 : 32, color: c.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            My Mirror
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: isMobile ? 13 : 15, color: c.textMuted, margin: 0, fontWeight: 500 }}>
            Your complete career intelligence picture.
          </p>
        </div>
        <button onClick={sharePassport}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: copied ? '#0F9E99' : c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '10px 20px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
          {copied ? '✓ Copied!' : '🎓 Share passport →'}
        </button>
      </div>

      {/* Hero summary */}
      <div style={{ background: 'linear-gradient(135deg, #1A2118, #0E1512)', borderRadius: 20, padding: isMobile ? '20px 16px' : '28px', marginBottom: 20, border: '1px solid rgba(15,158,153,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: '50%', background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: isMobile ? 16 : 20, color: '#fff', flexShrink: 0 }}>
              {user?.avatar_initials || '?'}
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 18 : 22, color: '#F2E8D1', margin: '0 0 4px' }}>{user?.name}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: 0, fontWeight: 500 }}>
                {chosenSelf ? `Becoming a ${chosenSelf.job_title}` : 'Finding your path'} · {user?.preferred_language || 'English'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: isMobile ? 24 : 32, color: '#0F9E99', margin: '0 0 2px', lineHeight: 1 }}>{completionPct}%</p>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>complete</p>
          </div>
        </div>

        {/* Score cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Reality Check', value: realityCheck?.overall_score ? `${realityCheck.overall_score}/100` : '—', sub: realityCheck?.score_label || 'Not done', color: realityCheck ? scoreColor(realityCheck.overall_score) : c.textMuted, path: '/realitycheck' },
            { label: 'Market Ready', value: gapAnalysis?.readiness_score ? `${gapAnalysis.readiness_score}/100` : '—', sub: gapAnalysis?.readiness_label || 'Not assessed', color: gapAnalysis ? scoreColor(gapAnalysis.readiness_score) : c.textMuted, path: '/skills' },
            { label: 'Spark Plan', value: plan ? `${completedTasks}/${totalTasks}` : '—', sub: plan ? 'tasks done' : 'Not started', color: plan ? c.accent : c.textMuted, path: '/sparkplan' },
            { label: 'Resonance', value: chosenSelf ? `${chosenSelf.resonance_score || 0}%` : '—', sub: chosenSelf?.job_title || 'No future self', color: chosenSelf ? '#FBA002' : c.textMuted, path: '/simulate' },
          ].map(s => (
            <div key={s.label} onClick={() => navigate(s.path)}
              style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: isMobile ? '12px' : '16px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: isMobile ? 18 : 22, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 9, color: '#7A6E58', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#5A5050', margin: 0, lineHeight: 1.4 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Journey checklist */}
          <div style={card()}>
            <p style={lbl()}>Journey progress</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { done: true, label: 'Onboarding complete', path: null },
                { done: futures.length > 0, label: 'Future selves generated', path: '/simulate' },
                { done: !!chosenSelf, label: 'Future self chosen', path: '/simulate' },
                { done: hasSkills, label: 'Skills assessed', path: '/skills' },
                { done: !!realityCheck, label: 'Reality Check done', path: '/realitycheck' },
                { done: !!swot, label: 'Career SWOT done', path: '/swot' },
                { done: !!plan, label: 'Spark plan generated', path: '/sparkplan' },
                { done: completedTasks > 0, label: 'First task completed', path: '/sparkplan' },
              ].map((item, i) => (
                <div key={i} onClick={() => !item.done && item.path && navigate(item.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: item.done ? `${c.accent}08` : 'transparent', cursor: !item.done && item.path ? 'pointer' : 'default' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: item.done ? c.accent : 'transparent', border: `2px solid ${item.done ? c.accent : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: item.done ? c.text : c.textMuted, fontWeight: item.done ? 600 : 400, flex: 1 }}>{item.label}</span>
                  {!item.done && item.path && <span style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontStyle: 'italic', fontWeight: 600 }}>Go →</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Gap analysis */}
          {gapAnalysis && (
            <div style={card({ borderLeft: `4px solid #722F37` })}>
              <p style={lbl('#722F37')}>🚨 Critical skill gaps</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {gapAnalysis.critical_gaps?.slice(0, 3).map((gap, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#722F37', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: c.text, margin: '0 0 1px' }}>{gap.skill}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.textMuted, margin: 0 }}>⏱ {gap.time_to_learn}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/skills')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: '#722F37', border: `1.5px solid #722F37`, borderRadius: 99, padding: '8px', cursor: 'pointer', width: '100%' }}>
                View full gap analysis →
              </button>
            </div>
          )}

          {/* Passport banner */}
          <div onClick={() => navigate(`/passport/${user?.id}`)}
            style={{ background: 'linear-gradient(135deg, #1A2118, #0E1512)', borderRadius: 16, padding: isMobile ? '16px' : '20px 24px', border: '1px solid rgba(15,158,153,0.3)', cursor: 'pointer' }}>
            <p style={lbl('#0F9E99')}>🎓 Employability Passport</p>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: '0 0 12px', lineHeight: 1.6 }}>
              Share with employers — shows your career readiness and target role.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={e => { e.stopPropagation(); sharePassport() }}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: '#0F9E99', color: '#fff', border: 'none', borderRadius: 99, padding: '8px 16px', cursor: 'pointer', flex: 1 }}>
                {copied ? '✓ Copied!' : 'Copy link →'}
              </button>
              <button onClick={() => navigate(`/passport/${user?.id}`)}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: '#0F9E99', border: `1.5px solid rgba(15,158,153,0.4)`, borderRadius: 99, padding: '8px 16px', cursor: 'pointer' }}>
                View →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Future self */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: isMobile ? '16px' : '24px', border: '1px solid rgba(251,160,2,0.2)' }}>
            <p style={lbl('#FBA002')}>Your chosen future self</p>
            {chosenSelf ? (
              <>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 17 : 20, color: '#FBA002', margin: '0 0 4px' }}>{chosenSelf.job_title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', margin: '0 0 14px', fontWeight: 500 }}>{chosenSelf.company_type} · {chosenSelf.city} · {chosenSelf.year}</p>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resonance</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700 }}>{chosenSelf.resonance_score || 0}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(251,160,2,0.15)', borderRadius: 99 }}>
                    <div style={{ height: 4, width: `${chosenSelf.resonance_score || 0}%`, background: '#FBA002', borderRadius: 99 }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 12, color: '#F2E8D1', margin: '0 0 14px', lineHeight: 1.7, borderLeft: '2px solid rgba(251,160,2,0.4)', paddingLeft: 12 }}>
                  "{chosenSelf.intro_quote}"
                </p>
                <button onClick={() => navigate('/simulate')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%' }}>
                  Chat with future self →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: '0 0 12px', lineHeight: 1.6 }}>No future self chosen yet.</p>
                <button onClick={() => navigate('/simulate')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer', width: '100%' }}>
                  Meet your future self →
                </button>
              </>
            )}
          </div>

          {/* SWOT snapshot */}
          {swot && (
            <div style={card()}>
              <p style={lbl()}>Career SWOT snapshot</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Strengths', items: swot.strengths?.slice(0, 2), color: '#0F9E99' },
                  { label: 'Weaknesses', items: swot.weaknesses?.slice(0, 2), color: '#722F37' },
                  { label: 'Opportunities', items: swot.opportunities?.slice(0, 2), color: '#FBA002' },
                  { label: 'Threats', items: swot.threats?.slice(0, 2), color: '#615091' },
                ].map(q => (
                  <div key={q.label} style={{ background: c.bgMid, borderRadius: 10, padding: '10px', border: `1px solid ${c.border}` }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 9, color: q.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>{q.label}</p>
                    {q.items?.map((item, i) => (
                      <p key={i} style={{ fontFamily: 'Inter', fontSize: 10, color: c.text, margin: '0 0 2px', lineHeight: 1.4 }}>· {item.title}</p>
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/swot')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '8px', cursor: 'pointer', width: '100%' }}>
                View full SWOT →
              </button>
            </div>
          )}

          {/* Reality check */}
          {realityCheck && (
            <div style={card()}>
              <p style={lbl()}>Reality check</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${scoreColor(realityCheck.overall_score)}15`, border: `3px solid ${scoreColor(realityCheck.overall_score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 14, color: scoreColor(realityCheck.overall_score) }}>{realityCheck.overall_score}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: c.text, margin: '0 0 3px' }}>{realityCheck.score_label}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: 0, lineHeight: 1.4 }}>{realityCheck.biggest_gap}</p>
                </div>
              </div>
              <button onClick={() => navigate('/realitycheck')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '8px', cursor: 'pointer', width: '100%' }}>
                View full report →
              </button>
            </div>
          )}

          {/* Spark plan */}
          <div style={card()}>
            <p style={lbl()}>Spark plan</p>
            {plan ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 26, color: c.accent }}>{completedTasks}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted }}>of {totalTasks} tasks</span>
                </div>
                <div style={{ height: 5, background: `${c.accent}15`, borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completedTasks / totalTasks) * 100}%`, background: c.accent, borderRadius: 99 }} />
                </div>
                <button onClick={() => navigate('/sparkplan')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '8px', cursor: 'pointer', width: '100%' }}>
                  Continue →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: '0 0 10px' }}>No spark plan yet.</p>
                <button onClick={() => navigate('/sparkplan')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '9px', cursor: 'pointer', width: '100%' }}>
                  Generate →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}