import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function FacultyLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login or signup
  const [form, setForm] = useState({ name: '', email: '', password: '', college_name: '', invite_code: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'login' ? '/api/teacher/login' : '/api/teacher/signup'
      const r = await axios.post(endpoint, form)
      localStorage.setItem('faculty_token', r.data.token)
      localStorage.setItem('faculty', JSON.stringify(r.data.faculty))
      navigate('/faculty/dashboard')
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const input = (name, placeholder, type = 'text') => (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={form[name]}
      onChange={handle}
      style={{ width: '100%', height: 48, borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', padding: '0 16px', fontSize: 14, fontFamily: 'Inter', background: 'rgba(255,255,255,0.05)', color: '#F2E8D1', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
      onFocus={e => e.target.style.borderColor = '#0F9E99'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'Inter' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <svg width="28" height="28" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="28" stroke="#0F9E99" strokeWidth="1.5" fill="none" />
          <path d="M20 36 Q36 18 52 36" stroke="#0F9E99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M20 36 Q36 54 52 36" stroke="#615091" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="36" r="3.5" fill="#0F9E99" />
          <circle cx="36" cy="10" r="2.5" fill="#FBA002" />
        </svg>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F2E8D1' }}>mirrova</span>
        <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#0F9E99', fontWeight: 600, background: 'rgba(15,158,153,0.1)', border: '1px solid rgba(15,158,153,0.25)', borderRadius: 99, padding: '3px 10px' }}>for educators</span>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, background: '#1A2118', borderRadius: 20, padding: '36px', border: '1px solid rgba(255,255,255,0.06)' }}>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F2E8D1', margin: '0 0 6px' }}>
          {mode === 'login' ? 'Welcome back' : 'Join Mirrova'}
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', margin: '0 0 28px', lineHeight: 1.6 }}>
          {mode === 'login' ? 'Sign in to see your classroom insights.' : 'Create your faculty account to track student career readiness.'}
        </p>

        {mode === 'signup' && input('name', 'Your full name')}
        {input('email', 'College email address', 'email')}
        {input('password', 'Password', 'password')}
        {mode === 'signup' && input('college_name', 'College / Institution name')}
        {mode === 'signup' && input('invite_code', 'Invite code (from Mirrova)')}

        {error && (
          <div style={{ background: 'rgba(114,47,55,0.15)', border: '1px solid rgba(114,47,55,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#E88080', margin: 0 }}>{error}</p>
          </div>
        )}

        <button onClick={submit} disabled={loading}
          style={{ width: '100%', fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in →' : 'Create account →'}
        </button>

        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', textAlign: 'center', margin: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, color: '#0F9E99', background: 'none', border: 'none', cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#3A3A3A', marginTop: 24, textAlign: 'center' }}>
        Are you a student?{' '}
        <button onClick={() => navigate('/')}
          style={{ fontFamily: 'Inter', fontSize: 12, color: '#0F9E99', background: 'none', border: 'none', cursor: 'pointer', fontStyle: 'italic', fontWeight: 600 }}>
          Go to Mirrova →
        </button>
      </p>
    </div>
  )
}