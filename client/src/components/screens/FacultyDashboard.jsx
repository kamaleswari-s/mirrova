import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function FacultyDashboard() {
  const navigate = useNavigate()
  const [faculty, setFaculty] = useState(null)
  const [students, setStudents] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const storedToken = localStorage.getItem('faculty_token')
    if (!storedToken) { navigate('/faculty'); return }
    const f = JSON.parse(localStorage.getItem('faculty') || '{}')
    setFaculty(f)
    fetchData(storedToken)
  }, [])

  const fetchData = async (storedToken) => {
    try {
      const headers = { Authorization: `Bearer ${storedToken}` }
      const studentsRes = await axios.get('/api/teacher/students', { headers })
      setStudents(studentsRes.data)
    } catch (e) {
      console.error('Fetch error:', e)
      if (e.response?.status === 401) navigate('/faculty')
    } finally { setLoading(false) }
  }

  const fetchInsights = async () => {
    const storedToken = localStorage.getItem('faculty_token')
    setInsightsLoading(true)
    try {
      const r = await axios.get('/api/teacher/insights', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
      setInsights(r.data)
    } catch (e) {
      console.error(e)
    } finally { setInsightsLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('faculty_token')
    localStorage.removeItem('faculty')
    navigate('/faculty')
  }

  const scoreColor = (score) => {
    if (!score) return '#4A4A4A'
    if (score >= 80) return '#0F9E99'
    if (score >= 60) return '#D4A842'
    if (score >= 40) return '#FBA002'
    return '#722F37'
  }

  const getRiskLevel = (student) => {
    const score = student.reality_check?.overall_score
    if (!score || score < 40) return 'high'
    if (!student.has_chosen || score < 60) return 'medium'
    return 'low'
  }

  const atRisk = students.filter(s => getRiskLevel(s) === 'high')
  const mediumRisk = students.filter(s => getRiskLevel(s) === 'medium')
  const onTrack = students.filter(s => getRiskLevel(s) === 'low')
  const avgScore = students.filter(s => s.reality_check?.overall_score).length > 0
    ? Math.round(students.filter(s => s.reality_check?.overall_score).reduce((a, s) => a + s.reality_check.overall_score, 0) / students.filter(s => s.reality_check?.overall_score).length)
    : null

  const noDirection = students.filter(s => !s.dream_direction).length
  const type1 = noDirection
  const type2 = students.filter(s => s.dream_direction && (!s.reality_check || s.reality_check?.overall_score < 60)).length
  const type3 = students.filter(s => s.recent_rejection).length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Inter', color: '#7A6E58', fontSize: 14 }}>Loading your classroom...</p>
    </div>
  )

  const c = {
    bg: '#0E1512', card: '#1A2118', border: 'rgba(255,255,255,0.06)',
    text: '#F2E8D1', muted: '#7A6E58', accent: '#0F9E99'
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: 'Inter', color: c.text }}>

      {/* Nav */}
      <nav style={{ background: '#111A0F', borderBottom: `1px solid ${c.border}`, padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1.5" fill="none" />
            <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
          </svg>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F2E8D1' }}>mirrova</span>
          <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 600, background: 'rgba(15,158,153,0.1)', border: '1px solid rgba(15,158,153,0.2)', borderRadius: 99, padding: '2px 8px' }}>educator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.muted }}>{faculty?.name} · {faculty?.college_name}</span>
          <button onClick={logout}
            style={{ fontFamily: 'Inter', fontSize: 12, color: c.muted, background: 'none', border: `1px solid ${c.border}`, borderRadius: 99, padding: '6px 16px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: c.text, margin: '0 0 6px' }}>
            Good morning, {faculty?.name?.split(' ')[0]}. 👋
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.muted, margin: 0 }}>
            {students.length} students from {faculty?.college_name} are using Mirrova.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: c.card, borderRadius: 12, padding: 4, border: `1px solid ${c.border}`, width: 'fit-content' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'students', label: '👥 Students' },
            { key: 'insights', label: '🧠 AI Insights' },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key === 'insights' && !insights) fetchInsights() }}
              style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? c.accent : 'transparent', color: activeTab === tab.key ? '#fff' : c.muted, transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Students', value: students.length, color: c.accent, sub: 'on Mirrova' },
                { label: 'Avg Reality Score', value: avgScore ? `${avgScore}/100` : '—', color: scoreColor(avgScore), sub: avgScore ? (avgScore >= 60 ? 'Good standing' : 'Needs attention') : 'Not assessed yet' },
                { label: 'At Risk', value: atRisk.length, color: '#722F37', sub: 'score below 40' },
                { label: 'On Track', value: onTrack.length, color: '#38683D', sub: 'score above 60' },
              ].map(s => (
                <div key={s.label} style={{ background: c.card, borderRadius: 16, padding: '20px', border: `1px solid ${c.border}` }}>
                  <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.muted, margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: c.card, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}` }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Student type distribution</p>
                {[
                  { label: "Don't know what they want", count: type1, color: '#D4A842', pct: students.length ? Math.round(type1 / students.length * 100) : 0 },
                  { label: 'Feeling stuck', count: type2, color: '#0B8A80', pct: students.length ? Math.round(type2 / students.length * 100) : 0 },
                  { label: 'Getting rejected', count: type3, color: '#C3B9E8', pct: students.length ? Math.round(type3 / students.length * 100) : 0 },
                ].map(t => (
                  <div key={t.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, fontWeight: 500 }}>{t.label}</span>
                      <span style={{ fontFamily: 'Inter', fontSize: 13, color: t.color, fontWeight: 700 }}>{t.count} students</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${t.pct}%`, background: t.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: c.card, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}` }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Risk distribution</p>
                {[
                  { label: 'High risk', students: atRisk, color: '#722F37', desc: 'Needs immediate intervention' },
                  { label: 'Medium risk', students: mediumRisk, color: '#FBA002', desc: 'Monitor closely' },
                  { label: 'On track', students: onTrack, color: '#0F9E99', desc: 'Doing well' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: c.text, margin: '0 0 2px' }}>{r.label}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.muted, margin: 0 }}>{r.desc}</p>
                    </div>
                    <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 20, color: r.color }}>{r.students.length}</span>
                  </div>
                ))}
              </div>
            </div>

            {atRisk.length > 0 && (
              <div style={{ background: 'rgba(114,47,55,0.08)', borderRadius: 16, padding: '24px', border: '1px solid rgba(114,47,55,0.2)' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>🚨 Students needing immediate attention</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {atRisk.slice(0, 6).map(s => (
                    <div key={s.id} onClick={() => { setSelectedStudent(s); setActiveTab('students') }}
                      style={{ background: c.card, borderRadius: 12, padding: '14px', border: '1px solid rgba(114,47,55,0.2)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#722F37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff', flexShrink: 0 }}>
                          {s.avatar_initials || s.name?.[0]}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: c.text, margin: 0 }}>{s.name}</p>
                          <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.muted, margin: 0 }}>{s.current_field || 'No field set'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {!s.dream_direction && <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', background: 'rgba(114,47,55,0.15)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>No direction</span>}
                        {!s.reality_check && <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', background: 'rgba(251,160,2,0.15)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Not assessed</span>}
                        {s.reality_check?.overall_score < 40 && <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', background: 'rgba(114,47,55,0.15)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>Score: {s.reality_check.overall_score}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {students.length === 0 && (
              <div style={{ background: c.card, borderRadius: 16, padding: '48px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 32, margin: '0 0 16px' }}>👩‍🎓</p>
                <p style={{ fontFamily: 'Inter', fontSize: 16, color: c.text, fontWeight: 600, margin: '0 0 8px' }}>No students yet</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.muted, margin: 0, lineHeight: 1.6 }}>
                  Students appear here when they enter <strong style={{ color: c.text }}>{faculty?.college_name}</strong> as their college during onboarding.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 380px' : '1fr', gap: 20 }}>
            <div>
              {students.length === 0 && (
                <div style={{ background: c.card, borderRadius: 16, padding: '40px', border: `1px solid ${c.border}`, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 16, color: c.muted, margin: '0 0 8px' }}>No students yet</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', margin: 0 }}>Students need to enter your college name during onboarding to appear here.</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {students.map(s => {
                  const risk = getRiskLevel(s)
                  const riskColor = risk === 'high' ? '#722F37' : risk === 'medium' ? '#FBA002' : '#0F9E99'
                  const score = s.reality_check?.overall_score
                  return (
                    <div key={s.id} onClick={() => setSelectedStudent(selectedStudent?.id === s.id ? null : s)}
                      style={{ background: selectedStudent?.id === s.id ? `${c.accent}10` : c.card, borderRadius: 14, padding: '16px 20px', border: `1.5px solid ${selectedStudent?.id === s.id ? c.accent : c.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: riskColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                        {s.avatar_initials || s.name?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: c.text, margin: '0 0 3px' }}>{s.name}</p>
                        <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.muted, margin: 0 }}>
                          {s.current_field || 'No field'} → {s.dream_direction || 'No direction'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        {score && (
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: scoreColor(score), margin: 0, lineHeight: 1 }}>{score}</p>
                            <p style={{ fontFamily: 'Inter', fontSize: 9, color: c.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>score</p>
                          </div>
                        )}
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: riskColor }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {selectedStudent && (
              <div style={{ background: c.card, borderRadius: 20, padding: '24px', border: `1px solid ${c.border}`, position: 'sticky', top: 20, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>
                    {selectedStudent.avatar_initials || selectedStudent.name?.[0]}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: c.text, margin: '0 0 2px' }}>{selectedStudent.name}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.muted, margin: 0 }}>{selectedStudent.email}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'Reality Score', value: selectedStudent.reality_check?.overall_score || '—', color: scoreColor(selectedStudent.reality_check?.overall_score) },
                    { label: 'Tasks Done', value: `${selectedStudent.tasks_completed || 0}/${selectedStudent.tasks_total || 0}`, color: c.accent },
                    { label: 'Future Chosen', value: selectedStudent.has_chosen > 0 ? 'Yes ✓' : 'No', color: selectedStudent.has_chosen > 0 ? '#0F9E99' : '#722F37' },
                    { label: 'Chats', value: selectedStudent.chat_count || 0, color: '#615091' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#0E1512', borderRadius: 10, padding: '12px', border: `1px solid rgba(255,255,255,0.04)` }}>
                      <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: stat.color, margin: '0 0 2px', lineHeight: 1 }}>{stat.value}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {[
                  { label: 'Current field', value: selectedStudent.current_field },
                  { label: 'Dream direction', value: selectedStudent.dream_direction },
                  { label: 'Top skill', value: selectedStudent.top_skill },
                  { label: 'Biggest fear', value: selectedStudent.biggest_fear },
                  { label: 'City', value: selectedStudent.city },
                  { label: 'Language', value: selectedStudent.preferred_language },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>{f.label}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5 }}>{f.value}</p>
                  </div>
                ))}

                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: getRiskLevel(selectedStudent) === 'high' ? 'rgba(114,47,55,0.15)' : getRiskLevel(selectedStudent) === 'medium' ? 'rgba(251,160,2,0.1)' : 'rgba(15,158,153,0.1)', border: `1px solid ${getRiskLevel(selectedStudent) === 'high' ? 'rgba(114,47,55,0.3)' : getRiskLevel(selectedStudent) === 'medium' ? 'rgba(251,160,2,0.3)' : 'rgba(15,158,153,0.3)'}` }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: getRiskLevel(selectedStudent) === 'high' ? '#722F37' : getRiskLevel(selectedStudent) === 'medium' ? '#FBA002' : '#0F9E99', fontWeight: 700, margin: 0 }}>
                    {getRiskLevel(selectedStudent) === 'high' ? '🚨 High risk — needs intervention' : getRiskLevel(selectedStudent) === 'medium' ? '⚠️ Medium risk — monitor closely' : '✅ On track — doing well'}
                  </p>
                </div>

                <button onClick={() => setSelectedStudent(null)}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.muted, border: `1px solid ${c.border}`, borderRadius: 99, padding: '9px', cursor: 'pointer', width: '100%', marginTop: 16 }}>
                  Close ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div>
            {insightsLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 16, color: c.accent, fontWeight: 600, margin: '0 0 8px' }}>Analyzing your classroom...</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.muted, margin: 0 }}>This takes about 10 seconds.</p>
              </div>
            ) : !insights ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                <p style={{ fontFamily: 'Inter', fontSize: 16, color: c.text, fontWeight: 600, margin: '0 0 8px' }}>Generate AI class insights</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.muted, margin: '0 auto 24px', maxWidth: 400, lineHeight: 1.7 }}>
                  Mirrova will analyze all your students and give you actionable intelligence about your classroom.
                </p>
                <button onClick={fetchInsights}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: '#fff', border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer' }}>
                  Generate insights →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(15,158,153,0.2)', gridColumn: '1 / -1' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>📊 Class summary</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.7, fontWeight: 500 }}>{insights.insights?.class_summary}</p>
                </div>

                <div style={{ background: c.card, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}` }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>🚨 Top skill gaps</p>
                  {insights.insights?.top_skill_gaps?.map((gap, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(114,47,55,0.15)', border: '1px solid rgba(114,47,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 11, color: '#722F37' }}>{i + 1}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{gap}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: c.card, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}` }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>😰 Common fears</p>
                  {insights.insights?.common_fears?.map((fear, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBA002', flexShrink: 0, marginTop: 6 }} />
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5 }}>{fear}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: c.card, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}` }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>💡 Suggested interventions</p>
                  {insights.insights?.intervention_suggestions?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: `${c.accent}15`, border: `1px solid ${c.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 11, color: c.accent }}>{i + 1}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{s}</p>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(251,160,2,0.2)', borderLeft: '4px solid #FBA002' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>🎯 Do this one thing this week</p>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>{insights.insights?.this_week_for_teacher}</p>
                </div>

                <div style={{ background: c.card, borderRadius: 16, padding: '24px', border: `1px solid ${c.border}`, gridColumn: '1 / -1' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#615091', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>📈 Market alignment</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.7 }}>{insights.insights?.market_alignment}</p>
                </div>

                <button onClick={fetchInsights} disabled={insightsLoading}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.muted, border: `1px solid ${c.border}`, borderRadius: 99, padding: '10px 24px', cursor: 'pointer' }}>
                  Regenerate insights
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}