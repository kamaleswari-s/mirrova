import { useState, useRef } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function ResumeIntelligence() {
  const { colors: c } = useTheme()
  const navigate = useNavigate()
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdfjsLib = await import('pdfjs-dist/build/pdf')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      fullText += content.items.map(item => item.str).join(' ') + '\n'
    }
    return fullText
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setFileName(file.name)
    try {
      if (file.name.endsWith('.docx')) {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        setResumeText(result.value)
      } else if (file.name.endsWith('.pdf')) {
        const text = await extractPdfText(file)
        setResumeText(text)
      } else {
        const text = await file.text()
        setResumeText(text)
      }
    } catch (err) {
      alert('Error reading file. Try pasting the text instead.')
      setFileName('')
    } finally { setUploading(false) }
  }

  const analyze = async () => {
    if (!resumeText.trim()) return
    setLoading(true)
    try {
      const r = await axios.post('/api/resume/analyze', { resume_text: resumeText })
      setResult(r.data)
      setActiveTab('overview')
    } catch (e) {
      alert(e.response?.data?.error || 'Error analyzing resume')
    } finally { setLoading(false) }
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#0F9E99'
    if (score >= 60) return '#D4A842'
    if (score >= 40) return '#FBA002'
    return '#722F37'
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

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'sections', label: '📋 Sections' },
    { key: 'rewrites', label: '✏️ Rewrites' },
    { key: 'skills', label: '🎯 Skills to Add' },
    { key: 'polish', label: '✨ Polish' },
  ]

  return (
    <div style={{ padding: '40px 48px', color: c.text }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-heading" style={{ fontSize: 32, color: c.text, marginBottom: 8 }}>
          Resume Intelligence
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.textMuted, margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
          Upload your resume. Get a brutally honest analysis, ATS score, rewritten bullets, and exactly what to fix.
        </p>
      </div>

      {!result ? (
        /* INPUT STATE */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* Left */}
          <div style={card()}>
            <p style={lbl()}>Upload or paste your resume</p>

            {/* File upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = c.accent }}
              onDragLeave={e => { e.currentTarget.style.borderColor = c.border }}
              onDrop={async e => {
                e.preventDefault()
                e.currentTarget.style.borderColor = c.border
                const file = e.dataTransfer.files[0]
                if (file) await handleFileUpload({ target: { files: [file] } })
              }}
              style={{ border: `2px dashed ${fileName ? c.accent : c.border}`, borderRadius: 14, padding: '28px', textAlign: 'center', cursor: 'pointer', marginBottom: 20, background: fileName ? `${c.accent}08` : 'transparent', transition: 'all 0.2s' }}>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              {uploading ? (
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.accent, margin: 0, fontWeight: 600 }}>Reading your resume...</p>
              ) : fileName ? (
                <>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>✅</span>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.accent, margin: '0 0 4px', fontWeight: 700 }}>{fileName}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, margin: '0 0 8px' }}>File loaded successfully — review text below</p>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, fontWeight: 600, background: c.bgMid, padding: '4px 12px', borderRadius: 99, border: `1px solid ${c.border}` }}>Click to change file</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>📄</span>
                  <p style={{ fontFamily: 'Inter', fontSize: 15, color: c.text, margin: '0 0 6px', fontWeight: 600 }}>Drop your resume here</p>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.textMuted, margin: '0 0 12px' }}>Supports PDF, DOCX and TXT</p>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.accent, fontWeight: 700, background: `${c.accent}15`, padding: '6px 16px', borderRadius: 99, border: `1px solid ${c.accent}30` }}>Browse files →</span>
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: c.border }} />
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: '0.06em' }}>OR PASTE MANUALLY</span>
              <div style={{ flex: 1, height: 1, background: c.border }} />
            </div>

            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder={`Paste your full resume here...\n\nExample:\nJohn Doe | john@email.com\n\nSUMMARY\nFresh graduate with B.Com degree...\n\nEXPERIENCE\nMarketing Intern | XYZ Company\n- Managed social media accounts\n\nSKILLS\nMS Office, Communication\n\nEDUCATION\nB.Com | Anna University | 2024`}
              rows={14}
              style={{ width: '100%', borderRadius: 12, border: `1.5px solid ${c.border}`, padding: '14px 16px', fontSize: 13, fontFamily: 'Inter', background: c.bgMid, color: c.text, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = c.accent}
              onBlur={e => e.target.style.borderColor = c.border}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted }}>
                {resumeText.length > 0 ? `${resumeText.split(' ').filter(Boolean).length} words` : 'No content yet'}
              </span>
              <button onClick={analyze} disabled={loading || !resumeText.trim()}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', opacity: loading || !resumeText.trim() ? 0.6 : 1 }}>
                {loading ? '⏳ Analyzing...' : 'Analyze my resume →'}
              </button>
            </div>
          </div>

          {/* Right — what you get */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={lbl('#0F9E99')}>What you'll get</p>
              {[
                { icon: '🎯', title: 'ATS Score', desc: 'How well you pass automated screening' },
                { icon: '👁️', title: '6-Second Impression', desc: 'What recruiters think at first glance' },
                { icon: '✏️', title: 'Bullet Rewrites', desc: 'Weak bullets rewritten with impact' },
                { icon: '📊', title: 'Section Analysis', desc: 'Score and feedback per section' },
                { icon: '🚀', title: 'Skills to Add', desc: 'Missing skills ranked by importance' },
                { icon: '✨', title: 'Polish Tips', desc: 'Formatting and presentation fixes' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 5 ? 12 : 0, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#F2E8D1', margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#7A6E58', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={card({ borderLeft: `4px solid #FBA002` })}>
              <p style={lbl('#FBA002')}>Tips for best results</p>
              {[
                'Upload the full resume — not just highlights',
                'DOCX gives the best text extraction',
                'Include target job title if possible',
                'More detail = more accurate analysis',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                  <span style={{ color: '#FBA002', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: c.text, margin: 0, lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* RESULTS STATE */
        <div>
          {/* Score row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Overall Score', value: result.overall_score, color: scoreColor(result.overall_score) },
              { label: 'ATS Score', value: result.ats_score, color: scoreColor(result.ats_score) },
              { label: 'Skills Section', value: result.sections?.skills?.score, color: scoreColor(result.sections?.skills?.score) },
              { label: 'Experience', value: result.sections?.experience?.score, color: scoreColor(result.sections?.experience?.score) },
            ].map(s => (
              <div key={s.label} style={card({ textAlign: 'center' })}>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>
                  {s.value}<span style={{ fontSize: 14, color: c.textMuted }}>/100</span>
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: c.textMuted, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recruiter impression */}
          <div style={{ background: '#1A2118', borderRadius: 16, padding: '24px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={lbl('#FBA002')}>👁️ 6-second recruiter impression</p>
            <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: 16, color: '#F2E8D1', margin: '0 0 16px', lineHeight: 1.6 }}>
              "{result.recruiter_impression}"
            </p>
            <button onClick={() => { setResult(null); setResumeText(''); setFileName('') }}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '9px 20px', cursor: 'pointer' }}>
              ← Analyze new resume
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: c.bgCard, borderRadius: 12, padding: 4, border: `1px solid ${c.border}`, width: 'fit-content' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? c.accent : 'transparent', color: activeTab === tab.key ? '#fff' : c.textMuted, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={card()}>
                  <p style={lbl()}>Top 3 fixes — do these first</p>
                  {result.top_3_fixes?.map((fix, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < 2 ? `1px solid ${c.border}` : 'none', alignItems: 'flex-start' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: fix.impact === 'High' ? '#72203715' : '#FBA00215', border: `1.5px solid ${fix.impact === 'High' ? '#722F37' : '#FBA002'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 13, color: fix.impact === 'High' ? '#722F37' : '#FBA002' }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: c.text, margin: '0 0 4px', lineHeight: 1.4 }}>{fix.fix}</p>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: fix.impact === 'High' ? '#722F37' : '#FBA002', fontWeight: 700, background: fix.impact === 'High' ? '#72203715' : '#FBA00215', padding: '2px 8px', borderRadius: 99 }}>{fix.impact} impact</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={card()}>
                  <p style={lbl('#722F37')}>Missing keywords — add these to pass ATS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {result.missing_keywords?.map((kw, i) => (
                      <span key={i} style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#722F37', background: '#72203715', padding: '5px 12px', borderRadius: 99, border: '1px solid #72203730' }}>
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#1A0A0A', borderRadius: 16, padding: '20px', border: '1px solid rgba(114,47,55,0.3)' }}>
                  <p style={lbl('#722F37')}>💥 Brutal truth</p>
                  <p style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 600, fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>
                    "{result.brutal_truth}"
                  </p>
                </div>

                <div style={card()}>
                  <p style={lbl()}>Section scores</p>
                  {Object.entries(result.sections || {}).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, fontWeight: 600, textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 700, color: scoreColor(val.score) }}>{val.score}</span>
                      </div>
                      <div style={{ height: 5, background: `${c.accent}15`, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${val.score}%`, background: scoreColor(val.score), borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={card()}>
                  <p style={lbl()}>Next steps</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => navigate('/skills')}
                      style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '10px', cursor: 'pointer' }}>
                      Assess my skills →
                    </button>
                    <button onClick={() => navigate('/rejection')}
                      style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '10px', cursor: 'pointer' }}>
                      Decode a rejection →
                    </button>
                    <button onClick={() => navigate('/sparkplan')}
                      style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 13, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '10px', cursor: 'pointer' }}>
                      Build spark plan →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECTIONS */}
          {activeTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(result.sections || {}).map(([key, val]) => (
                <div key={key} style={card({ borderLeft: `4px solid ${scoreColor(val.score)}` })}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: c.text, margin: 0, textTransform: 'capitalize' }}>{key}</p>
                    <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 18, color: scoreColor(val.score) }}>{val.score}/100</span>
                  </div>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: '0 0 12px', lineHeight: 1.6 }}>{val.feedback}</p>
                  {val.top_fix && (
                    <div style={{ background: `${scoreColor(val.score)}10`, borderRadius: 10, padding: '10px 14px', border: `1px solid ${scoreColor(val.score)}25` }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: scoreColor(val.score), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Top fix</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.5 }}>{val.top_fix}</p>
                    </div>
                  )}
                  {val.rewrite && (
                    <div style={{ background: `${c.accent}08`, borderRadius: 10, padding: '10px 14px', border: `1px solid ${c.accent}20`, marginTop: 10 }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: c.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>✨ Suggested rewrite</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{val.rewrite}</p>
                    </div>
                  )}
                  {val.missing_skills && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Missing skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {val.missing_skills.map((s, i) => (
                          <span key={i} style={{ fontFamily: 'Inter', fontSize: 12, color: '#722F37', background: '#72203715', padding: '4px 10px', borderRadius: 99, fontWeight: 600 }}>+ {s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB: REWRITES */}
          {activeTab === 'rewrites' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={card({ background: `${c.accent}08`, border: `1px solid ${c.accent}25` })}>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.6 }}>
                  🎯 Weak bullet points rewritten with <strong>impact, numbers, and action verbs</strong>. Copy these directly into your resume.
                </p>
              </div>
              {result.weak_bullets?.map((bullet, i) => (
                <div key={i} style={card()}>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#722F37', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>❌ Original (weak)</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.textMuted, margin: 0, lineHeight: 1.6, textDecoration: 'line-through', fontStyle: 'italic' }}>{bullet.original}</p>
                  </div>
                  <div style={{ height: 1, background: c.border, marginBottom: 12 }} />
                  <div>
                    <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>✅ Rewritten (strong)</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: '0 0 10px', lineHeight: 1.6, fontWeight: 600 }}>{bullet.rewrite}</p>
                    <button onClick={() => navigator.clipboard.writeText(bullet.rewrite)}
                      style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: c.accent, background: `${c.accent}10`, border: `1px solid ${c.accent}25`, borderRadius: 99, padding: '5px 14px', cursor: 'pointer' }}>
                      Copy →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SKILLS TO ADD */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={card({ background: '#1A2118', border: '1px solid rgba(255,255,255,0.06)' })}>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>
                  These are skills missing from your resume that employers in your target field actively look for. Ranked by impact.
                </p>
              </div>
              {result.skills_to_add?.map((skill, i) => (
                <div key={i} style={card({ borderLeft: `4px solid ${c.accent}` })}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: c.accent, margin: 0 }}>{skill.skill}</p>
                    <span style={{ fontFamily: 'Inter', fontSize: 12, color: c.textMuted, background: c.bgMid, padding: '4px 12px', borderRadius: 99, border: `1px solid ${c.border}`, flexShrink: 0, marginLeft: 12 }}>⏱ {skill.how_long}</span>
                  </div>
                  <p style={{ fontFamily: 'Inter', fontSize: 13, color: c.text, margin: 0, lineHeight: 1.6 }}>{skill.why}</p>
                </div>
              ))}
              <button onClick={() => navigate('/skills')}
                style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '13px', cursor: 'pointer', width: '100%', marginTop: 8 }}>
                Rate my current skills →
              </button>
            </div>
          )}

          {/* TAB: POLISH */}
          {activeTab === 'polish' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={card({ background: '#1A2118', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 })}>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.6 }}>
                  ✨ These polish tips will make your resume look more professional and stand out visually.
                </p>
              </div>
              {result.polish_tips?.map((tip, i) => (
                <div key={i} style={card({ display: 'flex', alignItems: 'flex-start', gap: 14 })}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.accent}15`, border: `1.5px solid ${c.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 13, color: c.accent }}>{i + 1}</span>
                  </div>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: c.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{tip}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => navigate('/swot')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: c.accent, color: c.accentText, border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
                  Career SWOT →
                </button>
                <button onClick={() => navigate('/rejection')}
                  style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer' }}>
                  Decode a rejection →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}