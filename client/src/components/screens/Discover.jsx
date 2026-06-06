import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export default function Discover() {
  const { colors: c } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0=questions, 1=loading, 2=results
  const [answers, setAnswers] = useState({ time_flies: '', people_ask: '', life_vision: '' })
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const questions = [
    {
      key: 'time_flies',
      q: "What activities make time disappear for you?",
      sub: "When you're doing this, you forget to eat, forget to check your phone.",
      ph: "e.g. Explaining things to people, designing stuff, solving puzzles, writing, organising events, coding, cooking..."
    },
    {
      key: 'people_ask',
      q: "What do people come to you for help with?",
      sub: "Friends, family, classmates — what do they naturally ask you?",
      ph: "e.g. Tech problems, relationship advice, creative ideas, planning, maths, writing..."
    },
    {
      key: 'life_vision',
      q: "What kind of life do you want?",
      sub: "Not a job title — a feeling. What matters most to you?",
      ph: "e.g. I want financial security, I want to create things people use, I want to travel, I want to help people, I want to be my own boss..."
    },
  ]

  const discover = async () => {
    setStep(1)
    try {
      const r = await axios.post('/api/onboarding/discover', {
        ...answers,
        language: user?.preferred_language || 'English'
      })
      setResult(r.data)
      setStep(2)
    } catch (e) {
      alert('Error generating directions. Please try again.')
      setStep(0)
    }
  }

  const chooseDirection = async (direction) => {
    setSaving(true)
    try {
      // Save this as their dream direction
      await axios.post('/api/onboarding/save', {
        dream_direction: direction.title,
        preferred_language: user?.preferred_language || 'English'
      })
      navigate('/simulate')
    } catch (e) {
      alert('Error saving. Please try again.')
    } finally { setSaving(false) }
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: '24px',
    border: `1px solid ${c.border}`,
    ...extra
  })

  // QUESTIONS
  if (step === 0) return (
    <div style={{ padding: '40px 48px', color: c.text, maxWidth: 680 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-heading" style={{ fontSize: 32, color: c.text, marginBottom: 8 }}>
          Let's find your direction. 🧭
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
          Not knowing what you want is completely normal. Answer 3 honest questions and Mirrova will suggest 3 paths that actually fit you.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
        {questions.map((q, i) => (
          <div key={q.key} style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c.accent}15`, border: `1.5px solid ${c.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 12, color: c.accent }}>{i + 1}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: c.text, margin: 0 }}>{q.q}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0 }}>{q.sub}</p>
              </div>
            </div>
            <textarea
              value={answers[q.key]}
              onChange={e => setAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
              placeholder={q.ph}
              rows={3}
              style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '12px 14px', fontSize: 14, fontFamily: 'Inter', background: c.bgMid, color: c.text, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = c.accent}
              onBlur={e => e.target.style.borderColor = c.border}
            />
          </div>
        ))}
      </div>

      <button
        onClick={discover}
        disabled={!answers.time_flies.trim() || !answers.people_ask.trim() || !answers.life_vision.trim()}
        style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer', opacity: !answers.time_flies.trim() || !answers.people_ask.trim() || !answers.life_vision.trim() ? 0.5 : 1 }}>
        Find my direction →
      </button>
    </div>
  )

  // LOADING
  if (step === 1) return (
    <div style={{ padding: '80px 48px', textAlign: 'center', color: c.text }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>🧭</div>
      <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: c.text, margin: '0 0 8px' }}>Mirrova is thinking...</p>
      <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.textMuted, margin: 0, lineHeight: 1.6 }}>
        Finding 3 directions that actually fit who you are.
      </p>
    </div>
  )

  // RESULTS
  return (
    <div style={{ padding: '40px 48px', color: c.text, maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-heading" style={{ fontSize: 32, color: c.text, marginBottom: 8 }}>
          Here are your 3 directions. 🎯
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
          Based on what makes you tick. Pick the one that excites you most — not the one that sounds safe.
        </p>
      </div>

      {/* Insight */}
      {result?.insight && (
        <div style={{ background: '#1A2118', borderRadius: 16, padding: '20px 24px', marginBottom: 24, border: '1px solid rgba(15,158,153,0.2)' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>💡 Mirrova's insight about you</p>
          <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>"{result.insight}"</p>
        </div>
      )}

      {/* Direction cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {result?.directions?.map((dir, i) => (
          <div key={i}
            onClick={() => setSelected(i)}
            style={{ background: selected === i ? `${c.accent}10` : c.bgCard, borderRadius: 16, padding: '20px 24px', border: `1.5px solid ${selected === i ? c.accent : c.border}`, cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: selected === i ? c.accent : `${c.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 12, color: selected === i ? '#fff' : c.accent }}>{i + 1}</span>
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: selected === i ? c.accent : c.text, margin: 0 }}>{dir.title}</p>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === i ? c.accent : c.border}`, background: selected === i ? c.accent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected === i && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
            </div>

            <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: '0 0 10px', lineHeight: 1.6 }}>{dir.why}</p>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: c.bgMid, borderRadius: 10, padding: '10px 12px', border: `1px solid ${c.border}` }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>📊 Market</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{dir.market}</p>
              </div>
              <div style={{ flex: 1, background: c.bgMid, borderRadius: 10, padding: '10px 12px', border: `1px solid ${c.border}` }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>🎯 First step</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{dir.first_step}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => chooseDirection(result.directions[selected])}
          disabled={selected === null || saving}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', opacity: selected === null || saving ? 0.5 : 1 }}>
          {saving ? 'Saving...' : 'This is my direction → Meet my future self'}
        </button>
        <button onClick={() => { setStep(0); setResult(null); setSelected(null) }}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '13px 24px', cursor: 'pointer' }}>
          ← Try again
        </button>
      </div>
    </div>
  )
}