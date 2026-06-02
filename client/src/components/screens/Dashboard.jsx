import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const moods = [
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🔥', label: 'On fire' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [futures, setFutures] = useState([])
  const [plan, setPlan] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [mirrorAnswer, setMirrorAnswer] = useState(null)
  const [mood, setMood] = useState(null)
  const [todoInput, setTodoInput] = useState('')
  const [todos, setTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mirrova_todos') || '[]') } catch { return [] }
  })
  const [weeklyWin, setWeeklyWin] = useState(() => localStorage.getItem('mirrova_weekly_win') || '')
  const [winInput, setWinInput] = useState('')
  const [editingWin, setEditingWin] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  useEffect(() => {
    axios.get('/api/futures').then(r => {
      setFutures(r.data)
      const chosen = r.data.find(f => f.is_chosen)
      if (chosen) {
        axios.get(`/api/chat/history/${chosen.id}`)
          .then(r => setChatMessages(r.data)).catch(() => {})
      }
    }).catch(() => {})
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
  }, [])

  const chosenSelf = futures.find(f => f.is_chosen)
  const completedTasks = plan?.tasks?.filter(t => t.completed)?.length || 0
  const totalTasks = plan?.tasks?.length || 27
  const nextTask = plan?.tasks?.find(t => !t.completed)
  const gapScore = Math.min(100, Math.round((completedTasks / totalTasks) * 100) + 15)

  const futureQuotes = chatMessages.filter(m => m.role === 'assistant')
  const dailyQuote = futureQuotes.length > 0
    ? futureQuotes[new Date().getDate() % futureQuotes.length]
    : null

  const addTodo = useCallback(() => {
    setTodoInput(prev => {
      if (!prev.trim()) return prev
      const existing = JSON.parse(localStorage.getItem('mirrova_todos') || '[]')
      const newTodos = [...existing, { id: Date.now(), text: prev.trim(), done: false }]
      localStorage.setItem('mirrova_todos', JSON.stringify(newTodos))
      setTodos(newTodos)
      return ''
    })
  }, [])

  const toggleTodo = (id) => {
    setTodos(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      localStorage.setItem('mirrova_todos', JSON.stringify(updated))
      return updated
    })
  }

  const deleteTodo = (id) => {
    setTodos(prev => {
      const updated = prev.filter(t => t.id !== id)
      localStorage.setItem('mirrova_todos', JSON.stringify(updated))
      return updated
    })
  }

  const saveWin = () => {
    localStorage.setItem('mirrova_weekly_win', winInput)
    setWeeklyWin(winInput)
    setEditingWin(false)
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: '20px 24px',
    border: `1px solid ${c.borderStrong || c.border}`,
    ...extra
  })

  const lbl = (color) => ({
    fontFamily: 'Inter', fontSize: 10,
    color: color || c.textMuted,
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', margin: '0 0 10px'
  })

  return (
    <div style={{ padding: '40px 48px', color: c.text, maxWidth: 1100, margin: '0 auto' }}>

      {/* GREETING + STREAK ROW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: c.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {greeting}, {user?.name?.split(' ')[0]}.
          </h1>
          <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 15, color: c.accent, margin: 0, fontWeight: 500 }}>
            Your future self is waiting.
          </p>
        </div>

        {/* STREAK — rectangular */}
        <div style={card({ display: 'flex', alignItems: 'center', gap: 20, padding: '12px 24px' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <div>
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 24, color: '#FBA002', margin: 0, lineHeight: 1 }}>
                {user?.streak || 0}
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 9, color: c.textMuted, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>day streak</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: `${c.accent}20`, border: `1px solid ${c.border}` }} />
                <span style={{ fontFamily: 'Inter', fontSize: 8, color: c.textMuted, fontWeight: 600 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'stretch' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* MOOD */}
          <div style={card()}>
            <p style={lbl()}>How are you feeling about your path today?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {moods.map(m => (
                <button key={m.label} onClick={() => setMood(m.label)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '9px 4px', borderRadius: 12, border: `1.5px solid ${mood === m.label ? c.accent : c.border}`, background: mood === m.label ? `${c.accent}12` : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 20 }}>{m.emoji}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 10, color: mood === m.label ? c.accent : c.textMuted, fontWeight: mood === m.label ? 700 : 500 }}>{m.label}</span>
                </button>
              ))}
            </div>
            {mood && (
              <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 12, color: c.textMuted, margin: '10px 0 0', fontWeight: 500 }}>
                {mood === 'Frustrated' ? "That's valid. Check your north star →" :
                 mood === 'Neutral' ? "Steady is good. Pick one small thing today." :
                 mood === 'Okay' ? "Okay is progress. You showed up — that's what matters." :
                 mood === 'Good' ? "Great energy! Tackle something from your spark plan." :
                 "🔥 This is the energy. Go deep on your future self chat today."}
              </p>
            )}
          </div>

          {/* MIRROR CHECK */}
          <div style={card()}>
            <p style={lbl()}>Daily mirror check</p>
            <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: 15, color: c.text, margin: '0 0 14px', lineHeight: 1.5 }}>
              "Did you do the one thing that moved you forward today?"
            </p>
            {mirrorAnswer === null ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setMirrorAnswer(true)}
                  style={{ flex: 1, fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '11px', cursor: 'pointer' }}>
                  Yes, I did ✓
                </button>
                <button onClick={() => setMirrorAnswer(false)}
                  style={{ flex: 1, fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '11px', cursor: 'pointer' }}>
                  Not yet
                </button>
              </div>
            ) : mirrorAnswer ? (
              <div style={{ background: '#0F9E9912', borderRadius: 10, padding: '12px 16px', border: '1px solid #0F9E9930' }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#0F9E99', margin: 0 }}>🔥 That's what momentum looks like. Keep going.</p>
              </div>
            ) : (
              <div style={{ background: `${c.accent}10`, borderRadius: 10, padding: '12px 16px', border: `1px solid ${c.accent}25` }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: c.accent, margin: '0 0 2px' }}>That's okay. Tomorrow is another shot.</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0 }}>Check your spark plan and pick just one small thing.</p>
              </div>
            )}
          </div>

          {/* TOMORROW'S PREP LIST */}
          <div style={card({ borderLeft: `4px solid #615091` })}>
            <p style={lbl('#615091')}>Tomorrow's prep list</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 14px', fontWeight: 500 }}>
              Plan tomorrow tonight. Wake up knowing exactly what to do.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                value={todoInput}
                onChange={e => setTodoInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTodo() } }}
                placeholder="Add a task for tomorrow..."
                style={{ flex: 1, height: 40, borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '0 14px', fontSize: 13, fontFamily: 'Inter', background: c.bg || c.bgCard, color: c.text, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#615091'}
                onBlur={e => e.target.style.borderColor = c.border}
              />
              <button type="button" onClick={e => { e.preventDefault(); addTodo() }}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#615091', color: '#FFFACF', border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer' }}>
                Add
              </button>
            </div>
            {todos.length === 0 ? (
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '8px 0', opacity: 0.6 }}>
                No tasks yet. Add something to prep for tomorrow.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {todos.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: `${c.accent}05`, border: `0.5px solid ${t.done ? c.accent + '30' : c.border}` }}>
                    <button type="button" onClick={() => toggleTodo(t.id)}
                      style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${t.done ? '#615091' : c.border}`, background: t.done ? '#615091' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, flexShrink: 0, transition: 'all 0.15s' }}>
                      {t.done ? '✓' : ''}
                    </button>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, color: t.done ? c.textMuted : c.text, flex: 1, textDecoration: t.done ? 'line-through' : 'none', fontWeight: 500 }}>{t.text}</span>
                    <button type="button" onClick={() => deleteTodo(t.id)}
                      style={{ fontSize: 12, color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', opacity: 0.5 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WEEKLY WIN */}
          <div style={card({ borderLeft: `4px solid #D4A842` })}>
            <p style={lbl('#D4A842')}>This week's win</p>
            {!editingWin && weeklyWin ? (
              <div>
                <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 15, color: c.text, margin: '0 0 12px', lineHeight: 1.6, fontWeight: 500 }}>"{weeklyWin}"</p>
                <button type="button" onClick={() => { setWinInput(weeklyWin); setEditingWin(true) }}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: '#D4A842', border: '1px solid rgba(212,168,66,0.3)', borderRadius: 99, padding: '6px 14px', cursor: 'pointer' }}>
                  Update win →
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 10px', fontWeight: 500 }}>
                  What's one thing you're proud of this week?
                </p>
                <textarea value={winInput} onChange={e => setWinInput(e.target.value)}
                  placeholder="e.g. I finally finished my portfolio case study..."
                  rows={2}
                  style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${c.border}`, padding: '10px 14px', fontSize: 13, fontFamily: 'Inter', background: c.bg || c.bgCard, color: c.text, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#D4A842'}
                  onBlur={e => e.target.style.borderColor = c.border}
                />
                <button type="button" onClick={saveWin}
                  style={{ marginTop: 8, fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#D4A842', color: '#1A2118', border: 'none', borderRadius: 99, padding: '9px 20px', cursor: 'pointer' }}>
                  Save win 🏆
                </button>
              </div>
            )}
          </div>

          {/* CONTINUE WHERE YOU LEFT OFF */}
          <div style={card({ borderLeft: `4px solid ${c.accent}` })}>
            <p style={lbl(c.accent)}>Continue where you left off</p>
            {plan && nextTask ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: c.text, margin: '0 0 4px' }}>{nextTask.title}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 4px', fontWeight: 500 }}>Week {Math.ceil((completedTasks + 1) / 3)} · {nextTask.duration}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: '0 0 12px' }}>{completedTasks}/{totalTasks} tasks done</p>
                  <button type="button" onClick={() => navigate('/sparkplan')}
                    style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '10px 20px', cursor: 'pointer' }}>
                    Pick up where I left off →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                  {[
                    { label: 'M1', done: completedTasks >= 9, active: completedTasks < 9 },
                    { label: 'M2', done: completedTasks >= 18, active: completedTasks >= 9 && completedTasks < 18 },
                    { label: 'M3', done: completedTasks >= 27, active: completedTasks >= 18 },
                  ].map(m => (
                    <div key={m.label} style={{ width: 32, height: 32, borderRadius: 8, background: m.done ? c.accent : m.active ? `${c.accent}25` : `${c.accent}08`, border: `1.5px solid ${m.done || m.active ? c.accent : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: m.done ? '#fff' : m.active ? c.accent : c.textMuted }}>
                        {m.done ? '✓' : m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 12px' }}>Generate your spark plan to track progress.</p>
                <button type="button" onClick={() => navigate('/sparkplan')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '10px 20px', cursor: 'pointer' }}>
                  Generate my plan →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* NORTH STAR */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(251,160,2,0.2)' }}>
            <p style={lbl('#FBA002')}>Your north star</p>
            {chosenSelf ? (
              <>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: '#FBA002', margin: '0 0 4px', lineHeight: 1.2 }}>{chosenSelf.job_title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', margin: '0 0 14px', fontWeight: 500 }}>{chosenSelf.company_type} · {chosenSelf.city} · {chosenSelf.year}</p>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resonance</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700 }}>{chosenSelf.resonance_score || 0}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(251,160,2,0.15)', borderRadius: 99 }}>
                    <div style={{ height: 4, width: `${chosenSelf.resonance_score || 0}%`, background: '#FBA002', borderRadius: 99 }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13, color: '#F2E8D1', margin: 0, lineHeight: 1.7, borderLeft: '2px solid rgba(251,160,2,0.4)', paddingLeft: 12 }}>
                  "{chosenSelf.intro_quote}"
                </p>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', margin: '0 0 14px', lineHeight: 1.6 }}>You haven't chosen your future self yet.</p>
                <button type="button" onClick={() => navigate('/simulate')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '11px', cursor: 'pointer', width: '100%' }}>
                  Meet your future self →
                </button>
              </>
            )}
          </div>

          {/* DAILY QUOTE */}
          {dailyQuote ? (
            <div style={card({ background: `${c.accent}08`, border: `1px solid ${c.accent}25` })}>
              <p style={lbl(c.accent)}>Today's message from your future self</p>
              <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
                "{dailyQuote.content.slice(0, 160)}{dailyQuote.content.length > 160 ? '...' : ''}"
              </p>
            </div>
          ) : (
            <div style={card({ border: `1px solid ${c.accent}25` })}>
              <p style={lbl(c.accent)}>Today's message from your future self</p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 12px', lineHeight: 1.6 }}>
                Chat with your future self to unlock daily messages.
              </p>
              <button type="button" onClick={() => navigate('/simulate')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '9px 18px', cursor: 'pointer', width: '100%' }}>
                Start the conversation →
              </button>
            </div>
          )}

          {/* GAP METER */}
          <div style={card()}>
            <p style={lbl()}>Gap meter</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 12px', fontWeight: 500 }}>
              Distance between you now and your target role
            </p>
            <div style={{ position: 'relative', height: 8, background: `${c.accent}15`, borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${gapScore}%`, background: `linear-gradient(90deg, #722F37, ${c.accent})`, borderRadius: 99, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', fontWeight: 600 }}>Where you are</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.accent, fontWeight: 700 }}>{gapScore}% bridged</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.accent, fontWeight: 600 }}>Target role</span>
            </div>
          </div>

          {/* COUNTDOWN */}
          <div style={card()}>
            <p style={lbl()}>Countdown to job-ready</p>
            {chosenSelf ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 44, color: c.accent, lineHeight: 1 }}>
                    {Math.max(0, Math.round((new Date(chosenSelf.year, 0) - new Date()) / (1000 * 60 * 60 * 24)))}
                  </span>
                  <span style={{ fontFamily: 'Inter', fontSize: 14, color: c.textMuted, fontWeight: 500 }}>days</span>
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 10px', fontWeight: 500 }}>Until {chosenSelf.year} — your target year</p>
                <div style={{ height: 4, background: `${c.accent}15`, borderRadius: 99 }}>
                  <div style={{ height: 4, width: `${gapScore}%`, background: c.accent, borderRadius: 99 }} />
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: '5px 0 0' }}>{gapScore}% of the journey complete</p>
              </>
            ) : (
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0 }}>
                Choose your future self to start the countdown.
              </p>
            )}
          </div>

          {/* PATH CLARITY */}
          <div style={card()}>
            <p style={lbl()}>Path clarity</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                <circle cx="32" cy="32" r="24" fill="none" stroke={`${c.accent}20`} strokeWidth="5" />
                <circle cx="32" cy="32" r="24" fill="none" stroke={c.accent} strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 24 * gapScore / 100} ${2 * Math.PI * 24}`}
                  strokeLinecap="round" transform="rotate(-90 32 32)" />
                <text x="32" y="37" textAnchor="middle" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 12, fill: c.accent }}>{gapScore}%</text>
              </svg>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: c.text, margin: '0 0 4px' }}>
                  {gapScore < 30 ? 'Just starting out' : gapScore < 60 ? 'Building momentum' : gapScore < 85 ? 'Getting clear' : 'Almost there!'}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>
                  Complete more features to increase your clarity score
                </p>
              </div>
            </div>
          </div>

          {/* NEXT MILESTONE */}
          <div style={card({ marginTop: 'auto' })}>
            <p style={lbl()}>Next milestone</p>
            {plan ? (
              <>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: c.text, margin: '0 0 4px' }}>
                  {completedTasks < 9 ? 'Complete Month 1' : completedTasks < 18 ? 'Complete Month 2' : 'Complete Month 3'}
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0, fontWeight: 500 }}>
                  {Math.max(0, (completedTasks < 9 ? 9 : completedTasks < 18 ? 18 : 27) - completedTasks)} tasks remaining
                </p>
              </>
            ) : (
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0 }}>
                Generate your spark plan to see milestones.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}