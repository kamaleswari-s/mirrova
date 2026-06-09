import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import useIsMobile from '../../hooks/useIsMobile'

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
  const isMobile = useIsMobile()
  const [futures, setFutures] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [view, setView] = useState('cards')
  const [showTakeaways, setShowTakeaways] = useState(false)
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
    setShowTakeaways(false)
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
      if (selected) setSelected({ ...selected, is_chosen: true })
      alert(`✓ ${future.job_title} locked as your chosen future self!`)
    } catch {}
  }

  // Extract key takeaways from chat
  const getTakeaways = () => {
    const assistantMessages = messages.filter(m => m.role === 'assistant' && m.content.length > 50)
    if (assistantMessages.length < 2) return null

    // Pull the most meaningful sentences from the conversation
    const allText = assistantMessages.map(m => m.content).join(' ')
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 30)

    // Pick 3 most impactful (heuristic: sentences with action words)
    const actionWords = ['must', 'should', 'start', 'stop', 'focus', 'build', 'learn', 'avoid', 'need', 'important', 'biggest', 'mistake', 'regret', 'wish', 'advice']
    const scored = sentences.map(s => ({
      text: s.trim(),
      score: actionWords.reduce((acc, w) => acc + (s.toLowerCase().includes(w) ? 1 : 0), 0)
    })).sort((a, b) => b.score - a.score)

    return scored.slice(0, 3).map(s => s.text).filter(s => s.length > 20)
  }

  const takeaways = getTakeaways()
  const hasEnoughMessages = messages.filter(m => m.role === 'user').length >= 2

  // ── CARDS VIEW ──
  if (view === 'cards') return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px 48px', color: colors.text }}>
      <h1 className="page-heading" style={{ fontSize: isMobile ? 26 : 32, color: colors.text, marginBottom: 8 }}>
        Future Self Simulator
      </h1>
      <p style={{ fontFamily: 'Inter', fontSize: isMobile ? 13 : 15, color: colors.textMuted, marginBottom: 32, fontWeight: 500 }}>
        Meet 3 versions of yourself, 5 years from now. Ask them anything.
      </p>

      {futures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔮</div>
          <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: isMobile ? 16 : 18, color: colors.textMuted, marginBottom: 28 }}>
            Your future selves haven't been generated yet.
          </p>
          <button onClick={generateFutures} disabled={generating}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, padding: '13px 36px', cursor: 'pointer', opacity: generating ? 0.7 : 1, width: isMobile ? '100%' : 'auto' }}>
            {generating ? 'Generating your futures...' : 'Generate my future selves →'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {futures.map(f => (
              <div key={f.id} style={{ background: colors.bgCard, borderRadius: 20, padding: isMobile ? '20px 16px' : '28px 24px', border: f.is_chosen ? `2px solid ${colors.btnPrimary}` : `1px solid ${colors.border}`, transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {f.is_chosen && (
                  <span style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 11, background: colors.btnPrimary, color: colors.btnPrimaryText, padding: '3px 12px', borderRadius: 99, display: 'inline-block', marginBottom: 14 }}>✓ Chosen self</span>
                )}
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 17 : 19, color: colors.btnPrimary, margin: '0 0 6px' }}>{f.job_title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 4px', fontWeight: 500 }}>{f.company_type} · {f.city} · {f.year} <span style={{ fontSize: 11, opacity: 0.5 }}>· possible future</span></p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 18px', fontWeight: 500 }}>
                  ₹{Math.round(f.salary_min / 1000)}k – ₹{Math.round(f.salary_max / 1000)}k/month
                </p>
                <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 13, color: colors.text, margin: '0 0 22px', lineHeight: 1.7, borderLeft: `3px solid ${colors.btnPrimary}`, paddingLeft: 14 }}>
                  "{f.intro_quote}"
                </p>

                {/* Resonance score */}
                {f.resonance_score && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resonance</span>
                      <span style={{ fontFamily: 'Inter', fontSize: 10, color: colors.btnPrimary, fontWeight: 700 }}>{f.resonance_score}%</span>
                    </div>
                    <div style={{ height: 3, background: `${colors.btnPrimary}20`, borderRadius: 99 }}>
                      <div style={{ height: 3, width: `${f.resonance_score}%`, background: colors.btnPrimary, borderRadius: 99 }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startChat(f)}
                    style={{ flex: 1, fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, padding: '11px 0', background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, cursor: 'pointer' }}>
                    Chat with this self
                  </button>
                  {!f.is_chosen && (
                    <button onClick={() => chooseSelf(f)}
                      style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', border: `1.5px solid ${colors.border}`, borderRadius: 99, padding: '11px 16px', cursor: 'pointer', color: colors.textMuted }}>
                      Choose
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={generateFutures} disabled={generating}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: '10px 24px', cursor: 'pointer' }}>
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
      <div style={{ background: '#313B2F', padding: isMobile ? '12px 16px' : '14px 32px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button onClick={() => setView('cards')}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: '#B5A98A', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          ← Back
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0F9E99', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 13, color: '#EFE9E0', flexShrink: 0 }}>FS</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 13 : 15, color: '#F2E8D1', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.job_title}</p>
          {!isMobile && <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', margin: 0, fontWeight: 500 }}>{selected?.company_type} · {selected?.city} · {selected?.year}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {hasEnoughMessages && takeaways && (
            <button onClick={() => setShowTakeaways(!showTakeaways)}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 11 : 13, background: showTakeaways ? '#615091' : 'rgba(97,80,145,0.2)', color: '#C3B9E8', border: '1px solid rgba(97,80,145,0.4)', borderRadius: 99, padding: isMobile ? '7px 12px' : '9px 18px', cursor: 'pointer' }}>
              {showTakeaways ? 'Hide insights' : '✨ Key insights'}
            </button>
          )}
          <button onClick={() => chooseSelf(selected)}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 11 : 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: isMobile ? '7px 14px' : '9px 20px', cursor: 'pointer' }}>
            {selected?.is_chosen ? '✓ Chosen' : 'Lock in'}
          </button>
        </div>
      </div>

      {/* Key insights panel */}
      {showTakeaways && takeaways && takeaways.length > 0 && (
        <div style={{ background: 'rgba(97,80,145,0.1)', borderBottom: '1px solid rgba(97,80,145,0.2)', padding: isMobile ? '14px 16px' : '16px 32px', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#C3B9E8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
            ✨ Key insights from this conversation
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {takeaways.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(97,80,145,0.3)', border: '1px solid rgba(97,80,145,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 10, color: '#C3B9E8' }}>{i + 1}</span>
                </div>
                <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>"{t}"</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <a href={`https://www.google.com/search?q=how+to+become+${encodeURIComponent(selected?.job_title || 'my target role')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Inter', fontSize: 11, color: '#C3B9E8', fontWeight: 600, background: 'rgba(97,80,145,0.2)', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(97,80,145,0.3)', textDecoration: 'none' }}>
              🔗 Research this path
            </a>
            <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(selected?.job_title || '')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Inter', fontSize: 11, color: '#C3B9E8', fontWeight: 600, background: 'rgba(97,80,145,0.2)', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(97,80,145,0.3)', textDecoration: 'none' }}>
              💼 See LinkedIn jobs
            </a>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent('day in the life ' + (selected?.job_title || ''))}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Inter', fontSize: 11, color: '#C3B9E8', fontWeight: 600, background: 'rgba(97,80,145,0.2)', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(97,80,145,0.3)', textDecoration: 'none' }}>
              ▶️ Day in the life
            </a>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '28px 32px', background: '#1A2118', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0F9E99', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 900, fontSize: 11, color: '#EFE9E0' }}>FS</div>
            )}
            <div style={{
              maxWidth: isMobile ? '82%' : '68%',
              padding: '13px 18px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? '#615091' : '#313B2F',
              color: m.role === 'user' ? '#FFFACF' : '#F2E8D1',
              fontFamily: 'Inter', fontSize: isMobile ? 13 : 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontWeight: 400
            }}>
              {m.content || (m.streaming && <TypingIndicator />)}
              {m.streaming && m.content && <span className="cursor-blink" />}
            </div>
          </div>
        ))}

        {/* Show insights nudge after enough messages */}
        {hasEnoughMessages && takeaways && !showTakeaways && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <button onClick={() => setShowTakeaways(true)}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: 12, color: '#C3B9E8', background: 'rgba(97,80,145,0.15)', border: '1px solid rgba(97,80,145,0.3)', borderRadius: 99, padding: '7px 16px', cursor: 'pointer' }}>
              ✨ View key insights from this chat
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !streaming && (
        <div style={{ background: '#252E23', padding: isMobile ? '10px 16px' : '12px 32px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '0.5px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: isMobile ? 11 : 12, background: '#313B2F', color: '#B5A98A', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: isMobile ? '6px 12px' : '7px 16px', cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ background: '#252E23', padding: isMobile ? '12px 16px' : '16px 32px', display: 'flex', gap: 10, borderTop: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
          placeholder="Ask your future self anything..."
          disabled={streaming}
          style={{ flex: 1, height: 44, borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)', padding: '0 18px', fontSize: isMobile ? 13 : 14, fontFamily: 'Inter', background: '#313B2F', color: '#F2E8D1', outline: 'none' }}
        />
        <button onClick={() => sendMessage()} disabled={streaming || !input.trim()}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '0 20px', cursor: 'pointer', opacity: streaming ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  )
}