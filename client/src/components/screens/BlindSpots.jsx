import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

export default function BlindSpots() {
  const { colors } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/api/blindspots').then(r => setData(r.data)).catch(() => {})
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const r = await axios.post('/api/blindspots/generate')
      setData(r.data)
    } catch (e) {
      alert(e.response?.data?.error || 'Error generating report')
    } finally { setLoading(false) }
  }

  const GapRow = ({ item, color }) => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ background: colors.bgCard, borderRadius: 12, padding: '14px 16px', marginBottom: 8, border: `0.5px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: colors.text, margin: 0, flex: 1 }}>{item.skill}</p>
          <span style={{ color: colors.textMuted, fontSize: 14 }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `0.5px solid ${colors.border}` }}>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 10px', lineHeight: 1.6, fontWeight: 500 }}>{item.description}</p>
            {item.fix && (
              <div style={{ background: `${color}18`, borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${color}` }}>
                <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fix it</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{item.fix}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 800, color: colors.text }}>
      <h1 className="page-heading" style={{ fontSize: 32, color: colors.text, marginBottom: 8 }}>Blind Spot Detector</h1>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: colors.textMuted, marginBottom: 32, fontWeight: 500 }}>The invisible gaps silently holding you back — and exactly how to fix them.</p>

      {!data ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 18, color: colors.textMuted, marginBottom: 28 }}>Generate your blind spot report to see what's really holding you back.</p>
          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#722F37', color: '#EEFFBB', border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Analysing your profile...' : 'Detect my blind spots →'}
          </button>
        </div>
      ) : (
        <>
          {/* Recruiter impression */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#FBA002', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>6-second recruiter impression</p>
            <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>"{data.recruiter_impression}"</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Critical gaps</p>
            {data.critical_gaps?.map((g, i) => <GapRow key={i} item={g} color="#722F37" />)}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#FBA002', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Soft gaps</p>
            {data.soft_gaps?.map((g, i) => <GapRow key={i} item={g} color="#FBA002" />)}
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Your strengths</p>
            {data.strengths?.map((g, i) => <GapRow key={i} item={g} color="#0F9E99" />)}
          </div>

          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: '10px 24px', cursor: 'pointer' }}>
            {loading ? 'Regenerating...' : 'Regenerate report'}
          </button>
        </>
      )}
    </div>
  )
}