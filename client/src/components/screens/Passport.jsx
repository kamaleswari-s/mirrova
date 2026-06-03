import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function Passport() {
  const { userId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const passportRef = useRef(null)

  useEffect(() => {
    axios.get(`/api/auth/passport/${userId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#0F9E99'
    if (score >= 60) return '#D4A842'
    if (score >= 40) return '#FBA002'
    return '#722F37'
  }

  const completedTasks = data?.plan?.tasks
    ? (typeof data.plan.tasks === 'string' ? JSON.parse(data.plan.tasks) : data.plan.tasks).filter(t => t.completed).length
    : 0
  const totalTasks = data?.plan?.tasks
    ? (typeof data.plan.tasks === 'string' ? JSON.parse(data.plan.tasks) : data.plan.tasks).length
    : 27

  const topSkills = data?.skills_assessment?.ratings
    ? Object.entries(data.skills_assessment.ratings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([skill, rating]) => ({ skill, rating }))
    : []

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Inter', color: '#7A6E58', fontSize: 14 }}>Loading passport...</p>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Inter', color: '#7A6E58', fontSize: 14 }}>Passport not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0E1512', padding: '40px 24px', fontFamily: 'Inter' }}>

      {/* Top bar */}
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 24, color: '#F2E8D1' }}>mirrova</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyLink}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: copied ? '#0F9E99' : 'transparent', color: copied ? '#fff' : '#8A7E6A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '8px 18px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
          <button onClick={() => window.print()}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#F2E8D1', color: '#0E1512', border: 'none', borderRadius: 99, padding: '8px 18px', cursor: 'pointer' }}>
            Download PDF
          </button>
        </div>
      </div>

      {/* PASSPORT CARD */}
      <div ref={passportRef} style={{ maxWidth: 680, margin: '0 auto', background: 'linear-gradient(145deg, #1A2118 0%, #0E1512 100%)', borderRadius: 24, border: '1px solid rgba(15,158,153,0.3)', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

        {/* Header stripe */}
        <div style={{ background: 'linear-gradient(90deg, #0F9E99, #615091)', height: 4 }} />

        {/* Top section */}
        <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0F9E99, #615091)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 24, color: '#fff', flexShrink: 0, border: '3px solid rgba(15,158,153,0.3)' }}>
                {data.avatar_initials || '?'}
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F2E8D1', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{data.name}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: '0 0 8px', fontWeight: 500 }}>{data.current_field || 'Student'} → {data.dream_direction || 'Exploring'}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', background: 'rgba(15,158,153,0.1)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(15,158,153,0.2)' }}>
                    {data.preferred_language || 'English'}
                  </span>
                  {data.chosen_self && (
                    <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#FBA002', background: 'rgba(251,160,2,0.1)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(251,160,2,0.2)' }}>
                      Path chosen ✓
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Passport ID */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4A4A4A', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Employability Passport</p>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4A4A4A', margin: 0, fontWeight: 500 }}>
                Issued by Mirrova AI · {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Score row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            {
              label: 'Reality Score',
              value: data.reality_check?.overall_score || '—',
              sub: data.reality_check?.score_label || 'Not assessed',
              color: data.reality_check ? scoreColor(data.reality_check.overall_score) : '#4A4A4A'
            },
            {
              label: 'Path Resonance',
              value: data.chosen_self ? `${data.chosen_self.resonance_score || 0}%` : '—',
              sub: data.chosen_self?.job_title || 'No path chosen',
              color: '#FBA002'
            },
            {
              label: 'Plan Progress',
              value: `${completedTasks}/${totalTasks}`,
              sub: '90-day spark plan',
              color: '#615091'
            },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 24px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', margin: '0 0 2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', margin: 0, fontWeight: 500 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Future self + skills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Chosen future self */}
          <div style={{ padding: '24px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#FBA002', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Target Role</p>
            {data.chosen_self ? (
              <>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#FBA002', margin: '0 0 4px' }}>{data.chosen_self.job_title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#7A6E58', margin: '0 0 12px', fontWeight: 500 }}>
                  {data.chosen_self.company_type} · {data.chosen_self.city} · {data.chosen_self.year}
                </p>
                <div style={{ height: 3, background: 'rgba(251,160,2,0.15)', borderRadius: 99, marginBottom: 4 }}>
                  <div style={{ height: 3, width: `${data.chosen_self.resonance_score || 0}%`, background: '#FBA002', borderRadius: 99 }} />
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', margin: 0 }}>{data.chosen_self.resonance_score || 0}% resonance match</p>
              </>
            ) : (
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', margin: 0 }}>No target role set yet</p>
            )}
          </div>

          {/* Top skills */}
          <div style={{ padding: '24px' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Top Skills</p>
            {topSkills.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topSkills.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#F2E8D1', fontWeight: 500 }}>{s.skill}</span>
                      <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', fontWeight: 700 }}>
                        {['', 'Beginner', 'Familiar', 'Confident', 'Expert'][s.rating] || s.rating}
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(15,158,153,0.15)', borderRadius: 99 }}>
                      <div style={{ height: 3, width: `${(s.rating / 5) * 100}%`, background: '#0F9E99', borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', margin: 0 }}>Skills assessment pending</p>
            )}
          </div>
        </div>

        {/* Reality check insights */}
        {data.reality_check && (
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#7A6E58', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Career Intelligence Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ background: 'rgba(114,47,55,0.1)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(114,47,55,0.2)' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Biggest Gap</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#F2E8D1', margin: 0, lineHeight: 1.5 }}>{data.reality_check.biggest_gap}</p>
              </div>
              <div style={{ background: 'rgba(15,158,153,0.08)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(15,158,153,0.15)' }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Hidden Strength</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#F2E8D1', margin: 0, lineHeight: 1.5 }}>{data.reality_check.hidden_strength}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', margin: '0 0 2px', fontWeight: 500 }}>
              This passport is AI-generated by Mirrova and reflects the student's self-assessed career readiness.
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', margin: 0 }}>
              mirrova.app/passport/{userId}
            </p>
          </div>
          <svg width="32" height="32" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1.5" fill="none" />
            <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
            <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
          </svg>
        </div>
      </div>

      {/* CTA for viewers */}
      <div style={{ maxWidth: 680, margin: '32px auto 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A', marginBottom: 16, fontWeight: 500 }}>
          Want to build your own Employability Passport?
        </p>
        <a href="/" style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#EFE9E0', textDecoration: 'none', borderRadius: 99, padding: '12px 28px', display: 'inline-block' }}>
          Start for free on Mirrova →
        </a>
      </div>
    </div>
  )
}