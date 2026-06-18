import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { THEMES } from '../../context/ThemeContext'

const QUESTIONS = [
  {
    key: 'q1',
    text: "What are you studying or working in right now — and how do you honestly feel about it?",
    placeholder: "e.g. I'm in third year CSE but I honestly hate coding and don't know why I'm here..."
  },
  {
    key: 'q2',
    text: "What do you actually want your life to look like? Not what your parents want. What YOU want.",
    placeholder: "e.g. I want to build my own thing, or work somewhere I actually care about..."
  },
  {
    key: 'q3',
    text: "What scares you most about your future right now?",
    placeholder: "e.g. Wasting another year, not getting placed, disappointing my family..."
  },
  {
    key: 'q4',
    text: "Tell me one thing you've done that made you feel genuinely alive — a project, an event, anything.",
    placeholder: "e.g. I built an app for a hackathon and it was the first time I felt proud of something..."
  },
  {
    key: 'q5',
    text: "What's stopping you right now? Be completely honest.",
    placeholder: "e.g. I don't know where to start. My parents want a government job. I don't believe in myself..."
  },
]

export default function Onboarding() {
  const [phase, setPhase] = useState('mode')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState('')
  const [finalDump, setFinalDump] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('ivory')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [questionVisible, setQuestionVisible] = useState(true)
  const [prevAnswers, setPrevAnswers] = useState([])
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (phase === 'questions') {
      setQuestionVisible(false)
      setTimeout(() => setQuestionVisible(true), 50)
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [step, phase])

  const handleNext = () => {
    if (!current.trim()) return
    const newAnswers = [...answers, { q: QUESTIONS[step].text, a: current }]
    setPrevAnswers(prev => [...prev, current])
    setAnswers(newAnswers)
    setCurrent('')

    if (step < QUESTIONS.length - 1) {
      setQuestionVisible(false)
      setTimeout(() => {
        setStep(s => s + 1)
        setQuestionVisible(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }, 300)
    } else {
      setPhase('dump')
    }
  }

  const handleDumpDone = () => {
    const combined = answers.map(a => `${a.q}\n${a.a}`).join('\n\n') +
      (finalDump.trim() ? `\n\nAnything else:\n${finalDump}` : '')
    extractFromText(combined)
  }

  const extractFromText = async (text) => {
    setExtracting(true)
    try {
      const r = await axios.post('/api/onboarding/extract', { text, language: 'English' })
      setExtracted({ ...r.data, heart_dump: text })
      setPhase('align')
    } catch (e) {
      alert('Error reading your story. Please try again.')
    } finally { setExtracting(false) }
  }

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported. Please use Chrome.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + ' '
      }
      setTranscript(full)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const handleFinish = async (profileData) => {
    setLoading(true)
    try {
      await axios.post('/api/onboarding/save', {
        ...profileData,
        preferred_language: 'English',
        heart_dump: profileData.heart_dump || ''
      })
      await axios.patch('/api/auth/theme', { theme: selectedTheme })
      updateUser({ theme: selectedTheme, onboarding_complete: true, preferred_language: 'English' })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  // ── MODE PICKER ──
  if (phase === 'mode') return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F2E8D1', display: 'block', marginBottom: 48 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#F2E8D1', marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Before we build your future —
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#7A6E58', marginBottom: 40, lineHeight: 1.7, fontWeight: 500 }}>
          Tell us about yourself. The more honest you are, the more real your future selves will be.
        </p>

        {/* Privacy note */}
        <div style={{ background: 'rgba(15,158,153,0.06)', border: '1px solid rgba(15,158,153,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 28 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: 0, lineHeight: 1.6 }}>
            🔒 Everything you share stays private. Mirrova uses your story only to personalize your experience — we never share your data.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              key: 'questions',
              icon: '💬',
              title: 'Answer a few questions',
              desc: '5 short questions, one at a time. Takes about 3 minutes. No forms, just a conversation.',
              color: '#0F9E99'
            },
            {
              key: 'voice',
              icon: '🎤',
              title: 'Just speak',
              desc: 'Tap the mic and talk. Tell Mirrova your story in your own words. Speak naturally.',
              color: '#615091'
            },
          ].map(mode => (
            <button key={mode.key}
              onClick={() => setPhase(mode.key)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '22px 24px', background: 'rgba(255,255,255,0.04)', border: `1.5px solid rgba(255,255,255,0.08)`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${mode.color}12`; e.currentTarget.style.borderColor = `${mode.color}40` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 30, flexShrink: 0, marginTop: 2 }}>{mode.icon}</span>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: '0 0 6px' }}>{mode.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: 0, lineHeight: 1.6 }}>{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── ANIMATED QUESTIONS ──
  if (phase === 'questions') {
    const q = QUESTIONS[step]
    const progress = ((step) / QUESTIONS.length) * 100

    return (
      <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(26,33,24,0.08)' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#1A2118' }}>mirrova</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 120, height: 3, background: 'rgba(26,33,24,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#0F9E99', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#8A8A8A', fontWeight: 500 }}>{step + 1} of {QUESTIONS.length}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ maxWidth: 600, width: '100%' }}>

            {/* Previous answers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {prevAnswers.slice(-2).map((ans, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#0F9E99', color: '#EFE9E0', borderRadius: '18px 18px 4px 18px', padding: '12px 18px', fontFamily: 'Inter', fontSize: 14, maxWidth: '75%', lineHeight: 1.6, fontWeight: 500 }}>
                    {ans}
                  </div>
                </div>
              ))}
            </div>

            {/* Question bubble — animated */}
            <div style={{
              display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 28,
              opacity: questionVisible ? 1 : 0,
              transform: questionVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease'
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A2118', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#F2E8D1' }}>m</span>
              </div>
              <div style={{ background: '#1A2118', color: '#F2E8D1', borderRadius: '4px 18px 18px 18px', padding: '16px 20px', fontFamily: 'Inter', fontSize: 15, maxWidth: '80%', lineHeight: 1.7, fontWeight: 500, fontStyle: 'italic' }}>
                {q.text}
              </div>
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', paddingLeft: 48 }}>
              <textarea
                ref={inputRef}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder={q.placeholder}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext() } }}
                rows={3}
                style={{ flex: 1, borderRadius: 16, border: '1.5px solid rgba(26,33,24,0.12)', padding: '14px 18px', fontSize: 14, fontFamily: 'Inter', resize: 'none', outline: 'none', background: '#fff', color: '#1A2118', lineHeight: 1.7, fontWeight: 500, transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#0F9E99'}
                onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.12)'}
              />
              <button onClick={handleNext} disabled={!current.trim()}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: current.trim() ? '#0F9E99' : 'rgba(26,33,24,0.1)', color: current.trim() ? '#EFE9E0' : '#8A8A8A', border: 'none', borderRadius: 99, padding: '13px 22px', cursor: current.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s' }}>
                {step === QUESTIONS.length - 1 ? 'Done →' : '→'}
              </button>
            </div>

            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#8A8A8A', marginTop: 10, paddingLeft: 48 }}>
              Press Enter to continue
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── FINAL DUMP ──
  if (phase === 'dump') return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#1A2118', display: 'block', marginBottom: 40 }}>mirrova</span>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A2118', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#F2E8D1' }}>m</span>
          </div>
          <div style={{ background: '#1A2118', color: '#F2E8D1', borderRadius: '4px 18px 18px 18px', padding: '16px 20px', fontFamily: 'Inter', fontSize: 15, lineHeight: 1.7, fontWeight: 500, fontStyle: 'italic' }}>
            One last thing — is there anything else you want Mirrova to know? Something you didn't get to say?
          </div>
        </div>

        <div style={{ paddingLeft: 48 }}>
          <textarea
            value={finalDump}
            onChange={e => setFinalDump(e.target.value)}
            placeholder="Anything goes here — family pressure, a dream you haven't told anyone, something you're ashamed of, something you're proud of... This is just for Mirrova."
            rows={6}
            autoFocus
            style={{ width: '100%', borderRadius: 16, border: '1.5px solid rgba(26,33,24,0.12)', padding: '16px 18px', fontSize: 14, fontFamily: 'Inter', resize: 'none', outline: 'none', background: '#fff', color: '#1A2118', lineHeight: 1.7, fontWeight: 500, boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#0F9E99'}
            onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.12)'}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={handleDumpDone} disabled={extracting}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', flex: 1, opacity: extracting ? 0.7 : 1 }}>
              {extracting ? 'Mirrova is reading your story...' : 'Build my future selves →'}
            </button>
          </div>
          <button onClick={handleDumpDone} disabled={extracting}
            style={{ fontFamily: 'Inter', fontSize: 13, color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, fontStyle: 'italic' }}>
            Skip this — I've said enough →
          </button>
        </div>
      </div>
    </div>
  )

  // ── VOICE ──
  if (phase === 'voice') return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F2E8D1', display: 'block', marginBottom: 48 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#F2E8D1', marginBottom: 12 }}>
          Just speak.
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', marginBottom: 40, lineHeight: 1.7, fontWeight: 500, maxWidth: 400, margin: '0 auto 40px' }}>
          Talk about your college, your dreams, your fears, what's stopping you. Speak naturally — Mirrova will figure out the rest.
        </p>

        <button onClick={isListening ? stopVoice : startVoice}
          style={{ width: 100, height: 100, borderRadius: '50%', background: isListening ? '#722F37' : '#0F9E99', border: 'none', cursor: 'pointer', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: isListening ? '0 0 0 16px rgba(114,47,55,0.15), 0 0 0 32px rgba(114,47,55,0.07)' : '0 0 0 8px rgba(15,158,153,0.12)', transition: 'all 0.3s' }}>
          {isListening ? '⏹' : '🎤'}
        </button>

        <p style={{ fontFamily: 'Inter', fontSize: 14, color: isListening ? '#F2E8D1' : '#7A6E58', fontWeight: isListening ? 600 : 400, marginBottom: 32 }}>
          {isListening ? 'Listening... tap to stop' : 'Tap to start speaking'}
        </p>

        {transcript && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>What Mirrova heard</p>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>{transcript}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => setPhase('mode')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#7A6E58', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '12px 24px', cursor: 'pointer' }}>
            ← Back
          </button>
          {transcript && (
            <button onClick={() => extractFromText(transcript)} disabled={extracting}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', opacity: extracting ? 0.7 : 1 }}>
              {extracting ? 'Understanding you...' : 'Done — build my future →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // ── ALIGN ──
  if (phase === 'align' && extracted) return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 580, width: '100%' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F2E8D1', display: 'block', marginBottom: 32 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 26, color: '#F2E8D1', marginBottom: 8 }}>
          Here's what I understood. 🪞
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', marginBottom: 24, lineHeight: 1.6 }}>
          Check if this is right. Edit anything that's off.
        </p>

        <div style={{ background: 'rgba(15,158,153,0.08)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(15,158,153,0.2)' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Mirrova's understanding</p>
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>"{extracted.summary}"</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'current_field', label: 'Studying / working in' },
            { key: 'dream_direction', label: 'Dream direction' },
            { key: 'top_skill', label: 'Top skill' },
            { key: 'biggest_fear', label: 'Biggest fear' },
            { key: 'biggest_blocker', label: 'Biggest blocker' },
            { key: 'success_vision', label: 'Success vision' },
            { key: 'city', label: 'City' },
            { key: 'education_level', label: 'Education' },
            { key: 'hours_per_day', label: 'Hours per day' },
            { key: 'built_anything', label: 'Built anything?' },
            { key: 'college_name', label: 'College' },
          ].map(field => (
            <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', fontWeight: 600, width: 140, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</span>
              <input
                value={extracted[field.key] || ''}
                onChange={e => setExtracted(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder="Not detected — add manually"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter', fontSize: 13, color: extracted[field.key] ? '#F2E8D1' : '#5A5050' }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPhase('questions')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#7A6E58', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '12px 20px', cursor: 'pointer' }}>
            ← Edit
          </button>
          <button onClick={() => setPhase('theme')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '13px 28px', cursor: 'pointer', flex: 1 }}>
            Yes, this is right →
          </button>
        </div>
      </div>
    </div>
  )

  // ── THEME ──
  if (phase === 'theme') return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#1A2118', display: 'block', marginBottom: 40 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#1A2118', marginBottom: 10 }}>
          One last thing.
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#5A5A5A', marginBottom: 40, lineHeight: 1.6 }}>
          Pick your vibe — you can always change it later.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setSelectedTheme(key)}
              style={{ width: 90, height: 90, borderRadius: 18, background: t.swatch, border: selectedTheme === key ? '3px solid #0F9E99' : '2px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', transform: selectedTheme === key ? 'scale(1.08)' : 'scale(1)' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: t.text }}>M</span>
              <span style={{ fontFamily: 'Inter', fontSize: 10, color: t.text, fontWeight: 500, opacity: 0.7 }}>{t.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => handleFinish(extracted || {})} disabled={loading}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 48px', cursor: 'pointer', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Setting up your Mirrova...' : 'Enter Mirrova →'}
        </button>
      </div>
    </div>
  )

  return null
}