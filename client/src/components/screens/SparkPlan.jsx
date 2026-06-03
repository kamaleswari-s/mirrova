import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

export default function SparkPlan() {
  const { colors } = useTheme()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)

  useEffect(() => {
    axios.get('/api/sparkplan').then(r => setPlan(r.data)).catch(() => {})
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const r = await axios.post('/api/sparkplan/generate')
      setPlan(r.data)
    } catch (e) {
      alert(e.response?.data?.error || 'Error')
    } finally { setLoading(false) }
  }

  const toggleTask = async (week, taskIndex, completed) => {
    if (!plan) return
    const tasks = [...plan.tasks]
    const weekTasks = tasks.filter(t => t.week === week)
    if (weekTasks[taskIndex]) weekTasks[taskIndex].completed = !completed
    setPlan({ ...plan, tasks })
    try {
      await axios.patch('/api/sparkplan/task', { week, taskIndex, completed: !completed })
    } catch {}
  }

  const monthColors = { 1: '#0F9E99', 2: '#FBA002', 3: '#615091' }
  const months = plan ? [
    { num: 1, theme: plan.month1_theme },
    { num: 2, theme: plan.month2_theme },
    { num: 3, theme: plan.month3_theme },
  ] : []

  return (
    <div style={{ padding: '40px 48px', color: colors.text }}>
      <h1 className="page-heading" style={{ fontSize: 32, color: colors.text, marginBottom: 8 }}>
        90-Day Spark Plan
      </h1>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: colors.textMuted, marginBottom: 32, fontWeight: 500 }}>
        Not a 2-year roadmap. Just what matters in the next 90 days.
      </p>

      {!plan ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 18, color: colors.textMuted, marginBottom: 28 }}>
            Generate your personalised 90-day action plan.
          </p>
          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Building your spark plan...' : 'Generate my 90-day plan →'}
          </button>
        </div>
      ) : (
        <>
          {/* Weekly checkin */}
          {!checkinDone && (
            <div style={{ background: colors.bgCard, borderRadius: 16, padding: '20px 24px', marginBottom: 28, border: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: 0, flex: 1 }}>
                How was last week?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ r: 1, l: 'Rough' }, { r: 2, l: 'Okay' }, { r: 3, l: 'Crushed it 🔥' }].map(({ r, l }) => (
                  <button key={r} onClick={async () => {
                    await axios.post('/api/sparkplan/checkin', { week_number: 1, rating: r })
                    setCheckinDone(true)
                  }} style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: '8px 18px', cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {checkinDone && (
            <div style={{ background: '#0F9E9918', borderRadius: 12, padding: '14px 20px', marginBottom: 24, border: '1px solid #0F9E99' }}>
              <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: '#0F9E99', margin: 0 }}>
                ✓ Check-in saved. Keep going!
              </p>
            </div>
          )}

          {/* 3-column plan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {months.map(m => (
              <div key={m.num}>
                <div style={{ borderRadius: '16px 16px 0 0', padding: '16px 18px', background: `${monthColors[m.num]}22`, borderBottom: `2px solid ${monthColors[m.num]}` }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: monthColors[m.num], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
                    Month {m.num}
                  </p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: colors.text, margin: 0 }}>
                    {m.theme}
                  </p>
                </div>
                {[1, 2, 3].map(w => {
                  const weekNum = (m.num - 1) * 3 + w
                  const wTasks = plan.tasks?.filter(t => t.week === weekNum) || []
                  return (
                    <div key={w} style={{ border: `0.5px solid ${colors.border}`, borderTop: 'none' }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 14px 4px', margin: 0 }}>
                        Week {weekNum}
                      </p>
                      {wTasks.map((task, ti) => (
                        <div key={ti} onClick={() => toggleTask(weekNum, ti, task.completed)}
                          style={{ display: 'flex', gap: 10, padding: '10px 14px', cursor: 'pointer', borderTop: `0.5px solid ${colors.border}`, background: task.completed ? `${monthColors[m.num]}08` : 'transparent' }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${task.completed ? monthColors[m.num] : colors.border}`, background: task.completed ? monthColors[m.num] : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                            {task.completed ? '✓' : ''}
                          </div>
                          <div>
                            <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: task.completed ? colors.textMuted : colors.text, margin: '0 0 2px', textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </p>
                            <p style={{ fontFamily: 'Inter', fontSize: 11, color: colors.textMuted, margin: 0 }}>
                              {task.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: '10px 24px', cursor: 'pointer', marginTop: 24 }}>
            {loading ? 'Regenerating...' : 'Regenerate plan'}
          </button>
        </>
      )}
    </div>
  )
}


