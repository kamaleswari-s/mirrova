import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import useIsMobile from '../../hooks/useIsMobile'

export default function SparkPlan() {
  const { colors } = useTheme()
  const isMobile = useIsMobile()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [expandedTask, setExpandedTask] = useState(null)

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

  const completedCount = plan?.tasks?.filter(t => t.completed)?.length || 0
  const totalCount = plan?.tasks?.length || 27

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px 48px', color: colors.text }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-heading" style={{ fontSize: isMobile ? 26 : 32, color: colors.text, marginBottom: 8 }}>
          90-Day Spark Plan
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: isMobile ? 13 : 15, color: colors.textMuted, margin: 0, fontWeight: 500 }}>
          Not a 2-year roadmap. Just what matters in the next 90 days.
        </p>
      </div>

      {!plan ? (
        <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: isMobile ? 15 : 18, color: colors.textMuted, marginBottom: 24 }}>
            Generate your personalised 90-day action plan.
          </p>
          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: colors.btnPrimary, color: colors.btnPrimaryText, border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', opacity: loading ? 0.7 : 1, width: isMobile ? '100%' : 'auto' }}>
            {loading ? 'Building your spark plan...' : 'Generate my 90-day plan →'}
          </button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div style={{ background: colors.bgCard, borderRadius: 12, padding: '14px 18px', marginBottom: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: colors.text, fontWeight: 600 }}>Overall progress</span>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: colors.accent, fontWeight: 700 }}>{completedCount}/{totalCount} tasks</span>
            </div>
            <div style={{ height: 6, background: `${colors.accent}20`, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(completedCount / totalCount) * 100}%`, background: colors.accent, borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* Weekly checkin */}
          {!checkinDone && (
            <div style={{ background: colors.bgCard, borderRadius: 16, padding: isMobile ? '14px' : '20px 24px', marginBottom: 20, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 13 : 15, color: colors.text, margin: 0, flex: 1 }}>
                How was last week?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ r: 1, l: 'Rough' }, { r: 2, l: 'Okay' }, { r: 3, l: '🔥 Crushed it' }].map(({ r, l }) => (
                  <button key={r} onClick={async () => {
                    await axios.post('/api/sparkplan/checkin', { week_number: 1, rating: r })
                    setCheckinDone(true)
                  }} style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 11 : 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: isMobile ? '6px 12px' : '8px 18px', cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {checkinDone && (
            <div style={{ background: '#0F9E9918', borderRadius: 12, padding: '12px 18px', marginBottom: 20, border: '1px solid #0F9E99' }}>
              <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: '#0F9E99', margin: 0 }}>
                ✓ Check-in saved. Keep going!
              </p>
            </div>
          )}

          {/* Plan */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            {months.map(m => (
              <div key={m.num} style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                {/* Month header */}
                <div style={{ padding: '14px 16px', background: `${monthColors[m.num]}22`, borderBottom: `2px solid ${monthColors[m.num]}` }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: monthColors[m.num], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
                    Month {m.num}
                  </p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: colors.text, margin: 0 }}>
                    {m.theme}
                  </p>
                </div>

                {[1, 2, 3].map(w => {
                  const weekNum = (m.num - 1) * 3 + w
                  const wTasks = plan.tasks?.filter(t => t.week === weekNum) || []
                  const weekDone = wTasks.filter(t => t.completed).length
                  return (
                    <div key={w} style={{ borderTop: `1px solid ${colors.border}` }}>
                      <div style={{ padding: '8px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                          Week {weekNum}
                        </p>
                        <span style={{ fontFamily: 'Inter', fontSize: 10, color: monthColors[m.num], fontWeight: 700 }}>
                          {weekDone}/{wTasks.length}
                        </span>
                      </div>
                      {wTasks.map((task, ti) => {
                        const taskKey = `${weekNum}-${ti}`
                        const isExpanded = expandedTask === taskKey
                        return (
                          <div key={ti} style={{ borderTop: `1px solid ${colors.border}`, background: task.completed ? `${monthColors[m.num]}08` : 'transparent', transition: 'background 0.15s' }}>
                            {/* Task row */}
                            <div style={{ display: 'flex', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                              onClick={() => setExpandedTask(isExpanded ? null : taskKey)}>
                              <div
                                onClick={e => { e.stopPropagation(); toggleTask(weekNum, ti, task.completed) }}
                                style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${task.completed ? monthColors[m.num] : colors.border}`, background: task.completed ? monthColors[m.num] : 'transparent', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                                {task.completed ? '✓' : ''}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: task.completed ? colors.textMuted : colors.text, margin: '0 0 2px', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: 1.4 }}>
                                  {task.title}
                                </p>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, margin: 0 }}>
                                    {task.duration}
                                  </p>
                                  {task.resources && (
                                    <span style={{ fontFamily: 'Inter', fontSize: 9, color: monthColors[m.num], fontWeight: 600, background: `${monthColors[m.num]}15`, padding: '1px 6px', borderRadius: 99 }}>
                                      resources ↓
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: 10, color: colors.textMuted, flexShrink: 0, marginTop: 3 }}>
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>

                            {/* Expanded — why + resources */}
                            {isExpanded && (
                              <div style={{ padding: '0 14px 14px 42px' }}>
                                {task.why && (
                                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: monthColors[m.num], margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.5 }}>
                                    {task.why}
                                  </p>
                                )}
                                {task.description && (
                                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: colors.textMuted, margin: '0 0 12px', lineHeight: 1.6 }}>
                                    {task.description}
                                  </p>
                                )}
                                {task.resources && (
                                  <div>
                                    <p style={{ fontFamily: 'Inter', fontSize: 9, color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
                                      Resources to upskill
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                      {Object.values(task.resources).map((res, ri) => (
                                        <a key={ri} href={res.url} target="_blank" rel="noopener noreferrer"
                                          onClick={e => e.stopPropagation()}
                                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: colors.bgMid, borderRadius: 8, border: `1px solid ${colors.border}`, textDecoration: 'none', transition: 'all 0.15s' }}
                                          onMouseEnter={e => e.currentTarget.style.borderColor = monthColors[m.num]}
                                          onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
                                          <span style={{ fontSize: 14 }}>{res.icon}</span>
                                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: colors.text, fontWeight: 500 }}>{res.label}</span>
                                          <span style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, marginLeft: 'auto' }}>→</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <button onClick={generate} disabled={loading}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 99, padding: '10px 24px', cursor: 'pointer', marginTop: 20, width: isMobile ? '100%' : 'auto' }}>
            {loading ? 'Regenerating...' : 'Regenerate plan'}
          </button>
        </>
      )}
    </div>
  )
}