import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

function getStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#E24B4A', '#FBA002', '#0F9E99', '#38683D']

const rules = [
  { test: pw => pw.length >= 8, label: 'At least 8 characters' },
  { test: pw => /[A-Z]/.test(pw), label: 'One uppercase letter' },
  { test: pw => /[0-9]/.test(pw), label: 'One number' },
  { test: pw => /[^A-Za-z0-9]/.test(pw), label: 'One special character (!@#$...)' },
]

function BrandPanel() {
  return (
    <div style={{
      width: '45%', minHeight: '100vh', flexShrink: 0,
      background: '#0E1512',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '48px 52px',
      position: 'relative', overflow: 'hidden'
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }} viewBox="0 0 600 900" fill="none">
        <circle cx="300" cy="450" r="320" stroke="#0F9E99" strokeWidth="0.5" />
        <circle cx="300" cy="450" r="220" stroke="#0F9E99" strokeWidth="0.5" />
        <circle cx="300" cy="450" r="120" stroke="#0F9E99" strokeWidth="0.5" />
        <path d="M 80 450 Q 300 150 520 450" stroke="#0F9E99" strokeWidth="0.8" fill="none" />
        <path d="M 80 450 Q 300 750 520 450" stroke="#615091" strokeWidth="0.8" fill="none" />
        <circle cx="300" cy="140" r="4" fill="#FBA002" opacity="0.8" />
        <circle cx="300" cy="450" r="6" fill="#0F9E99" opacity="0.5" />
        <line x1="300" y1="50" x2="300" y2="860" stroke="#0F9E99" strokeWidth="0.3" strokeDasharray="4 10" />
      </svg>

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 44, color: '#F2E8D1', letterSpacing: '0.01em' }}>mirrova</span>
      </div>

      {/* Center */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <svg width="96" height="96" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 32 }}>
          <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1.2" fill="none" />
          <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
          <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
        </svg>

        <h2 style={{ fontFamily: 'Moldie, serif', fontSize: 48, color: '#F2E8D1', lineHeight: 1.2, marginBottom: 16 }}>
          See who you're <span style={{ color: '#0F9E99' }}>becoming.</span>
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#B5A98A', lineHeight: 1.75, marginBottom: 40 }}>
          Talk to your future self. Find your blind spots. Build your bridge from exactly where you are.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '◈', text: 'Future Self Simulator', sub: 'Chat with 3 AI versions of you' },
            { icon: '◉', text: 'Blind Spot Detector', sub: "Find what's silently holding you back" },
            { icon: '⇌', text: 'Pivot Bridge', sub: 'Build your path from where you are' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.09)' }}>
              <span style={{ fontSize: 18, color: '#0F9E99', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#F2E8D1', margin: '0 0 2px' }}>{f.text}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#8A7E6A', margin: 0 }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom quote */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, color: '#6A6050', lineHeight: 1.7, borderLeft: '2px solid #0F9E9940', paddingLeft: 16 }}>
          "The best time to think about your future was yesterday. The second best time is right now."
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', height: 48, borderRadius: 12,
  border: '1.5px solid rgba(26,33,24,0.2)',
  padding: '0 16px', fontSize: 14,
  fontFamily: 'Inter', background: '#fff',
  color: '#1A2118', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s'
}

const labelStyle = {
  fontFamily: 'Inter', fontSize: 12, color: '#1A2118',
  display: 'block', marginBottom: 6,
  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em'
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      login(res.data.token, res.data.user)
      navigate(res.data.user.onboarding_complete === false ? '/onboarding' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <BrandPanel />
      <div style={{ flex: 1, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <h2 style={{ fontFamily: 'Moldie, serif', fontSize: 48, color: '#1A2118', marginBottom: 8, lineHeight: 1.1 }}>
            Welcome back.
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#4A4A4A', marginBottom: 36, fontWeight: 500 }}>
            Your future self is waiting.
          </p>

          {error && (
            <div style={{ background: '#FAECE7', color: '#712B13', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20, fontFamily: 'Inter', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@university.edu" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0F9E99'}
                onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.2)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0F9E99'}
                onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.2)'}
              />
            </div>
            <button type="submit" disabled={loading}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign me in →'}
            </button>
          </form>

          <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A', textAlign: 'center', marginTop: 24, fontWeight: 500 }}>
            No account?{' '}
            <Link to="/signup" style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, color: '#0F9E99', textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const strength = getStrength(password)
  const passwordsMatch = confirm && password === confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match')
    if (strength < 2) return setError('Please use a stronger password')
    setError('')
    setLoading(true)
    const mode = sessionStorage.getItem('mirrova_mode') || 'choosing'
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password, mode })
      login(res.data.token, res.data.user)
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <BrandPanel />
      <div style={{ flex: 1, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <h2 style={{ fontFamily: 'Moldie, serif', fontSize: 48, color: '#1A2118', marginBottom: 8, lineHeight: 1.1 }}>
            Start your journey.
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#4A4A4A', marginBottom: 36, fontWeight: 500 }}>
            Free forever. No credit card.
          </p>

          {error && (
            <div style={{ background: '#FAECE7', color: '#712B13', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20, fontFamily: 'Inter', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={labelStyle}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Your name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0F9E99'}
                onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.2)'}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@university.edu" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0F9E99'}
                onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.2)'}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password}
                onChange={e => { setPassword(e.target.value); setShowRules(true) }}
                required placeholder="Min 8 characters" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0F9E99'; setShowRules(true) }}
                onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.2)'}
              />
              {password && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= strength ? strengthColor[strength] : 'rgba(26,33,24,0.12)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: strengthColor[strength], fontWeight: 700, margin: 0 }}>
                    Strength: {strengthLabel[strength]}
                  </p>
                </div>
              )}
              {showRules && (
                <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(26,33,24,0.1)', marginTop: 8 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: '#1A2118', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Password must have:</p>
                  {rules.map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: r.test(password) ? '#0F9E99' : '#C0B8A8', fontWeight: 700 }}>
                        {r.test(password) ? '✓' : '○'}
                      </span>
                      <span style={{ fontFamily: 'Inter', fontSize: 12, color: r.test(password) ? '#1A2118' : '#7A7A7A', fontWeight: r.test(password) ? 600 : 400 }}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                placeholder="Same password again"
                style={{ ...inputStyle, borderColor: confirm ? (passwordsMatch ? '#0F9E99' : '#E24B4A') : 'rgba(26,33,24,0.2)' }}
              />
              {confirm && (
                <p style={{ fontFamily: 'Inter', fontSize: 12, color: passwordsMatch ? '#0F9E99' : '#E24B4A', fontWeight: 700, margin: '6px 0 0' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading || (confirm && !passwordsMatch)}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#FBA002', color: '#1A2118', border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', marginTop: 4, opacity: loading || (confirm && !passwordsMatch) ? 0.6 : 1 }}>
              {loading ? 'Creating account...' : 'Create my account →'}
            </button>
          </form>

          <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#4A4A4A', textAlign: 'center', marginTop: 24, fontWeight: 500 }}>
            Already have one?{' '}
            <Link to="/login" style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, color: '#0F9E99', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login