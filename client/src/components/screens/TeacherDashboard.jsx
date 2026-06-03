import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export default function TeacherDashboard() {
  const { colors: c } = useTheme()
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [insights, setInsights] = useState(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [creating, setCreating] = useState(false)
  const [className, setClassName] = useState('')
  const [institution, setInstitution] = useState('')
  const [view, setView] = useState('classes')

  useEffect(() => {
    axios.get('/api/teacher/classes').then(r => setClasses(r.data)).catch(() => {})
  }, [])

  const createClass = async () => {
    if (!className.trim()) return
    setCreating(true)
    try {
      const r = await axios.post('/api/teacher/create-class', { class_name: className, institution })
      setClasses(prev => [r.data, ...prev])
      setClassName('')
      setInstitution('')
      setView('classes')
    } catch (e) {
      alert(e.response?.data?.error || 'Error creating class')
    } finally { setCreating(false) }
  }

  const openClass = async (cls) => {
    setSelectedClass(cls)
    setView('class')
    try {
      const [studentsRes] = await Promise.all([
        axios.get(`/api/teacher/class/${cls.id}/students`)
      ])
      setStudents(studentsRes.data)
    } catch {}
  }

  const generateInsights = async () => {
    setLoadingInsights(true)
    try {
      const r = await axios.get(`/api/teacher/class/${selectedClass.id}/insights`)
      setInsights(r.data)
    } catch {}
    finally { setLoadingInsights(false) }
  }

  const card = (extra = {}) => ({
    background: c.bgCard,
    borderRadius: 16,
    padding: '20px 24px',
    border: `1px solid ${c.border}`,
    ...extra
  })

  const lbl = (color) => ({
    fontFamily: 'Inter', fontSize: 10,
    color: color || c.textMuted,
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.1em', margin: '0 0 10px'
  })

  // ── CLASS DETAIL VIEW ──
  if (view === 'class' && selectedClass) return (
    <div style={{ padding: '40px 48px', color: c.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => { setView('classes'); setSelectedClass(null); setInsights(null) }}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: c.text, margin: '0 0 4px' }}>{selectedClass.class_name}</h1>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: 0 }}>
            {selectedClass.institution} · Code: <strong style={{ color: c.accent }}>{selectedClass.class_code}</strong> · {students.length} students
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* LEFT — students */}
        <div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total students', value: students.length, color: c.accent },
              { label: 'Career clear', value: students.filter(s => s.has_chosen > 0).length, color: '#0F9E99' },
              { label: 'Need attention', value: students.filter(s => !s.onboarding_complete).length, color: '#722F37' },
            ].map(s => (
              <div key={s.label} style={card()}>
                <p style={lbl()}>{s.label}</p>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Student list */}
          <div style={card()}>
            <p style={lbl()}>Students</p>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.textMuted }}>
                  No students yet. Share the class code <strong style={{ color: c.accent }}>{selectedClass.class_code}</strong> with your students.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {students.map(s => {
                  const rc = s.reality_check ? (typeof s.reality_check === 'string' ? JSON.parse(s.reality_check) : s.reality_check) : null
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: c.bgMid, borderRadius: 12, border: `0.5px solid ${c.border}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                        {s.avatar_initials || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: c.text, margin: '0 0 2px' }}>{s.name}</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: 0 }}>
                          {s.current_field || 'No field set'} → {s.dream_direction || 'No dream set'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        {rc && (
                          <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: rc.overall_score >= 70 ? '#0F9E99' : rc.overall_score >= 50 ? '#FBA002' : '#722F37', background: rc.overall_score >= 70 ? '#0F9E9915' : rc.overall_score >= 50 ? '#FBA00215' : '#72203715', padding: '3px 10px', borderRadius: 99 }}>
                            {rc.overall_score}/100
                          </span>
                        )}
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: s.has_chosen > 0 ? '#0F9E99' : c.textMuted, fontWeight: 600 }}>
                          {s.has_chosen > 0 ? '✓ Path chosen' : 'No path yet'}
                        </span>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted }}>
                          {s.chat_count} chats
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — AI insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(15,158,153,0.2)' }}>
            <p style={lbl('#0F9E99')}>AI Class Intelligence</p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#B5A98A', margin: '0 0 16px', lineHeight: 1.6 }}>
              Mirrova analyzes all student profiles and generates actionable insights for you — no individual data exposed.
            </p>
            {!insights ? (
              <button onClick={generateInsights} disabled={loadingInsights || students.length === 0}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#fff', border: 'none', borderRadius: 99, padding: '12px', cursor: 'pointer', width: '100%', opacity: loadingInsights ? 0.7 : 1 }}>
                {loadingInsights ? 'Analyzing class...' : students.length === 0 ? 'Add students first' : 'Generate class insights →'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Summary */}
                <div>
                  <p style={lbl('#0F9E99')}>Class summary</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>{insights.insights?.class_summary}</p>
                </div>

                {/* This week */}
                <div style={{ background: 'rgba(15,158,153,0.1)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(15,158,153,0.2)' }}>
                  <p style={lbl('#0F9E99')}>🎯 Do this week</p>
                  <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>{insights.insights?.this_week_for_teacher}</p>
                </div>

                {/* Skill gaps */}
                <div>
                  <p style={lbl('#FBA002')}>Top skill gaps</p>
                  {insights.insights?.top_skill_gaps?.map((gap, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#722F37', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A' }}>{gap}</span>
                    </div>
                  ))}
                </div>

                {/* Interventions */}
                <div>
                  <p style={lbl('#615091')}>Suggested interventions</p>
                  {insights.insights?.intervention_suggestions?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#615091', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* At risk vs ready */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#72203715', borderRadius: 10, padding: '12px', border: '1px solid #72203730', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 24, color: '#722F37', margin: '0 0 4px' }}>{insights.insights?.at_risk_count || 0}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', margin: 0, fontWeight: 600 }}>Need attention</p>
                  </div>
                  <div style={{ background: '#0F9E9915', borderRadius: 10, padding: '12px', border: '1px solid #0F9E9930', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 24, color: '#0F9E99', margin: '0 0 4px' }}>{insights.insights?.ready_count || 0}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', margin: 0, fontWeight: 600 }}>Career ready</p>
                  </div>
                </div>

                <button onClick={generateInsights} disabled={loadingInsights}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: 'transparent', color: '#7A6E58', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '8px', cursor: 'pointer' }}>
                  Refresh insights
                </button>
              </div>
            )}
          </div>

          {/* Common fields */}
          {insights?.common_fields?.length > 0 && (
            <div style={card()}>
              <p style={lbl()}>Common fields</p>
              {insights.common_fields.map(([field, count]) => (
                <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, fontWeight: 500 }}>{field}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.accent, fontWeight: 700 }}>{count} students</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── CREATE CLASS VIEW ──
  if (view === 'create') return (
    <div style={{ padding: '40px 48px', color: c.text, maxWidth: 560 }}>
      <button onClick={() => setView('classes')}
        style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: c.textMuted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, display: 'block' }}>
        ← Back
      </button>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: c.text, margin: '0 0 8px' }}>Create a class</h1>
      <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.textMuted, margin: '0 0 32px', fontWeight: 500 }}>
        Students join using a class code. You'll see their career clarity and get AI insights about the whole class.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: c.text, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Class name</label>
          <input value={className} onChange={e => setClassName(e.target.value)}
            placeholder="e.g. B.Tech CSE 2025 Batch"
            style={{ width: '100%', height: 46, borderRadius: 12, border: `1.5px solid ${c.border}`, padding: '0 16px', fontSize: 14, fontFamily: 'Inter', background: c.bgCard, color: c.text, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = c.accent}
            onBlur={e => e.target.style.borderColor = c.border}
          />
        </div>
        <div>
          <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: c.text, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Institution</label>
          <input value={institution} onChange={e => setInstitution(e.target.value)}
            placeholder="e.g. Anna University, Chennai"
            style={{ width: '100%', height: 46, borderRadius: 12, border: `1.5px solid ${c.border}`, padding: '0 16px', fontSize: 14, fontFamily: 'Inter', background: c.bgCard, color: c.text, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = c.accent}
            onBlur={e => e.target.style.borderColor = c.border}
          />
        </div>
        <button onClick={createClass} disabled={creating || !className.trim()}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', opacity: creating ? 0.7 : 1, marginTop: 8 }}>
          {creating ? 'Creating...' : 'Create class →'}
        </button>
      </div>
    </div>
  )

  // ── CLASSES LIST VIEW ──
  return (
    <div style={{ padding: '40px 48px', color: c.text }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: c.text, margin: '0 0 6px' }}>Teacher Dashboard</h1>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500 }}>
            Monitor your students' career clarity and get AI-powered class insights.
          </p>
        </div>
        <button onClick={() => setView('create')}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '12px 24px', cursor: 'pointer', flexShrink: 0 }}>
          + Create class
        </button>
      </div>

      {classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>👩‍🏫</div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: c.text, margin: '0 0 12px' }}>No classes yet</h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: '0 auto 28px', maxWidth: 400, lineHeight: 1.7 }}>
            Create a class and share the code with your students. Mirrova will show you their career clarity, skill gaps, and what needs your attention.
          </p>
          <button onClick={() => setView('create')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer' }}>
            Create my first class →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {classes.map(cls => (
            <div key={cls.id} onClick={() => openClass(cls)}
              style={{ background: c.bgCard, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}`, cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  🎓
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: c.accent, background: `${c.accent}15`, padding: '4px 12px', borderRadius: 99, border: `1px solid ${c.accent}30` }}>
                  {cls.class_code}
                </span>
              </div>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: c.text, margin: '0 0 4px' }}>{cls.class_name}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 16px', fontWeight: 500 }}>{cls.institution || 'No institution set'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted }}>{cls.student_count} students</span>
                <span style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: c.accent }}>View class →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


