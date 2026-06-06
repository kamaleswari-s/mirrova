import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

const categoryColors = {
  'Technical': '#0F9E99',
  'Soft Skills': '#615091',
  'Tools': '#FBA002',
  'Industry Knowledge': '#722F37',
}

export default function SkillsAssessment() {
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [ratings, setRatings] = useState({})
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [gapAnalysis, setGapAnalysis] = useState(null)
  const [analyzingGaps, setAnalyzingGaps] = useState(false)

  useEffect(() => {
    axios.get('/api/skills').then(r => {
      if (r.data) {
        setSkills(r.data.skills || [])
        setRatings(r.data.ratings || {})
        if (r.data.gap_analysis) setGapAnalysis(r.data.gap_analysis)
      }
    }).catch(() => {})
    .finally(() => setFetching(false))
  }, [])

  const generateSkills = async () => {
    setGenerating(true)
    try {
      const r = await axios.post('/api/skills/generate')
      setSkills(r.data)
      setRatings({})
      setGapAnalysis(null)
    } catch (e) {
      alert('Error generating skills')
    } finally { setGenerating(false) }
  }

  const saveAssessment = async () => {
    setLoading(true)
    try {
      await axios.post('/api/skills/assess', { skills: { skills, ratings } })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Auto generate gap analysis after saving
      generateGapAnalysis()
    } catch (e) {
      alert('Error saving')
    } finally { setLoading(false) }
  }

  const generateGapAnalysis = async () => {
    setAnalyzingGaps(true)
    try {
      const r = await axios.post('/api/skills/gap-analysis', { skills, ratings })
      setGapAnalysis(r.data)
    } catch (e) {
      console.error('Gap analysis error:', e)
    } finally { setAnalyzingGaps(false) }
  }

  const ratingLabels = ['Never tried', 'Beginner', 'Familiar', 'Confident', 'Expert']
  const ratingColors = ['#8A8A8A', '#722F37', '#FBA002', '#0F9E99', '#38683D']

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  const completedCount = Object.keys(ratings).length
  const totalCount = skills.length

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
    letterSpacing: '0.1em', margin: '0 0 12px'
  })

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
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: c.text, margin: '0 0 8px' }}>
            Skills Assessment
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
            Rate yourself honestly. This feeds directly into your Reality Check score and Gap Analysis.
          </p>
        </div>
        {skills.length > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {completedCount > 0 && (
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.accent, fontWeight: 600 }}>
                {completedCount}/{totalCount} rated
              </span>
            )}
            <button onClick={saveAssessment} disabled={loading || completedCount === 0}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '11px 24px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save & analyse gaps →'}
            </button>
          </div>
        )}
      </div>

      {skills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🎯</div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: c.text, margin: '0 0 12px' }}>
            Know where you actually stand
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: '0 auto 32px', maxWidth: 480, lineHeight: 1.7, fontWeight: 500 }}>
            Mirrova generates a personalised skills list based on your current field and dream direction. Rate yourself honestly — no one else sees this.
          </p>
          <button onClick={generateSkills} disabled={generating}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '14px 40px', cursor: 'pointer', opacity: generating ? 0.7 : 1 }}>
            {generating ? 'Generating your skills list...' : 'Generate my skills assessment →'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gapAnalysis ? '1fr 340px' : '1fr', gap: 24 }}>

          {/* LEFT — Skills */}
          <div>
            {/* Progress bar */}
            {totalCount > 0 && (
              <div style={{ background: c.bgCard, borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, fontWeight: 600 }}>Assessment progress</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.accent, fontWeight: 700 }}>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <div style={{ height: 6, background: `${c.accent}20`, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completedCount / totalCount) * 100}%`, background: c.accent, borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Skills by category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(grouped).map(([category, categorySkills]) => (
                <div key={category}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: categoryColors[category] || c.accent }} />
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: categoryColors[category] || c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                      {category}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {categorySkills.map((skill, idx) => {
                      const rating = ratings[skill.skill] || 0
                      return (
                        <div key={idx} style={{ background: c.bgCard, borderRadius: 14, padding: '16px 20px', border: `1px solid ${rating > 0 ? (categoryColors[category] || c.accent) + '40' : c.border}`, transition: 'border 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: c.text }}>{skill.skill}</span>
                              <span style={{ fontFamily: 'Inter', fontSize: 10, color: skill.importance === 'Critical' ? '#722F37' : skill.importance === 'Important' ? '#FBA002' : c.textMuted, fontWeight: 600, background: skill.importance === 'Critical' ? '#72203715' : skill.importance === 'Important' ? '#FBA00215' : `${c.border}`, padding: '2px 8px', borderRadius: 99 }}>
                                {skill.importance}
                              </span>
                            </div>
                            {rating > 0 && (
                              <span style={{ fontFamily: 'Inter', fontSize: 12, color: ratingColors[rating - 1], fontWeight: 700 }}>
                                {ratingLabels[rating - 1]}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {ratingLabels.map((label, i) => (
                              <button key={i} onClick={() => setRatings(prev => ({ ...prev, [skill.skill]: i + 1 }))}
                                style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${rating === i + 1 ? ratingColors[i] : c.border}`, background: rating === i + 1 ? `${ratingColors[i]}20` : 'transparent', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter', fontSize: 10, color: rating === i + 1 ? ratingColors[i] : c.textMuted, fontWeight: rating === i + 1 ? 700 : 400, textAlign: 'center' }}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={saveAssessment} disabled={loading || completedCount === 0}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', opacity: loading || completedCount === 0 ? 0.6 : 1 }}>
                {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save & analyse gaps →'}
              </button>
              <button onClick={() => navigate('/realitycheck')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '13px 32px', cursor: 'pointer' }}>
                Get Reality Check →
              </button>
              <button onClick={generateSkills} disabled={generating}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1px solid ${c.border}`, borderRadius: 99, padding: '13px 20px', cursor: 'pointer', opacity: generating ? 0.5 : 1 }}>
                {generating ? 'Regenerating...' : 'Regenerate list'}
              </button>
            </div>
          </div>

          {/* RIGHT — Gap Analysis */}
          {(gapAnalysis || analyzingGaps) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {analyzingGaps ? (
                <div style={card({ textAlign: 'center', padding: '40px 24px' })}>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.accent, fontWeight: 600, margin: 0 }}>Analyzing your gaps...</p>
                </div>
              ) : gapAnalysis && (
                <>
                  {/* Overall readiness */}
                  <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={lbl('#0F9E99')}>Market readiness</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(15,158,153,0.2)" strokeWidth="6" />
                        <circle cx="32" cy="32" r="24" fill="none" stroke="#0F9E99" strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 24 * (gapAnalysis.readiness_score || 0) / 100} ${2 * Math.PI * 24}`}
                          strokeLinecap="round" transform="rotate(-90 32 32)" />
                        <text x="32" y="36" textAnchor="middle" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 13, fill: '#0F9E99' }}>{gapAnalysis.readiness_score}</text>
                      </svg>
                      <div>
                        <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: '0 0 4px' }}>{gapAnalysis.readiness_label}</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: 0, lineHeight: 1.5 }}>{gapAnalysis.summary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Critical gaps */}
                  {gapAnalysis.critical_gaps?.length > 0 && (
                    <div style={card()}>
                      <p style={lbl('#722F37')}>🚨 Critical gaps</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {gapAnalysis.critical_gaps.map((gap, i) => (
                          <div key={i} style={{ background: 'rgba(114,47,55,0.08)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(114,47,55,0.2)' }}>
                            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#722F37', margin: '0 0 4px' }}>{gap.skill}</p>
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: '0 0 6px', lineHeight: 1.5 }}>{gap.why_matters}</p>
                            <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.text, margin: 0, fontWeight: 600 }}>⏱ {gap.time_to_learn}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths to leverage */}
                  {gapAnalysis.strengths?.length > 0 && (
                    <div style={card()}>
                      <p style={lbl('#0F9E99')}>💪 Strengths to leverage</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {gapAnalysis.strengths.map((s, i) => (
                          <span key={i} style={{ fontFamily: 'Inter', fontSize: 12, color: '#0F9E99', background: 'rgba(15,158,153,0.1)', padding: '5px 12px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(15,158,153,0.2)' }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Focus order */}
                  {gapAnalysis.learn_in_order?.length > 0 && (
                    <div style={card()}>
                      <p style={lbl('#FBA002')}>📋 Learn in this order</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {gapAnalysis.learn_in_order.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(251,160,2,0.15)', border: '1.5px solid rgba(251,160,2,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 11, color: '#FBA002' }}>{i + 1}</span>
                            </div>
                            <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button onClick={() => navigate('/realitycheck')}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px', cursor: 'pointer', width: '100%' }}>
                    Get my Reality Check now →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}