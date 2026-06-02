import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { THEMES } from '../../context/ThemeContext'

const questions = [
  { key: 'current_field', q: "What are you currently studying or working in?", ph: "e.g. Computer Science, B.Com, Mechanical Engineering..." },
  { key: 'dream_direction', q: "What do you actually want to do? Be honest.", ph: "e.g. I want to work in UX design, start a business, become a filmmaker..." },
  { key: 'top_skill', q: "What's one thing you're genuinely good at?", ph: "e.g. I'm really good at explaining complex things simply..." },
  { key: 'biggest_fear', q: "What scares you most about your future?", ph: "e.g. Wasting my degree, not getting placed, disappointing my parents..." },
  { key: 'recent_rejection', q: "Have you faced rejection recently? Tell me what happened.", ph: "e.g. I got rejected from 3 internships... (or skip if not applicable)" },
  { key: 'success_vision', q: "What does success look like to you in 5 years?", ph: "e.g. I want to be working on products I care about, earning well, feeling proud..." },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('ivory')
  const [loading, setLoading] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const handleNext = () => {
    if (!current.trim() && questions[step].key !== 'recent_rejection') return
    const newAnswers = { ...answers, [questions[step].key]: current }
    setAnswers(newAnswers)
    setCurrent('')
    if (step < questions.length - 1) {
      setStep(s => s + 1)
    } else {
      setShowTheme(true)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await axios.post('/api/onboarding/save', answers)
      await axios.patch('/api/auth/theme', { theme: selectedTheme })
      updateUser({ theme: selectedTheme, onboarding_complete: true })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const q = questions[step]

  if (showTheme) return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <span className="wordmark" style={{ fontSize: 28, color: '#1A2118' }}>mirrova</span>
        <h2 className="page-heading" style={{ fontSize: 28, color: '#1A2118', margin: '24px 0 8px' }}>One last thing.</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#4A4A4A', marginBottom: 36 }}>Pick your vibe — you can always change it.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setSelectedTheme(key)} style={{
              width: 90, height: 90, borderRadius: 16,
              background: t.bg, border: selectedTheme === key ? '3px solid #0F9E99' : '2px solid rgba(0,0,0,0.1)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <span style={{ fontFamily: 'Fraunces', fontWeight: 900, fontSize: 16, color: t.text }}>M</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: t.text, opacity: 0.7 }}>{key}</span>
            </button>
          ))}
        </div>
        <button className="btn-teal" onClick={handleFinish} disabled={loading} style={{ fontSize: 16, padding: '14px 40px', width: '100%' }}>
          {loading ? 'Setting up your Mirrova...' : 'Enter Mirrova →'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <span className="wordmark" style={{ fontSize: 24, color: '#1A2118', display: 'block', marginBottom: 32 }}>mirrova</span>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ height: 4, flex: 1, borderRadius: 99, background: i <= step ? '#0F9E99' : 'rgba(26,33,24,0.15)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Previous answers */}
        {Object.entries(answers).map(([key, val], i) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0F9E99', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 12, color: '#EFE9E0' }}>M</div>
              <div style={{ background: '#1A2118', color: '#F2E8D1', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, maxWidth: '80%' }}>{questions[i]?.q}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: '#615091', color: '#FFFACF', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', fontFamily: 'Inter', fontSize: 14, maxWidth: '80%' }}>{val}</div>
            </div>
          </div>
        ))}

        {/* Current question */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0F9E99', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 12, color: '#EFE9E0' }}>M</div>
          <div style={{ background: '#1A2118', color: '#F2E8D1', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 15, maxWidth: '80%' }}>{q.q}</div>
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            value={current}
            onChange={e => setCurrent(e.target.value)}
            placeholder={q.ph}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext() } }}
            style={{ flex: 1, minHeight: 52, borderRadius: 12, border: '1px solid rgba(26,33,24,0.2)', padding: '14px 16px', fontSize: 14, fontFamily: 'Inter', resize: 'none', outline: 'none', background: '#fff', color: '#1A2118' }}
            rows={2}
            autoFocus
          />
          <button onClick={handleNext} className="btn-teal" style={{ alignSelf: 'flex-end', padding: '14px 20px' }}>
            {step === questions.length - 1 ? 'Done →' : 'Next →'}
          </button>
        </div>
        {q.key === 'recent_rejection' && (
          <button onClick={handleNext} style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 13, color: '#4A4A4A', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10 }}>Skip this one →</button>
        )}
      </div>
    </div>
  )
}