import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function RealityCheck() {
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    axios.get('/api/realitycheck')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const r = await axios.post('/api/realitycheck/generate')
      setData(r.data)
    } catch (e) {
      alert(e.response?.data?.error || 'Error generating reality check')
    } finally { setLoading(false) }
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#0F9E99'
    if (score >= 60) return '#D4A842'
    if (score >= 40) return '#FBA002'
    return '#722F37'
  }

  const scoreLabel = (score) => {
    if (score >= 80) return 'Strong'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Critical'
  }

  if (fetching) return (
    <div style={{ padding: '80px 48px', textAlign: 'center', color: c.textMuted, fontFamily: 'Inter' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, color: c.text }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: c.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Reality Check
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
          Not a motivation speech. A brutally honest look at where you stand — and exactly what to do next.
        </p>
      </div>

      {!data ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          {/* Illustration */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${c.accent}15`, border: `2px solid ${c.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
            🔍
          </div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: c.text, margin: '0 0 12px' }}>
            Ready for the truth?
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: '0 auto 32px', maxWidth: 480, lineHeight: 1.7, fontWeight: 500 }}>
            We'll analyze your profile against real career data and tell you exactly where you stand — no sugar coating.
          </p>
          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#722F37', color: '#EEFFBB', border: 'none', borderRadius: 99, padding: '14px 40px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Analyzing your profile...' : 'Get my reality check →'}
          </button>
        </div>
      ) : (
        <>
          {/* Overall score */}
          <div style={{ background: '#1A2118', borderRadius: 20, padding: '32px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

              {/* Big score circle */}
              <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={scoreColor(data.overall_score)}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40 * data.overall_score / 100} ${2 * Math.PI * 40}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="45" textAnchor="middle" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 20, fill: scoreColor(data.overall_score) }}>{data.overall_score}</text>
                  <text x="50" y="62" textAnchor="middle" style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}>/100</text>
                </svg>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: scoreColor(data.overall_score), background: `${scoreColor(data.overall_score)}20`, padding: '3px 12px', borderRadius: 99, border: `1px solid ${scoreColor(data.overall_score)}40` }}>
                    {data.score_label || scoreLabel(data.overall_score)}
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: '#F2E8D1', margin: '0 0 8px', lineHeight: 1.3 }}>
                  {data.headline}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', margin: 0, lineHeight: 1.6 }}>
                  {data.market_reality}
                </p>
              </div>
            </div>
          </div>

          {/* 4 dimension bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {data.dimensions?.map((d, i) => (
              <div key={i} style={{ background: c.bgCard, borderRadius: 14, padding: '18px 20px', border: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: c.text }}>{d.label}</span>
                  <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 15, color: scoreColor(d.score) }}>{d.score}</span>
                </div>
                <div style={{ height: 6, background: `${c.accent}15`, borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.score}%`, background: scoreColor(d.score), borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, fontWeight: 500 }}>{d.note}</p>
              </div>
            ))}
          </div>

          {/* 3 insight cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>

            {/* Biggest gap */}
            <div style={{ background: c.bgCard, borderRadius: 14, padding: '20px', border: `1px solid ${c.border}`, borderTop: '3px solid #722F37' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Biggest Gap</p>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{data.biggest_gap}</p>
            </div>

            {/* Hidden strength */}
            <div style={{ background: c.bgCard, borderRadius: 14, padding: '20px', border: `1px solid ${c.border}`, borderTop: `3px solid #0F9E99` }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Hidden Strength</p>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{data.hidden_strength}</p>
            </div>

            {/* Brutal truth */}
            <div style={{ background: '#1A2118', borderRadius: 14, padding: '20px', border: '1px solid rgba(251,160,2,0.2)', borderTop: '3px solid #FBA002' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Brutal Truth</p>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{data.brutal_truth}</p>
            </div>
          </div>

          {/* This week's action */}
          <div style={{ background: c.bgCard, borderRadius: 16, padding: '24px', marginBottom: 20, border: `1.5px solid ${c.accent}40`, borderLeft: `4px solid ${c.accent}` }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
              🎯 Do this one thing this week
            </p>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: c.text, margin: 0, lineHeight: 1.6 }}>
              {data.this_week_action}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/simulate')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              Talk to your future self →
            </button>
            <button onClick={generate} disabled={loading}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Regenerating...' : 'Regenerate →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}