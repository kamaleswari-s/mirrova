import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function CareerSWOT() {
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeQuadrant, setActiveQuadrant] = useState(null)
  const [view, setView] = useState('swot') // swot or report

  useEffect(() => {
    axios.get('/api/swot')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const r = await axios.post('/api/swot/generate')
      setData(r.data)
      setActiveQuadrant(null)
    } catch (e) {
      alert(e.response?.data?.error || 'Error generating SWOT')
    } finally { setLoading(false) }
  }

  const quadrants = data ? [
    {
      key: 'strengths',
      label: 'Strengths',
      icon: '💪',
      color: '#0F9E99',
      bg: 'rgba(15,158,153,0.08)',
      border: 'rgba(15,158,153,0.25)',
      items: data.strengths || [],
      subtitle: 'What you have going for you',
      detailKey: 'career_impact',
      detailLabel: 'Career impact'
    },
    {
      key: 'weaknesses',
      label: 'Weaknesses',
      icon: '⚠️',
      color: '#722F37',
      bg: 'rgba(114,47,55,0.08)',
      border: 'rgba(114,47,55,0.25)',
      items: data.weaknesses || [],
      subtitle: 'What needs work',
      detailKey: 'fix',
      detailLabel: 'How to fix'
    },
    {
      key: 'opportunities',
      label: 'Opportunities',
      icon: '🚀',
      color: '#FBA002',
      bg: 'rgba(251,160,2,0.08)',
      border: 'rgba(251,160,2,0.25)',
      items: data.opportunities || [],
      subtitle: 'What you can capitalize on',
      detailKey: 'how_to_seize',
      detailLabel: 'How to seize it'
    },
    {
      key: 'threats',
      label: 'Threats',
      icon: '🛡️',
      color: '#615091',
      bg: 'rgba(97,80,145,0.08)',
      border: 'rgba(97,80,145,0.25)',
      items: data.threats || [],
      subtitle: 'What to watch out for',
      detailKey: 'mitigation',
      detailLabel: 'How to protect yourself'
    },
  ] : []

  const activeQ = quadrants.find(q => q.key === activeQuadrant)

  if (fetching) return (
    <div style={{ padding: '80px 48px', textAlign: 'center', color: c.textMuted, fontFamily: 'Inter' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ padding: '40px 48px', color: c.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 className="page-heading" style={{ fontSize: 32, color: c.text, marginBottom: 8 }}>
            Career SWOT
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
            Your personal career intelligence report — strengths, weaknesses, opportunities and threats.
          </p>
        </div>
        {data && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: c.bgCard, borderRadius: 99, padding: 4, border: `1px solid ${c.border}` }}>
              {['swot', 'report'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', background: view === v ? c.accent : 'transparent', color: view === v ? '#fff' : c.textMuted, transition: 'all 0.15s' }}>
                  {v === 'swot' ? '⊞ SWOT Grid' : '📋 Full Report'}
                </button>
              ))}
            </div>
            <button onClick={generate} disabled={loading}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '10px 20px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        )}
      </div>

      {!data ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>⊞</div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: c.text, margin: '0 0 12px' }}>
            Understand your full career picture
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: '0 auto 16px', maxWidth: 520, lineHeight: 1.7, fontWeight: 500 }}>
            Mirrova analyzes everything about you — your skills, goals, fears, market data — and generates a personal Career SWOT with a detailed action report.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 36 }}>
            {[
              { icon: '💪', label: 'Strengths', desc: 'What you have going for you' },
              { icon: '⚠️', label: 'Weaknesses', desc: 'What needs work' },
              { icon: '🚀', label: 'Opportunities', desc: 'What to capitalize on' },
              { icon: '🛡️', label: 'Threats', desc: 'What to watch out for' },
            ].map(q => (
              <div key={q.label} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>{q.icon}</span>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: c.text, margin: '0 0 2px' }}>{q.label}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: 0 }}>{q.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '14px 40px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Analyzing your profile...' : 'Generate my Career SWOT →'}
          </button>
        </div>
      ) : view === 'swot' ? (
        /* SWOT GRID VIEW */
        <div>
          {/* Summary */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: '20px 24px', marginBottom: 24, border: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Career position summary</p>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.7, fontWeight: 500 }}>{data.summary}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 24, borderRadius: 20, overflow: 'hidden', border: `1px solid ${c.border}` }}>
            {quadrants.map((q, i) => (
              <div key={q.key}
                onClick={() => setActiveQuadrant(activeQuadrant === q.key ? null : q.key)}
                style={{
                  background: activeQuadrant === q.key ? q.bg : c.bgCard,
                  padding: '24px',
                  cursor: 'pointer',
                  borderRight: i % 2 === 0 ? `1px solid ${c.border}` : 'none',
                  borderBottom: i < 2 ? `1px solid ${c.border}` : 'none',
                  transition: 'background 0.2s',
                  minHeight: 200,
                }}>

                {/* Quadrant header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{q.icon}</span>
                    <div>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: q.color, margin: 0 }}>{q.label}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: 0 }}>{q.subtitle}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'Inter', fontSize: 20, color: c.textMuted }}>{activeQuadrant === q.key ? '▲' : '▼'}</span>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {q.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: q.color, flexShrink: 0, marginTop: 6 }} />
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Expanded quadrant detail */}
          {activeQ && (
            <div style={{ background: activeQ.bg, borderRadius: 16, padding: '24px', border: `1.5px solid ${activeQ.border}`, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 24 }}>{activeQ.icon}</span>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: activeQ.color, margin: 0 }}>{activeQ.label} — Deep Dive</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {activeQ.items.map((item, idx) => (
                  <div key={idx} style={{ background: c.bgCard, borderRadius: 14, padding: '16px 18px', border: `1px solid ${activeQ.border}` }}>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: activeQ.color, margin: '0 0 6px' }}>{item.title}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: '0 0 10px', lineHeight: 1.6 }}>{item.description}</p>
                    {item[activeQ.detailKey] && (
                      <div style={{ background: `${activeQ.color}10`, borderRadius: 8, padding: '8px 12px', borderLeft: `3px solid ${activeQ.color}` }}>
                        <p style={{ fontFamily: 'Inter', fontSize: 10, color: activeQ.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>{activeQ.detailLabel}</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.text, margin: 0, lineHeight: 1.5 }}>{item[activeQ.detailKey]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic recommendation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: c.bgCard, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}`, borderTop: `3px solid ${c.accent}` }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Strategic recommendation</p>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.7, fontWeight: 500 }}>{data.strategic_recommendation}</p>
            </div>
            <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(251,160,2,0.2)', borderTop: '3px solid #FBA002' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>🎯 Do this in the next 7 days</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>{data.immediate_action}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setView('report')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              View full report →
            </button>
            <button onClick={() => navigate('/sparkplan')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              Build spark plan →
            </button>
          </div>
        </div>
      ) : (
        /* FULL REPORT VIEW */
        <div style={{ maxWidth: 860 }}>
          <div style={{ background: '#1A2118', borderRadius: 20, padding: '32px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Career Intelligence Report</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F2E8D1', margin: '0 0 12px' }}>Your Complete Career SWOT Analysis</p>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#B5A98A', margin: 0, lineHeight: 1.7 }}>{data.summary}</p>
          </div>

          {quadrants.map((q) => (
            <div key={q.key} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: q.bg, border: `1.5px solid ${q.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {q.icon}
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: q.color, margin: 0 }}>{q.label}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0 }}>{q.subtitle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.items.map((item, idx) => (
                  <div key={idx} style={{ background: c.bgCard, borderRadius: 14, padding: '18px 20px', border: `1px solid ${c.border}`, borderLeft: `3px solid ${q.color}` }}>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: q.color, margin: '0 0 6px' }}>{item.title}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: '0 0 10px', lineHeight: 1.6 }}>{item.description}</p>
                    {item[q.detailKey] && (
                      <div style={{ background: `${q.color}08`, borderRadius: 8, padding: '10px 14px', border: `1px solid ${q.border}` }}>
                        <p style={{ fontFamily: 'Inter', fontSize: 10, color: q.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{q.detailLabel}</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{item[q.detailKey]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Final recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: c.bgCard, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}`, borderTop: `3px solid ${c.accent}` }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Strategic recommendation</p>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.7 }}>{data.strategic_recommendation}</p>
            </div>
            <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(251,160,2,0.2)', borderTop: '3px solid #FBA002' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>🎯 Immediate action</p>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>{data.immediate_action}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setView('swot')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              ← Back to SWOT grid
            </button>
            <button onClick={() => navigate('/sparkplan')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              Build spark plan →
            </button>
            <button onClick={() => navigate('/realitycheck')}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              Reality Check →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}