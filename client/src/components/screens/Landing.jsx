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
          <path d="M 200 200 Q 400 100 600 200 Q 800 300 1000 200 Q 1200 100 1400 200" stroke="#0F9E99" strokeWidth="0.3" fill="none" opacity="0.5" />
          <path d="M 200 700 Q 400 800 600 700 Q 800 600 1000 700 Q 1200 800 1400 700" stroke="#615091" strokeWidth="0.3" fill="none" opacity="0.5" />
        </svg>

        {/* ── NAV — ONLY THING CHANGED ── */}
        <nav style={{ display: 'flex', alignItems: 'center', padding: '0 72px', height: 68, position: 'relative', zIndex: 10, flexShrink: 0, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>

          {/* Left — logo icon + mirrova name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <svg width="28" height="28" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1.5" fill="none" />
              <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
              <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
            </svg>
            <span style={{ fontFamily: 'Moldie, serif', fontSize: 26, color: '#F2E8D1' }}>mirrova</span>
          </div>

          {/* Center — nav links */}
          <div style={{ display: 'flex', gap: 40, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {[['About', aboutRef], ['Why Mirrova', whyRef], ['How it works', howRef]].map(([label, ref]) => (
              <button key={label} onClick={() => ref.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#8A7E6A', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', transition: 'color 0.15s', textTransform: 'uppercase' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F2E8D1'}
                onMouseLeave={e => e.currentTarget.style.color = '#8A7E6A'}
              >{label}</button>
            ))}
          </div>

          {/* Right — buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <button onClick={() => navigate('/login')}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#F2E8D1', background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '8px 22px', cursor: 'pointer' }}>
              Sign in
            </button>
            <button onClick={() => navigate('/signup')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '9px 22px', cursor: 'pointer' }}>
              Get started free →
            </button>
          </div>
        </nav>

        {/* Hero content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 72px', position: 'relative', zIndex: 10 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,158,153,0.1)', border: '1px solid rgba(15,158,153,0.25)', borderRadius: 99, padding: '6px 16px', marginBottom: 40 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F9E99' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Career Intelligence</span>
          </div>

          {/* Logo */}
          <svg width="110" height="110" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 28 }}>
            <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1" fill="none" />
            <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
            <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
          </svg>

          {/* Headline */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#F2E8D1', letterSpacing: '-0.03em', lineHeight: 1 }}>YOU'VE BEEN</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#F2E8D1', letterSpacing: '-0.03em', lineHeight: 1 }}>TOLD TO</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 50, color: '#0F9E99', letterSpacing: '-0.02em', lineHeight: 1 }}>plan.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#F2E8D1', letterSpacing: '-0.03em', lineHeight: 1 }}>NOBODY SHOWED YOU HOW TO&nbsp;</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 50, color: '#0F9E99', letterSpacing: '-0.02em', lineHeight: 1 }}>see.</span>
            </div>
          </div>

          <p style={{ fontFamily: 'Inter', fontSize: 17, color: '#8A7E6A', lineHeight: 1.75, marginBottom: 48, maxWidth: 520 }}>
            Talk to your future self. Find your blind spots. Build your bridge — from exactly where you are right now.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 36px', cursor: 'pointer' }}>
              See my future →
            </button>
            <button onClick={() => handleMode('stuck')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '14px 36px', cursor: 'pointer', color: '#F2E8D1' }}>
              I already chose wrong
            </button>
          </div>

          <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
            style={{ marginTop: 64, fontFamily: 'Inter', fontSize: 12, color: '#4A4A4A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>Scroll</span>
            <span style={{ animation: 'bounceDown 1.5s infinite' }}>↓</span>
          </button>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div ref={aboutRef} style={{ background: '#F5F0E8', padding: '120px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 56, color: '#1A2118', letterSpacing: '-0.02em', lineHeight: 1 }}>EVERY STUDENT</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 52, color: '#0F9E99', letterSpacing: '-0.01em', lineHeight: 1 }}>deserves</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 56, color: '#1A2118', letterSpacing: '-0.02em', lineHeight: 1 }}>TO SEE THEIR</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 56, letterSpacing: '-0.02em', lineHeight: 1, background: '#0F9E99', color: '#EFE9E0', padding: '0 12px', display: 'inline-block' }}>FUTURE.</span>
            </div>
          </div>

          <p style={{ fontFamily: 'Inter', fontSize: 17, color: '#5A5A5A', lineHeight: 1.8, maxWidth: 620, marginBottom: 56 }}>
            Mirrova isn't a course platform. It's a mirror. We simulate who you become across 3 different paths — so you can make the most important decision of your life with actual clarity, not just hope.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { key: 'choosing', num: '01', label: "I'm choosing my path", sub: "At the crossroads. Every option feels right — and wrong. Let's simulate all of them.", bg: '#D4A842', text: '#1A2118', accent: '#1A2118' },
              { key: 'stuck', num: '02', label: "I'm feeling stuck", sub: "You chose. Now you're not sure. Can't go back. Let's find your pivot.", bg: '#0B8A80', text: '#EFE9E0', accent: '#D4F1EE' },
              { key: 'rejected', num: '03', label: "I keep getting rejected", sub: "You did everything right. Still no. The reason exists — let's surface it.", bg: '#C3B9E8', text: '#1A0A2E', accent: '#4A3580' },
            ].map(m => (
              <button key={m.key} onClick={() => handleMode(m.key)}
                style={{ background: m.bg, color: m.text, borderRadius: 16, padding: '32px 28px', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: m.accent, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>{m.num}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 10px', lineHeight: 1.2 }}>{m.label}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, margin: '0 0 24px', opacity: 0.75, lineHeight: 1.6 }}>{m.sub}</p>
                <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: m.accent }}>Start here →</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY MIRROVA ── */}
      <div ref={whyRef} style={{ background: '#1A2118', padding: '120px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 72 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Why Mirrova</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#F2E8D1', letterSpacing: '-0.02em', lineHeight: 1 }}>THREE TOOLS.</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: '#0F9E99', letterSpacing: '-0.01em', lineHeight: 1 }}>one clarity.</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              { num: '01', title: 'Future Self Simulator', desc: "Chat with 3 AI versions of yourself, 5 years from now. They've lived your choices. Ask them anything — the hard questions, the regrets, the wins.", accent: '#0F9E99' },
              { num: '02', title: 'Blind Spot Detector', desc: "Upload your resume. Get the 6-second recruiter impression nobody tells you. Surface the invisible gaps silently holding you back — with exact 30-day fixes.", accent: '#FBA002', dark: true },
              { num: '03', title: 'Pivot Bridge', desc: "Already in the wrong course? We show you what transfers, what to build, and exactly how long it takes — from where you are right now.", accent: '#615091' },
            ].map((f, i) => (
              <div key={f.num} style={{ background: f.dark ? '#313B2F' : '#252E23', padding: '40px 32px', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: i === 0 ? '12px 0 0 12px' : i === 2 ? '0 12px 12px 0' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A4A', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{f.num}</p>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${f.accent}18`, border: `1px solid ${f.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.accent }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F2E8D1', margin: '0 0 14px', lineHeight: 1.2 }}>{f.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', margin: 0, lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: 2, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: '3', label: 'Future selves simulated per user' },
              { val: '6', label: 'Questions to get started' },
              { val: '90', label: 'Day personalised action plan' },
            ].map((s, i) => (
              <div key={s.val} style={{ padding: '32px', borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', gap: 20, alignItems: 'center' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 56, color: '#0F9E99', lineHeight: 1, flexShrink: 0 }}>{s.val}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#4A4A4A', lineHeight: 1.6 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div ref={howRef} style={{ background: '#F5F0E8', padding: '120px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 72 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>How it works</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 52, color: '#1A2118', letterSpacing: '-0.02em', lineHeight: 1 }}>THREE STEPS.</span>
              <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 48, color: '#722F37', letterSpacing: '-0.01em', lineHeight: 1 }}>total clarity.</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { num: '01', title: 'Tell Mirrova where you are', body: 'Six honest questions. No forms, no dropdowns, no overwhelm. Just a real conversation about where you are and where you want to go. Takes 3 minutes.', color: '#0F9E99', bg: '#fff' },
              { num: '02', title: 'Meet your future selves', body: 'AI generates 3 versions of you, 5 years from now. Each one has lived a different path. You chat with them. Ask them the hard questions. See which one lights you up.', color: '#615091', bg: '#F5F0E8' },
              { num: '03', title: 'Leave with a plan', body: 'Blind spots exposed. Pivot bridge mapped. 90-day action plan generated. You walk out knowing exactly what to do tomorrow — not someday.', color: '#722F37', bg: '#fff' },
            ].map((s, i) => (
              <div key={s.num} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 0, background: s.bg, border: '0.5px solid rgba(26,33,24,0.08)', borderRadius: i === 0 ? '16px 16px 0 0' : i === 2 ? '0 0 16px 16px' : 0, overflow: 'hidden' }}>
                <div style={{ padding: '48px 40px', borderRight: '0.5px solid rgba(26,33,24,0.08)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 64, color: s.color, lineHeight: 1, opacity: 0.15 }}>{s.num}</span>
                </div>
                <div style={{ padding: '48px 52px' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Step {s.num}</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#1A2118', marginBottom: 16, lineHeight: 1.2 }}>{s.title}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#5A5A5A', lineHeight: 1.8 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={{ background: '#0E1512', padding: '140px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '0.5px solid rgba(15,158,153,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', border: '0.5px solid rgba(15,158,153,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 64, color: '#F2E8D1', letterSpacing: '-0.02em', lineHeight: 1 }}>READY TO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 40 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 64, color: '#F2E8D1', letterSpacing: '-0.02em', lineHeight: 1 }}>MEET</span>
            <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 700, fontSize: 60, color: '#0F9E99', letterSpacing: '-0.01em', lineHeight: 1 }}>yourself?</span>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#7A6E58', marginBottom: 52, lineHeight: 1.7 }}>
            Free forever. No credit card. Just clarity.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '16px 48px', cursor: 'pointer' }}>
              Start for free →
            </button>
            <button onClick={() => navigate('/login')}
              style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 99, padding: '16px 48px', cursor: 'pointer', color: '#F2E8D1' }}>
              Sign in
            </button>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#3A3A3A', marginTop: 48, letterSpacing: '0.06em' }}>
            FREE TO USE · AI-POWERED · BUILT FOR STUDENTS
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