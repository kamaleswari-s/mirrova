import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 16px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBA002', opacity: 0.7, animation: `bounce 1s ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}

const API_BASE = import.meta.env.DEV ? '' : 'https://mirrova-server.onrender.com'

export default function Simulate() {
  const { colors } = useTheme()
  const [futures, setFutures] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [view, setView] = useState('cards')
  const messagesEndRef = useRef(null)

  useEffect(() => { loadFutures() }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadFutures = async () => {
    try {
      const res = await axios.get('/api/futures')
      if (res.data.length > 0) setFutures(res.data)
    } catch {}
  }

  const generateFutures = async () => {
    setGenerating(true)
    try {
      const res = await axios.post('/api/futures/generate')
      setFutures(res.data)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally { setGenerating(false) }
  }

  const startChat = async (future) => {
    setSelected(future)
    setView('chat')
    setMessages([{ role: 'assistant', content: future.intro_quote + "\n\nI remember exactly where you are right now. Ask me anything — I've lived through it." }])
    try {
      const res = await axios.get(`/api/chat/suggested/${future.id}`)
      setSuggestions(res.data)
    } catch {}
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || streaming) return
    setInput('')
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const response = await fetch(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mirrova_token')}`
        },
        body: JSON.stringify({ future_self_id: selected.id, message: msg, history })
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.delta) {
              full += data.delta
              setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: full, streaming: true }])
            }
            if (data.done) {
              setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: full }])
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Something went wrong. Try again.' }])
    } finally {
      setStreaming(false)
      try {
        const res = await axios.get(`/api/chat/suggested/${selected.id}`)
        setSuggestions(res.data)
      } catch {}
    }
  }

  const chooseSelf = async (future) => {
    try {
      await axios.patch(`/api/futures/${future.id}/choose`)
      setFutures(prev => prev.map(f => ({ ...f, is_chosen: f.id === future.id })))
      alert(`✓ ${future.job_title} locked as your chosen future self!`)
    } catch {}
  }

  // ── CARDS VIEW ──
  if (view === 'cards') return (
    <div style={{ padding: '40px 48px', color: colors.text }}>
      <h1 className="page-heading" style={{ fontSize: 32, color: colors.text, marginBottom: 8 }}>Future Self Simulator</h1>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: colors.textMuted, marginBottom: 32, fontWeight: 500 }}>Meet 3 versions of yourself, 5 years from now. Ask them anything.</p>

      {futures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 18, color: colors.textMuted, marginBottom: 28 }}>Your future selves haven't been generated yet.</p>
          <button onClick={generateFutures} disabled={generating}
            style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer', opacity: generating ? 0.7 : 1 }}>
            {generating ? 'Generating your futures...' : 'Generate my future selves →'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {futures.map(f => (
              <div key={f.id} style={{ background: colors.bgCard, borderRadius: 20, padding: '28px 24px', border: f.is_chosen ? `2px solid ${colors.btnPrimary}` : `0.5px solid ${colors.border}`, transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {f.is_chosen && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 11, background: colors.btnPrimary, color: colors.btnPrimaryText, padding: '3px 12px', borderRadius: 99, display: 'inline-block', marginBottom: 14 }}>Chosen self</span>
                )}
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 19, color: colors.btnPrimary, margin: '0 0 6px' }}>{f.job_title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 4px', fontWeight: 500 }}>{f.company_type} · {f.city} · {f.year}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 18px', fontWeight: 500 }}>
                  ₹{Math.round(f.salary_min / 1000)}k – ₹{Math.round(f.salary_max / 1000)}k/month
                </p>
                <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, color: colors.text, margin: '0 0 22px', lineHeight: 1.7, borderLeft: `3px solid ${colors.btnPrimary}`, paddingLeft: 14 }}>"{f.intro_quote}"</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => startChat(f)}
                    style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14, padding: '11px 0', background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, cursor: 'pointer' }}>
                    Chat with this self
                  </button>
                  <button onClick={() => chooseSelf(f)}
                    style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', border: `1.5px solid ${colors.border}`, borderRadius: 99, padding: '11px 18px', cursor: 'pointer', color: colors.textMuted }}>
                    Choose
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={generateFutures} disabled={generating}
            style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: '10px 24px', cursor: 'pointer' }}>
            {generating ? 'Regenerating...' : 'Regenerate futures →'}
          </button>
        </>
      )}
    </div>
  )

  // ── CHAT VIEW ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', color: colors.text }}>

      {/* Header */}
      <div style={{ background: '#313B2F', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button onClick={() => setView('cards')}
          style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: '#B5A98A', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0F9E99', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 14, color: '#EFE9E0', flexShrink: 0 }}>FS</div>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#F2E8D1', margin: 0 }}>{selected?.job_title}</p>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', margin: 0, fontWeight: 500 }}>{selected?.company_type} · {selected?.city} · {selected?.year}</p>
        </div>
        <button onClick={() => chooseSelf(selected)}
          style={{ marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '9px 20px', cursor: 'pointer' }}>
          Lock in this self
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#1A2118', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0F9E99', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 12, color: '#EFE9E0' }}>FS</div>
            )}
            <div style={{
              maxWidth: '68%', padding: '13px 18px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? '#615091' : '#313B2F',
              color: m.role === 'user' ? '#FFFACF' : '#F2E8D1',
              fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontWeight: 400
            }}>
              {m.content || (m.streaming && <TypingIndicator />)}
              {m.streaming && m.content && <span className="cursor-blink" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !streaming && (
        <div style={{ background: '#252E23', padding: '12px 32px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '0.5px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 600, fontSize: 12, background: '#313B2F', color: '#B5A98A', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '7px 16px', cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ background: '#252E23', padding: '16px 32px', display: 'flex', gap: 12, borderTop: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Ask your future self anything..."
          disabled={streaming}
          style={{ flex: 1, height: 46, borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)', padding: '0 20px', fontSize: 14, fontFamily: 'Inter', background: '#313B2F', color: '#F2E8D1', outline: 'none' }}
        />
        <button onClick={() => sendMessage()} disabled={streaming || !input.trim()}
          style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '0 24px', cursor: 'pointer', opacity: streaming ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  )
}