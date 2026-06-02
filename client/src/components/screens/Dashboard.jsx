import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function Dashboard() {
  const { user } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const [futures, setFutures] = useState([])
  const [plan, setPlan] = useState(null)
  const [todayDone, setTodayDone] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    axios.get('/api/futures').then(r => setFutures(r.data)).catch(() => {})
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
  }, [])

  const chosenSelf = futures.find(f => f.is_chosen)
  const todayTask = plan?.tasks?.find(t => !t.completed)

  const stats = [
    { label: 'Future selves', value: futures.length || 0, color: '#FBA002', to: '/simulate' },
    { label: 'Resonance', value: chosenSelf ? `${chosenSelf.resonance_score || 0}%` : '—', color: '#0F9E99', to: '/simulate' },
    { label: 'Blind spots', value: '→', color: '#722F37', to: '/blindspots' },
    { label: 'Spark plan', value: plan ? '✓' : '→', color: '#615091', to: '/sparkplan' },
  ]

  const modules = [
    { title: 'Future Self Simulator', desc: futures.length ? `${futures.length} selves generated` : 'Generate your futures', color: '#FBA002', to: '/simulate', icon: '◈' },
    { title: 'Blind Spot Detector', desc: "Find what's holding you back", color: '#722F37', to: '/blindspots', icon: '◉' },
    { title: 'Pivot Bridge', desc: 'Build your path forward', color: '#615091', to: '/pivot', icon: '⇌' },
    { title: '90-Day Spark Plan', desc: plan ? 'Your plan is ready' : 'Generate your action plan', color: '#0F9E99', to: '/sparkplan', icon: '⚡' },
  ]

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1000, color: colors.text }}>
      {/* Greeting */}
      <div style={{ marginBottom: 36 }}>
        <h1 className="page-heading" style={{ fontSize: 36, color: colors.text, marginBottom: 6 }}>
          {greeting}, {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 18, color: colors.accent }}>
          Your future self is waiting.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => navigate(s.to)} style={{ background: colors.bgCard, borderRadius: 12, padding: 16, cursor: 'pointer', border: `0.5px solid ${colors.border}` }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: colors.textMuted, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Today's action */}
      {todayTask && (
        <div style={{ background: colors.bgCard, borderRadius: 16, padding: '20px 24px', marginBottom: 28, border: `2px solid ${colors.accent}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: colors.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Today's action</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: colors.text, margin: '0 0 4px' }}>{todayTask.title}</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: 0 }}>{todayTask.description}</p>
          </div>
          <button onClick={() => setTodayDone(true)} style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: todayDone ? colors.accent : 'transparent',
            border: `2px solid ${colors.accent}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: todayDone ? '#fff' : colors.accent, fontSize: 16, fontWeight: 700
          }}>
            {todayDone ? '✓' : ''}
          </button>
        </div>
      )}

      {/* Module cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {modules.map(m => (
          <div key={m.title} onClick={() => navigate(m.to)}
            style={{ background: colors.bgCard, borderRadius: 16, padding: 24, cursor: 'pointer', border: `0.5px solid ${colors.border}`, transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: 24, color: m.color, display: 'block', marginBottom: 12 }}>{m.icon}</span>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: colors.text, margin: '0 0 6px' }}>{m.title}</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, margin: '0 0 16px' }}>{m.desc}</p>
            <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: m.color }}>Open →</span>
          </div>
        ))}
      </div>
    </div>
  )
}