import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const aboutRef = useRef(null)
  const whyRef = useRef(null)
  const howRef = useRef(null)

  const handleMode = (mode) => {
    sessionStorage.setItem('mirrova_mode', mode)
    navigate('/signup')
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F5F0E8', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{ minHeight: '100vh', background: '#0E1512', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }} viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <circle cx="720" cy="450" r="380" stroke="#0F9E99" strokeWidth="0.5" />
          <circle cx="720" cy="450" r="280" stroke="#0F9E99" strokeWidth="0.5" />
          <circle cx="720" cy="450" r="180" stroke="#0F9E99" strokeWidth="0.5" />
          <path d="M 340 450 Q 720 100 1100 450" stroke="#0F9E99" strokeWidth="0.8" fill="none" />
          <path d="M 340 450 Q 720 800 1100 450" stroke="#615091" strokeWidth="0.8" fill="none" />
          <line x1="720" y1="70" x2="720" y2="830" stroke="#0F9E99" strokeWidth="0.4" strokeDasharray="4 8" />
          <line x1="100" y1="450" x2="1340" y2="450" stroke="#0F9E99" strokeWidth="0.4" strokeDasharray="4 8" />
          <circle cx="720" cy="70" r="4" fill="#FBA002" opacity="0.6" />
          <circle cx="720" cy="450" r="6" fill="#0F9E99" opacity="0.4" />
        </svg>

        {/* NAV */}
        <nav style={{ display: 'flex', alignItems: 'center', padding: '0 48px', height: 64, position: 'relative', zIndex: 10, flexShrink: 0, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <svg width="24" height="24" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1.5" fill="none" />
              <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
              <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
            </svg>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F2E8D1' }}>mirrova</span>
          </div>
          <div style={{ display: 'flex', gap: 32, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {[['About', aboutRef], ['Why Mirrova', whyRef], ['How it works', howRef]].map(([label, ref]) => (
              <button key={label} onClick={() => ref.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, color: '#8A7E6A', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', transition: 'color 0.15s', textTransform: 'uppercase' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F2E8D1'}
                onMouseLeave={e => e.currentTarget.style.color = '#8A7E6A'}
              >{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <button onClick={() => navigate('/login')}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, color: '#F2E8D1', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '7px 18px', cursor: 'pointer' }}>
              Sign in
            </button>
            <button onClick={() => navigate('/signup')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 12, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '8px 18px', cursor: 'pointer' }}>
              Get started free →
            </button>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 48px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,158,153,0.1)', border: '1px solid rgba(15,158,153,0.25)', borderRadius: 99, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0F9E99' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Career Intelligence · 6 Indian Languages</span>
          </div>

          <svg width="80" height="80" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 20 }}>
            <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1" fill="none" />
            <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
            <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
          </svg>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 38, color: '#F2E8D1', letterSpacing: '-0.03em', lineHeight: 1 }}>YOU'VE BEEN</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 38, color: '#F2E8D1', letterSpacing: '-0.03em', lineHeight: 1 }}>TOLD TO</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 36, color: '#0F9E99', letterSpacing: '-0.02em', lineHeight: 1 }}>plan.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 38, color: '#F2E8D1', letterSpacing: '-0.03em', lineHeight: 1 }}>NOBODY SHOWED YOU HOW TO&nbsp;</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 36, color: '#0F9E99', letterSpacing: '-0.02em', lineHeight: 1 }}>see.</span>
            </div>
          </div>

          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#8A7E6A', lineHeight: 1.75, marginBottom: 36, maxWidth: 520 }}>
            Talk to your future self. Get a brutally honest Reality Check. Build your resume, decode your rejections, and find your path — in your language, for free.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
              See my future →
            </button>
            <button onClick={() => handleMode('rejected')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', color: '#F2E8D1' }}>
              I keep getting rejected
            </button>
          </div>

          <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
            style={{ marginTop: 40, fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>Scroll</span>
            <span style={{ animation: 'bounceDown 1.5s infinite' }}>↓</span>
          </button>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div ref={aboutRef} style={{ background: '#F5F0E8', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, color: '#1A2118', letterSpacing: '-0.02em', lineHeight: 1 }}>EVERY STUDENT</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#0F9E99', letterSpacing: '-0.01em', lineHeight: 1 }}>deserves</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, color: '#1A2118', letterSpacing: '-0.02em', lineHeight: 1 }}>A PERSONAL CAREER</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1, background: '#0F9E99', color: '#EFE9E0', padding: '0 10px', display: 'inline-block' }}>MENTOR.</span>
            </div>
          </div>

          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#5A5A5A', lineHeight: 1.8, maxWidth: 600, marginBottom: 48 }}>
            Mirrova isn't a course platform. It's a mirror. We analyze everything about you — your goals, fears, skills, city, college — and give you the brutally honest career intelligence that only privileged students had before. Free. In your language.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { key: 'choosing', num: '01', label: "I don't know what I want", sub: "At the crossroads. Nothing feels right. Let Mirrova simulate 3 possible futures and help you find your direction.", bg: '#D4A842', text: '#1A2118', accent: '#1A2118' },
              { key: 'stuck', num: '02', label: "I'm feeling stuck", sub: "You chose a path. Now you're unsure. Can't go back. Let's find your reality check, your gaps, and your pivot.", bg: '#0B8A80', text: '#EFE9E0', accent: '#D4F1EE' },
              { key: 'rejected', num: '03', label: "I keep getting rejected", sub: "You did everything right. Still no. The real reason exists — let's surface it, fix your resume, and decode the rejection.", bg: '#C3B9E8', text: '#1A0A2E', accent: '#4A3580' },
            ].map(m => (
              <button key={m.key} onClick={() => handleMode(m.key)}
                style={{ background: m.bg, color: m.text, borderRadius: 16, padding: '28px 24px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: m.accent, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>{m.num}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, margin: '0 0 10px', lineHeight: 1.2 }}>{m.label}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, margin: '0 0 20px', opacity: 0.75, lineHeight: 1.6 }}>{m.sub}</p>
                <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: m.accent }}>Start here →</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY MIRROVA ── */}
      <div ref={whyRef} style={{ background: '#1A2118', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Why Mirrova</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 38, color: '#F2E8D1', letterSpacing: '-0.02em', lineHeight: 1 }}>10 TOOLS.</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 36, color: '#0F9E99', letterSpacing: '-0.01em', lineHeight: 1 }}>one mirror.</span>
            </div>
          </div>

          {/* Top 3 featured tools */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 2 }}>
            {[
              { num: '01', title: 'Future Self Simulator', desc: "Chat with 3 AI versions of yourself, 5 years from now. Each has lived a different path. Ask them anything — in Tamil, Hindi, Telugu, Kannada, Bengali or English.", accent: '#0F9E99' },
              { num: '02', title: 'Reality Check + Skills Gap', desc: "Get a brutally honest career readiness score based on your skills, city, college tier and target role. Know exactly where you stand — not where you hope to be.", accent: '#FBA002', dark: true },
              { num: '03', title: 'Resume Intelligence', desc: "Upload your PDF or DOCX. Get an ATS score, 6-second recruiter impression, weak bullets rewritten with impact, and the exact skills you need to add.", accent: '#615091' },
            ].map((f, i) => (
              <div key={f.num} style={{ background: f.dark ? '#313B2F' : '#252E23', padding: '32px', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: i === 0 ? '12px 0 0 0' : i === 2 ? '0 12px 0 0' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{f.num}</p>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${f.accent}18`, border: `1px solid ${f.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.accent }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F2E8D1', margin: '0 0 12px', lineHeight: 1.2 }}>{f.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#B5A98A', margin: 0, lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Row 2 — 4 tools */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginBottom: 2 }}>
            {[
              { title: 'Career SWOT', desc: 'Strengths, weaknesses, opportunities and threats — with a full actionable report.', accent: '#0F9E99' },
              { title: 'Rejection Decoder', desc: 'Find the REAL reason you were rejected — not the polite HR version.', accent: '#722F37' },
              { title: '90-Day Spark Plan', desc: 'Week-by-week action plan built around your specific gaps and time available.', accent: '#FBA002' },
              { title: 'Employability Passport', desc: 'A shareable career profile to send employers instead of a plain resume.', accent: '#615091' },
            ].map((f, i) => (
              <div key={f.title} style={{ background: '#1E2820', padding: '22px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.accent, marginBottom: 12 }} />
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#F2E8D1', margin: '0 0 8px', lineHeight: 1.3 }}>{f.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Row 3 — 3 tools */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 2 }}>
            {[
              { title: 'Skills Assessment', desc: 'Rate yourself on key skills for your target role. See your gaps and what to learn first.', accent: '#0F9E99' },
              { title: 'Pivot Bridge', desc: 'Already in the wrong course? Map your exact step-by-step path from where you are to where you want to be.', accent: '#D4A842' },
              { title: 'Direction Finder', desc: "Don't know what you want? Answer 3 questions and Mirrova suggests 3 career paths that genuinely fit you.", accent: '#C3B9E8' },
            ].map((f, i) => (
              <div key={f.title} style={{ background: '#252E23', padding: '22px', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: i === 0 ? '0 0 0 12px' : i === 2 ? '0 0 12px 0' : 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.accent, marginBottom: 12 }} />
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#F2E8D1', margin: '0 0 8px', lineHeight: 1.3 }}>{f.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#B5A98A', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: 2, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: '3', label: 'Ways to tell us your story — questions, voice or free text' },
              { val: '11', label: 'Deep onboarding questions for fully personalized AI responses' },
              { val: '6', label: 'Indian languages — Tamil, Hindi, Telugu, Kannada, Bengali, English' },
            ].map((s, i) => (
              <div key={s.val} style={{ padding: '28px 32px', borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 44, color: '#0F9E99', lineHeight: 1, flexShrink: 0 }}>{s.val}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', lineHeight: 1.6 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div ref={howRef} style={{ background: '#F5F0E8', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>How it works</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 38, color: '#1A2118', letterSpacing: '-0.02em', lineHeight: 1 }}>FOUR STEPS.</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 36, color: '#722F37', letterSpacing: '-0.01em', lineHeight: 1 }}>total clarity.</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { num: '01', title: 'Tell Mirrova your story — your way', body: "Answer 11 deep questions, speak in your mother tongue, or just type everything freely like you're talking to someone you trust. Mirrova reads your story, understands you, and confirms what it heard before anything starts.", color: '#0F9E99', bg: '#fff' },
              { num: '02', title: 'Meet your future selves', body: 'AI generates 3 versions of you, 5 years from now. Each one has lived a different path. You chat with them in Tamil, Hindi or any of 6 languages. Ask the hard questions. See which one lights you up.', color: '#615091', bg: '#F5F0E8' },
              { num: '03', title: 'Get your complete career intelligence', body: 'Reality Check score. Skills gap analysis. Career SWOT. Resume ATS score. Rejection decoded. All of it personalized to your city, college tier, target role and hours available — not a generic template.', color: '#722F37', bg: '#fff' },
              { num: '04', title: 'Leave with a real plan', body: 'A 90-day Spark Plan built around your specific gaps — with weekly tasks, timelines, and reasons why. An Employability Passport to share with employers. And the clarity to take the next step today.', color: '#FBA002', bg: '#F5F0E8' },
            ].map((s, i) => (
              <div key={s.num} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 0, background: s.bg, border: '0.5px solid rgba(26,33,24,0.08)', borderRadius: i === 0 ? '16px 16px 0 0' : i === 3 ? '0 0 16px 16px' : 0, overflow: 'hidden' }}>
                <div style={{ padding: '40px 32px', borderRight: '0.5px solid rgba(26,33,24,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 48, color: s.color, lineHeight: 1, opacity: 0.15 }}>{s.num}</span>
                </div>
                <div style={{ padding: '40px 44px' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Step {s.num}</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#1A2118', marginBottom: 12, lineHeight: 1.2 }}>{s.title}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#5A5A5A', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={{ background: '#0E1512', padding: '100px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', border: '0.5px solid rgba(15,158,153,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', border: '0.5px solid rgba(15,158,153,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: '#F2E8D1', letterSpacing: '-0.02em', lineHeight: 1 }}>READY TO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: '#F2E8D1', letterSpacing: '-0.02em', lineHeight: 1 }}>MEET</span>
            <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 46, color: '#0F9E99', letterSpacing: '-0.01em', lineHeight: 1 }}>yourself?</span>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#7A6E58', marginBottom: 40, lineHeight: 1.7 }}>
            Free forever. No credit card. In your language. Built for every Indian student.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 40px', cursor: 'pointer' }}>
              Start for free →
            </button>
            <button onClick={() => navigate('/login')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '14px 40px', cursor: 'pointer', color: '#F2E8D1' }}>
              Sign in
            </button>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#3A3A3A', marginTop: 40, letterSpacing: '0.06em' }}>
            FREE TO USE · AI-POWERED · 6 INDIAN LANGUAGES · BUILT FOR STUDENTS
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  )
}