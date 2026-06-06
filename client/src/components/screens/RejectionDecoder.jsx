import { useState } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

const rejectionTypes = [
  { key: 'resume', label: 'Resume Screening', icon: '📄', desc: 'Never heard back after applying' },
  { key: 'phone', label: 'Phone Screen', icon: '📞', desc: 'Got a call but didn\'t move forward' },
  { key: 'interview', label: 'Interview Round', icon: '🎯', desc: 'Interviewed but got rejected' },
  { key: 'assessment', label: 'Assessment/Test', icon: '📝', desc: 'Failed a test or assignment' },
  { key: 'final', label: 'Final Round', icon: '🏁', desc: 'Made it to the end but lost out' },
  { key: 'offer', label: 'Offer Negotiation', icon: '💼', desc: 'Offer was rescinded or fell through' },
]

export default function RejectionDecoder() {
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [rejectionType, setRejectionType] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [rejectionText, setRejectionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyze = async () => {
    if (!rejectionText.trim()) return
    setLoading(true)
    try {
      const r = await axios.post('/api/rejection/analyze', {
        rejection_text: rejectionText,
        rejection_type: rejectionType,
        company,
        role
      })
      setResult(r.data)
      setStep(3)
    } catch (e) {
      alert(e.response?.data?.error || 'Error analyzing rejection')
    } finally { setLoading(false) }
  }

  const reset = () => {
    setStep(1)
    setRejectionType('')
    setCompany('')
    setRole('')
    setRejectionText('')
    setResult(null)
  }

  const impactColor = (impact) => {
    if (impact === 'High') return '#722F37'
    if (impact === 'Medium') return '#FBA002'
    return '#0F9E99'
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
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-heading" style={{ fontSize: 32, color: c.text, marginBottom: 8 }}>
          Rejection Decoder
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
          Got rejected? Good. Let's find out the REAL reason — and fix it before your next application.
        </p>
      </div>

      {/* STEP 1 — What type */}
      {step === 1 && (
        <div style={{ maxWidth: 700 }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: c.text, marginBottom: 20 }}>
            Where in the process were you rejected?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {rejectionTypes.map(t => (
              <button key={t.key} onClick={() => setRejectionType(t.key)}
                style={{ background: rejectionType === t.key ? `${c.accent}15` : c.bgCard, border: `1.5px solid ${rejectionType === t.key ? c.accent : c.border}`, borderRadius: 14, padding: '18px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{t.icon}</span>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: rejectionType === t.key ? c.accent : c.text, margin: '0 0 4px' }}>{t.label}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: 0 }}>{t.desc}</p>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: c.text, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company (optional)</label>
              <input value={company} onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Infosys, Google, Zomato..."
                style={{ width: '100%', height: 44, borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '0 14px', fontSize: 14, fontFamily: 'Inter', background: c.bgCard, color: c.text, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = c.accent}
                onBlur={e => e.target.style.borderColor = c.border}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: c.text, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role applied for</label>
              <input value={role} onChange={e => setRole(e.target.value)}
                placeholder="e.g. Marketing Intern, SDE, Data Analyst..."
                style={{ width: '100%', height: 44, borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '0 14px', fontSize: 14, fontFamily: 'Inter', background: c.bgCard, color: c.text, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = c.accent}
                onBlur={e => e.target.style.borderColor = c.border}
              />
            </div>
          </div>

          <button onClick={() => setStep(2)} disabled={!rejectionType}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', opacity: !rejectionType ? 0.5 : 1 }}>
            Next — tell me what happened →
          </button>
        </div>
      )}

      {/* STEP 2 — What happened */}
      {step === 2 && (
        <div style={{ maxWidth: 700 }}>
          <button onClick={() => setStep(1)}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, display: 'block' }}>
            ← Back
          </button>

          <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>What you can share</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { icon: '📧', label: 'Paste rejection email', desc: 'Copy and paste the email you received' },
                { icon: '💬', label: 'Describe what happened', desc: 'Write what happened in your own words' },
                { icon: '📋', label: 'Share interview feedback', desc: 'Any feedback you received verbally' },
              ].map(opt => (
                <div key={opt.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{opt.icon}</span>
                  <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#F2E8D1', margin: '0 0 2px' }}>{opt.label}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#7A6E58', margin: 0 }}>{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: c.text, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              What happened? Paste the email or describe it:
            </label>
            <textarea
              value={rejectionText}
              onChange={e => setRejectionText(e.target.value)}
              placeholder={`e.g. "Thank you for your interest in the Marketing Intern position at XYZ. After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs..."\n\nOr just describe: "I applied, got a screening call, but they said I wasn't a good fit without explaining why."`}
              rows={10}
              style={{ width: '100%', borderRadius: 14, border: `1.5px solid ${c.border}`, padding: '16px', fontSize: 14, fontFamily: 'Inter', background: c.bgCard, color: c.text, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = c.accent}
              onBlur={e => e.target.style.borderColor = c.border}
            />
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: '6px 0 0', fontWeight: 500 }}>
              The more detail you share, the more accurate the analysis.
            </p>
          </div>

          <button onClick={analyze} disabled={loading || !rejectionText.trim()}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#722F37', color: '#EEFFBB', border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer', opacity: loading || !rejectionText.trim() ? 0.7 : 1 }}>
            {loading ? 'Analyzing your rejection...' : 'Decode my rejection →'}
          </button>
        </div>
      )}

      {/* STEP 3 — Results */}
      {step === 3 && result && (
        <div>
          {/* Stage badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#722F37', background: 'rgba(114,47,55,0.1)', padding: '6px 16px', borderRadius: 99, fontWeight: 700, border: '1px solid rgba(114,47,55,0.2)' }}>
              Rejected at: {result.rejection_stage}
            </span>
            {company && <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, fontWeight: 500 }}>{company} · {role}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Real reason */}
              <div style={{ background: '#1A0A0A', borderRadius: 16, padding: '24px', border: '1px solid rgba(114,47,55,0.3)' }}>
                <p style={lbl('#722F37')}>🔍 The real reason you were rejected</p>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, color: '#F2E8D1', margin: '0 0 16px', lineHeight: 1.6 }}>
                  {result.real_reason}
                </p>
                {result.what_they_said_vs_reality && (
                  <div style={{ background: 'rgba(114,47,55,0.1)', borderRadius: 10, padding: '14px', border: '1px solid rgba(114,47,55,0.15)' }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>What they said vs what they meant</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#B5A98A', margin: 0, lineHeight: 1.6 }}>{result.what_they_said_vs_reality}</p>
                  </div>
                )}
              </div>

              {/* Pattern warning */}
              {result.pattern_warning && (
                <div style={card({ borderLeft: `4px solid #FBA002` })}>
                  <p style={lbl('#FBA002')}>⚠️ Pattern warning</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.6 }}>{result.pattern_warning}</p>
                </div>
              )}

              {/* Top 3 fixes */}
              <div style={card()}>
                <p style={lbl()}>Top 3 fixes — ranked by impact</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {result.top_3_fixes?.map((fix, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: i < 2 ? `1px solid ${c.border}` : 'none', alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${impactColor(fix.impact)}15`, border: `1.5px solid ${impactColor(fix.impact)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 13, color: impactColor(fix.impact) }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: c.text, margin: '0 0 4px', lineHeight: 1.4 }}>{fix.fix}</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted }}>{fix.timeline}</span>
                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: impactColor(fix.impact), fontWeight: 700, background: `${impactColor(fix.impact)}15`, padding: '2px 8px', borderRadius: 99 }}>{fix.impact} impact</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next application checklist */}
              {result.next_application_checklist && (
                <div style={card()}>
                  <p style={lbl('#0F9E99')}>✅ Before your next application</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.next_application_checklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: c.bgMid, borderRadius: 10, border: `0.5px solid ${c.border}` }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${c.accent}`, flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Brutal truth */}
              <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(251,160,2,0.2)' }}>
                <p style={lbl('#FBA002')}>💥 Brutal truth</p>
                <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>
                  "{result.brutal_truth}"
                </p>
              </div>

              {/* Silver lining */}
              <div style={card({ borderTop: `3px solid #0F9E99` })}>
                <p style={lbl('#0F9E99')}>🌱 Silver lining</p>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.7 }}>
                  {result.silver_lining}
                </p>
              </div>

              {/* Actions */}
              <div style={card()}>
                <p style={lbl()}>What to do now</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => navigate('/skills')}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '11px', cursor: 'pointer', width: '100%' }}>
                    Assess my skills →
                  </button>
                  <button onClick={() => navigate('/realitycheck')}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.accent, border: `1.5px solid ${c.accent}`, borderRadius: 99, padding: '11px', cursor: 'pointer', width: '100%' }}>
                    Get reality check →
                  </button>
                  <button onClick={() => navigate('/swot')}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '11px', cursor: 'pointer', width: '100%' }}>
                    Career SWOT →
                  </button>
                  <button onClick={reset}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '11px', cursor: 'pointer', width: '100%' }}>
                    Decode another rejection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}