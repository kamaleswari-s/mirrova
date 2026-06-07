import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { THEMES } from '../../context/ThemeContext'

const languages = [
  { key: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
  { key: 'Hindi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { key: 'Tamil', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { key: 'Telugu', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { key: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { key: 'Bengali', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
]

const getQuestions = (lang) => {
  const q = {
    English: [
      { key: 'current_field', q: "What are you currently studying or working in?", ph: "e.g. Computer Science, B.Com, Mechanical Engineering..." },
      { key: 'dream_direction', q: "What do you actually want to do? Be honest.", ph: "e.g. I want to work in UX design, start a business..." },
      { key: 'top_skill', q: "What's one thing you're genuinely good at?", ph: "e.g. I'm really good at explaining complex things simply..." },
      { key: 'biggest_fear', q: "What scares you most about your future?", ph: "e.g. Wasting my degree, not getting placed..." },
      { key: 'recent_rejection', q: "Have you faced any rejection recently? Tell me what happened.", ph: "e.g. I got rejected from 3 internships... (skip if not applicable)" },
      { key: 'success_vision', q: "What does success look like to you in 5 years?", ph: "e.g. Working on products I care about, earning well..." },
      { key: 'city', q: "Which city or state are you from?", ph: "e.g. Chennai, Hyderabad, Pune, rural Bihar..." },
      { key: 'education_level', q: "What's your education level and type of college?", ph: "e.g. B.Tech 3rd year at a private college in Tamil Nadu..." },
      { key: 'hours_per_day', q: "How many hours per day can you realistically commit to upskilling?", ph: "e.g. 1 hour on weekdays, 3 hours on weekends..." },
      { key: 'built_anything', q: "Have you ever built anything — project, app, business, event?", ph: "e.g. Built a small e-commerce site, organised a college fest..." },
      { key: 'biggest_blocker', q: "What's the single biggest thing blocking you right now — be completely honest.", ph: "e.g. I don't know where to start, my parents want govt jobs..." },
      { key: 'college_name', q: "What's the name of your college or institution?", ph: "e.g. Anna University, Sri Venkateswara College, IIT Madras..." },
    ],
    Hindi: [
      { key: 'current_field', q: "आप अभी क्या पढ़ रहे हैं या काम कर रहे हैं?", ph: "जैसे: Computer Science, B.Com..." },
      { key: 'dream_direction', q: "आप असल में क्या करना चाहते हैं? सच बताइए।", ph: "जैसे: मैं UX design में काम करना चाहता/चाहती हूं..." },
      { key: 'top_skill', q: "एक चीज़ जो आप सच में अच्छे से करते हैं?", ph: "जैसे: मैं complex चीज़ें आसानी से समझा सकता हूं..." },
      { key: 'biggest_fear', q: "आपके भविष्य के बारे में सबसे बड़ा डर क्या है?", ph: "जैसे: degree बेकार हो जाएगी..." },
      { key: 'recent_rejection', q: "क्या हाल ही में कोई rejection मिली?", ph: "जैसे: 3 internships में reject हुआ..." },
      { key: 'success_vision', q: "5 साल बाद success कैसी दिखती है?", ph: "जैसे: अच्छा काम, अच्छी कमाई..." },
      { key: 'city', q: "आप किस शहर या राज्य से हैं?", ph: "जैसे: दिल्ली, पटना, लखनऊ..." },
      { key: 'education_level', q: "आपकी शिक्षा का स्तर और college का प्रकार?", ph: "जैसे: B.Tech 3rd year, private college..." },
      { key: 'hours_per_day', q: "आप प्रतिदिन कितने घंटे upskilling के लिए दे सकते हैं?", ph: "जैसे: 1-2 घंटे..." },
      { key: 'built_anything', q: "क्या आपने कभी कुछ बनाया है?", ph: "जैसे: website, college fest..." },
      { key: 'biggest_blocker', q: "अभी आपको सबसे ज़्यादा क्या रोक रहा है?", ph: "जैसे: शुरू कहाँ से करूं समझ नहीं आता..." },
      { key: 'college_name', q: "आपके college का नाम क्या है?", ph: "जैसे: Delhi University, IIT Delhi..." },
    ],
    Tamil: [
      { key: 'current_field', q: "நீங்கள் இப்போது என்ன படிக்கிறீர்கள்?", ph: "எ.கா: Computer Science, B.Com..." },
      { key: 'dream_direction', q: "நீங்கள் உண்மையில் என்ன செய்ய விரும்புகிறீர்கள்?", ph: "எ.கா: UX design-ல் வேலை செய்ய விரும்புகிறேன்..." },
      { key: 'top_skill', q: "நீங்கள் உண்மையில் நன்றாக செய்யும் ஒரு விஷயம்?", ph: "எ.கா: விஷயங்களை எளிமையாக விளக்க முடியும்..." },
      { key: 'biggest_fear', q: "உங்கள் எதிர்காலத்தில் உங்களுக்கு மிகவும் பயமாக இருப்பது?", ph: "எ.கா: படிப்பு வீண் ஆகும்..." },
      { key: 'recent_rejection', q: "சமீபத்தில் ஏதாவது rejection கிடைத்ததா?", ph: "எ.கா: 3 internships-ல் reject ஆனேன்..." },
      { key: 'success_vision', q: "5 ஆண்டுகளில் வெற்றி உங்களுக்கு எப்படி தெரிகிறது?", ph: "எ.கா: நல்ல வேலை, நல்ல சம்பளம்..." },
      { key: 'city', q: "நீங்கள் எந்த நகரம் அல்லது மாநிலத்தில் இருந்து வருகிறீர்கள்?", ph: "எ.கா: Chennai, Coimbatore..." },
      { key: 'education_level', q: "உங்கள் கல்வி நிலை மற்றும் கல்லூரி வகை?", ph: "எ.கா: B.Tech 3rd year, private college..." },
      { key: 'hours_per_day', q: "நீங்கள் ஒரு நாளில் எத்தனை மணி நேரம் ஒதுக்க முடியும்?", ph: "எ.கா: 1-2 மணி நேரம்..." },
      { key: 'built_anything', q: "நீங்கள் எப்போதாவது ஏதாவது உருவாக்கினீர்களா?", ph: "எ.கா: website, college fest..." },
      { key: 'biggest_blocker', q: "இப்போது உங்களை மிகவும் தடுப்பது என்ன?", ph: "எ.கா: எங்கிருந்து தொடங்குவது தெரியவில்லை..." },
      { key: 'college_name', q: "உங்கள் கல்லூரியின் பெயர் என்ன?", ph: "எ.கா: Anna University, PSG College..." },
    ],
    Telugu: [
      { key: 'current_field', q: "మీరు ప్రస్తుతం ఏమి చదువుతున్నారు?", ph: "ఉదా: Computer Science, B.Com..." },
      { key: 'dream_direction', q: "మీరు నిజంగా ఏమి చేయాలనుకుంటున్నారు?", ph: "ఉదా: UX design లో పని చేయాలి..." },
      { key: 'top_skill', q: "మీరు నిజంగా బాగా చేసే ఒక విషయం?", ph: "ఉదా: విషయాలు సులభంగా వివరించగలను..." },
      { key: 'biggest_fear', q: "మీ భవిష్యత్తు గురించి అత్యంత భయం ఏమిటి?", ph: "ఉదా: డిగ్రీ వృధా అవుతుంది..." },
      { key: 'recent_rejection', q: "ఇటీవల rejection వచ్చిందా?", ph: "ఉదా: 3 internships లో reject అయ్యాను..." },
      { key: 'success_vision', q: "5 సంవత్సరాలలో success ఎలా కనిపిస్తుంది?", ph: "ఉదా: మంచి పని, మంచి జీతం..." },
      { key: 'city', q: "మీరు ఏ నగరం నుండి వచ్చారు?", ph: "ఉదా: Hyderabad, Vijayawada..." },
      { key: 'education_level', q: "మీ విద్యా స్థాయి మరియు కళాశాల రకం?", ph: "ఉదా: B.Tech 3rd year..." },
      { key: 'hours_per_day', q: "రోజుకు ఎన్ని గంటలు upskilling కి కేటాయించగలరు?", ph: "ఉదా: 1-2 గంటలు..." },
      { key: 'built_anything', q: "మీరు ఏదైనా నిర్మించారా?", ph: "ఉదా: website, event..." },
      { key: 'biggest_blocker', q: "ఇప్పుడు మిమ్మల్ని ఆపుతున్నది ఏమిటి?", ph: "ఉదా: ఎక్కడ నుండి మొదలుపెట్టాలో తెలియదు..." },
      { key: 'college_name', q: "మీ కళాశాల పేరు ఏమిటి?", ph: "ఉదా: Osmania University, JNTU..." },
    ],
    Kannada: [
      { key: 'current_field', q: "ನೀವು ಈಗ ಏನು ಓದುತ್ತಿದ್ದೀರಿ?", ph: "ಉದಾ: Computer Science, B.Com..." },
      { key: 'dream_direction', q: "ನೀವು ನಿಜವಾಗಿ ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?", ph: "ಉದಾ: UX design ನಲ್ಲಿ ಕೆಲಸ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ..." },
      { key: 'top_skill', q: "ನೀವು ನಿಜವಾಗಿ ಚೆನ್ನಾಗಿ ಮಾಡುವ ಒಂದು ವಿಷಯ?", ph: "ಉದಾ: ವಿಷಯಗಳನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಬಲ್ಲೆ..." },
      { key: 'biggest_fear', q: "ನಿಮ್ಮ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅತ್ಯಂತ ಭಯ?", ph: "ಉದಾ: ಪದವಿ ವ್ಯರ್ಥ ಆಗುತ್ತದೆ..." },
      { key: 'recent_rejection', q: "ಇತ್ತೀಚೆಗೆ rejection ಬಂದಿದೆಯೇ?", ph: "ಉದಾ: 3 internships ನಲ್ಲಿ reject ಆದೆ..." },
      { key: 'success_vision', q: "5 ವರ್ಷಗಳಲ್ಲಿ success ಹೇಗೆ ಕಾಣಿಸುತ್ತದೆ?", ph: "ಉದಾ: ಒಳ್ಳೆಯ ಕೆಲಸ, ಒಳ್ಳೆಯ ಸಂಬಳ..." },
      { key: 'city', q: "ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?", ph: "ಉದಾ: Bangalore, Mysuru..." },
      { key: 'education_level', q: "ನಿಮ್ಮ ಶಿಕ್ಷಣ ಮಟ್ಟ ಮತ್ತು ಕಾಲೇಜಿನ ಪ್ರಕಾರ?", ph: "ಉದಾ: B.Tech 3rd year..." },
      { key: 'hours_per_day', q: "ದಿನಕ್ಕೆ ಎಷ್ಟು ಗಂಟೆ upskilling ಗೆ ಮೀಸಲಿಡಬಹುದು?", ph: "ಉದಾ: 1-2 ಗಂಟೆ..." },
      { key: 'built_anything', q: "ನೀವು ಏನಾದರೂ ನಿರ್ಮಿಸಿದ್ದೀರಾ?", ph: "ಉದಾ: website, event..." },
      { key: 'biggest_blocker', q: "ಈಗ ನಿಮ್ಮನ್ನು ಅತ್ಯಂತ ತಡೆಯುತ್ತಿರುವುದು?", ph: "ಉದಾ: ಎಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸಬೇಕೆಂದು ತಿಳಿಯುತ್ತಿಲ್ಲ..." },
      { key: 'college_name', q: "ನಿಮ್ಮ ಕಾಲೇಜಿನ ಹೆಸರು ಏನು?", ph: "ಉದಾ: Bangalore University, VTU..." },
    ],
    Bengali: [
      { key: 'current_field', q: "আপনি এখন কী পড়ছেন?", ph: "যেমন: Computer Science, B.Com..." },
      { key: 'dream_direction', q: "আপনি আসলে কী করতে চান?", ph: "যেমন: UX design-এ কাজ করতে চাই..." },
      { key: 'top_skill', q: "একটি জিনিস যা আপনি সত্যিই ভালো করেন?", ph: "যেমন: জটিল বিষয় সহজে বোঝাতে পারি..." },
      { key: 'biggest_fear', q: "আপনার ভবিষ্যৎ নিয়ে সবচেয়ে বড় ভয়?", ph: "যেমন: ডিগ্রি নষ্ট হবে..." },
      { key: 'recent_rejection', q: "সম্প্রতি কোনো rejection পেয়েছেন?", ph: "যেমন: 3টি internship-এ reject হয়েছি..." },
      { key: 'success_vision', q: "৫ বছরে success কেমন দেখায়?", ph: "যেমন: ভালো কাজ, ভালো আয়..." },
      { key: 'city', q: "আপনি কোন শহর থেকে এসেছেন?", ph: "যেমন: Kolkata, Dhanbad..." },
      { key: 'education_level', q: "আপনার শিক্ষার স্তর এবং কলেজের ধরন?", ph: "যেমন: B.Tech 3rd year..." },
      { key: 'hours_per_day', q: "প্রতিদিন কত ঘণ্টা upskilling-এ দিতে পারবেন?", ph: "যেমন: 1-2 ঘণ্টা..." },
      { key: 'built_anything', q: "কি কখনো কিছু তৈরি করেছেন?", ph: "যেমন: website, event..." },
      { key: 'biggest_blocker', q: "এখন সবচেয়ে বেশি কী আটকাচ্ছে?", ph: "যেমন: কোথা থেকে শুরু করব বুঝতে পারছি না..." },
      { key: 'college_name', q: "আপনার কলেজের নাম কী?", ph: "যেমন: Calcutta University, Jadavpur..." },
    ],
  }
  return q[lang] || q['English']
}

export default function Onboarding() {
  const [phase, setPhase] = useState('language')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('ivory')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [selectedMode, setSelectedMode] = useState('')
  const [loading, setLoading] = useState(false)
  const [heartDump, setHeartDump] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const questions = getQuestions(selectedLanguage)

  const handleNext = () => {
    if (!current.trim() && questions[step].key !== 'recent_rejection' && questions[step].key !== 'built_anything') return
    const newAnswers = { ...answers, [questions[step].key]: current }
    setAnswers(newAnswers)
    setCurrent('')
    if (step < questions.length - 1) {
      setStep(s => s + 1)
    } else {
      setPhase('theme')
    }
  }

  const extractFromText = async (text) => {
    setExtracting(true)
    try {
      const r = await axios.post('/api/onboarding/extract', { text, language: selectedLanguage })
      setExtracted(r.data)
      setPhase('align')
    } catch (e) {
      alert('Error extracting profile. Please try again.')
    } finally { setExtracting(false) }
  }

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Please use Chrome.')
      return
    }
    const langMap = {
      English: 'en-IN', Hindi: 'hi-IN', Tamil: 'ta-IN',
      Telugu: 'te-IN', Kannada: 'kn-IN', Bengali: 'bn-IN'
    }
    const recognition = new SpeechRecognition()
    recognition.lang = langMap[selectedLanguage] || 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + ' '
      }
      setTranscript(full)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const handleFinish = async (profileData) => {
    setLoading(true)
    try {
      await axios.post('/api/onboarding/save', {
        ...profileData,
        preferred_language: selectedLanguage,
        college_name: profileData.college_name || answers.college_name || ''
      })
      await axios.patch('/api/auth/theme', { theme: selectedTheme })
      updateUser({ theme: selectedTheme, onboarding_complete: true, preferred_language: selectedLanguage })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const langNative = languages.find(l => l.key === selectedLanguage)?.native || 'English'

  // ── LANGUAGE PICKER ──
  if (phase === 'language') return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 580, width: '100%' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 28, color: '#F2E8D1', display: 'block', marginBottom: 40 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: '#F2E8D1', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Which language do you think in?
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#7A6E58', marginBottom: 36, lineHeight: 1.6, fontWeight: 500 }}>
          Your questions, your future self, your plan — all in your language.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {languages.map(lang => (
            <button key={lang.key} onClick={() => setSelectedLanguage(lang.key)}
              style={{ background: selectedLanguage === lang.key ? 'rgba(15,158,153,0.15)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${selectedLanguage === lang.key ? '#0F9E99' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: '20px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{lang.flag}</span>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: selectedLanguage === lang.key ? '#0F9E99' : '#F2E8D1', margin: '0 0 4px' }}>{lang.label}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: 0 }}>{lang.native}</p>
            </button>
          ))}
        </div>
        <button onClick={() => setPhase('mode')}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 48px', cursor: 'pointer', width: '100%' }}>
          Continue in {langNative} →
        </button>
      </div>
    </div>
  )

  // ── MODE PICKER ──
  if (phase === 'mode') return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 620, width: '100%' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 28, color: '#F2E8D1', display: 'block', marginBottom: 40 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#F2E8D1', marginBottom: 8, letterSpacing: '-0.02em' }}>
          How do you want to tell us about yourself?
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#7A6E58', marginBottom: 36, lineHeight: 1.6, fontWeight: 500 }}>
          Choose what feels most natural to you. All 3 give us the same result — your personalized career intelligence.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {[
            { key: 'structured', icon: '📋', title: 'Answer questions one by one', desc: '12 guided questions about your career, goals and fears. Takes about 5 minutes.', color: '#0F9E99' },
            { key: 'heartdump', icon: '💬', title: 'Just tell me everything', desc: "Type freely like you're talking to someone you trust. Tell us your story, worries, dreams — anything. Mirrova will figure out the rest.", color: '#FBA002' },
            { key: 'voice', icon: '🎤', title: 'Speak in your language', desc: `Tap the mic and talk in ${langNative}. Say whatever is on your mind. Mirrova listens and understands.`, color: '#615091' },
          ].map(mode => (
            <button key={mode.key} onClick={() => { setSelectedMode(mode.key); setPhase(mode.key === 'structured' ? 'questions' : mode.key) }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', background: selectedMode === mode.key ? `${mode.color}15` : 'rgba(255,255,255,0.04)', border: `1.5px solid ${selectedMode === mode.key ? mode.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{mode.icon}</span>
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#F2E8D1', margin: '0 0 6px' }}>{mode.title}</p>
                <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: 0, lineHeight: 1.6 }}>{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── HEART DUMP ──
  if (phase === 'heartdump') return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 680, width: '100%' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 22, color: '#1A2118', display: 'block', marginBottom: 32 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#1A2118', marginBottom: 8 }}>
          Tell me everything.
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A7A7A', marginBottom: 24, lineHeight: 1.7, fontWeight: 500 }}>
          Write in {langNative}. Don't filter yourself. Talk about your college, your dreams, your family pressure, your rejections, your fears — anything that's on your mind. The more you share, the better Mirrova understands you.
        </p>
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(26,33,24,0.15)', marginBottom: 16 }}>
          <textarea
            value={heartDump}
            onChange={e => setHeartDump(e.target.value)}
            placeholder={selectedLanguage === 'Tamil'
              ? "இங்கே எல்லாவற்றையும் சொல்லுங்கள். உங்கள் படிப்பு, கனவுகள், பயங்கள், குடும்ப அழுத்தம் — எதுவும் சரியே..."
              : selectedLanguage === 'Hindi'
              ? "यहाँ सब कुछ बताइए। अपनी पढ़ाई, सपने, डर, घर का दबाव — जो भी मन में है..."
              : "Write here. Tell me about your college, your dream, what scares you, what your family expects, what you tried and failed, what you secretly want. There are no wrong answers here..."}
            rows={14}
            style={{ width: '100%', border: 'none', outline: 'none', padding: '20px', fontSize: 15, fontFamily: 'Inter', background: 'transparent', color: '#1A2118', resize: 'none', lineHeight: 1.8, boxSizing: 'border-box', borderRadius: 16 }}
          />
          <div style={{ padding: '0 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#8A8A8A' }}>
              {heartDump.split(' ').filter(Boolean).length} words
            </span>
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: heartDump.length > 100 ? '#0F9E99' : '#8A8A8A' }}>
              {heartDump.length > 100 ? '✓ Good amount of detail' : 'Write at least a few sentences'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setPhase('mode')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#8A8A8A', border: '1.5px solid rgba(26,33,24,0.15)', borderRadius: 99, padding: '13px 24px', cursor: 'pointer' }}>
            ← Back
          </button>
          <button onClick={() => extractFromText(heartDump)} disabled={extracting || heartDump.trim().length < 50}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', flex: 1, opacity: extracting || heartDump.trim().length < 50 ? 0.6 : 1 }}>
            {extracting ? 'Mirrova is reading your story...' : 'Let Mirrova understand me →'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── VOICE ──
  if (phase === 'voice') return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 580, width: '100%', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 22, color: '#F2E8D1', display: 'block', marginBottom: 40 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#F2E8D1', marginBottom: 12 }}>
          Speak in {langNative}
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', marginBottom: 40, lineHeight: 1.7, fontWeight: 500, maxWidth: 460, margin: '0 auto 40px' }}>
          Tap the mic and talk. Tell Mirrova about yourself — your college, dreams, fears, what's blocking you. Speak naturally in {langNative}.
        </p>
        <div style={{ marginBottom: 32 }}>
          <button onClick={isListening ? stopVoice : startVoice}
            style={{ width: 100, height: 100, borderRadius: '50%', background: isListening ? '#722F37' : '#0F9E99', border: 'none', cursor: 'pointer', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: isListening ? '0 0 0 16px rgba(114,47,55,0.2)' : '0 0 0 8px rgba(15,158,153,0.15)', transition: 'all 0.3s' }}>
            {isListening ? '⏹' : '🎤'}
          </button>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: isListening ? '#722F37' : '#7A6E58', marginTop: 16, fontWeight: isListening ? 700 : 400 }}>
            {isListening ? 'Listening... tap to stop' : 'Tap to start speaking'}
          </p>
        </div>
        {transcript && (
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>What Mirrova heard</p>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#F2E8D1', margin: 0, lineHeight: 1.7 }}>{transcript}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setPhase('mode')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#7A6E58', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '12px 24px', cursor: 'pointer' }}>
            ← Back
          </button>
          {transcript && (
            <button onClick={() => extractFromText(transcript)} disabled={extracting}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', opacity: extracting ? 0.7 : 1 }}>
              {extracting ? 'Understanding you...' : 'Done — analyse this →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // ── ALIGNMENT SCREEN ──
  if (phase === 'align' && extracted) return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 22, color: '#F2E8D1', display: 'block', marginBottom: 32 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#F2E8D1', marginBottom: 8 }}>
          Here's what I understood. 🪞
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A6E58', marginBottom: 24, lineHeight: 1.6, fontWeight: 500 }}>
          Check if this is right. If something is wrong or missing, you can edit it below.
        </p>
        <div style={{ background: 'rgba(15,158,153,0.08)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, border: '1px solid rgba(15,158,153,0.2)' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#0F9E99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Mirrova's understanding</p>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#F2E8D1', margin: '0 0 8px', lineHeight: 1.6, fontStyle: 'italic' }}>"{extracted.summary}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ height: 4, flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${extracted.confidence || 70}%`, background: '#0F9E99', borderRadius: 99 }} />
            </div>
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#0F9E99', fontWeight: 700 }}>{extracted.confidence || 70}% confident</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { key: 'current_field', label: 'Currently studying/working in' },
            { key: 'dream_direction', label: 'Dream direction' },
            { key: 'top_skill', label: 'Top skill' },
            { key: 'biggest_fear', label: 'Biggest fear' },
            { key: 'city', label: 'City/State' },
            { key: 'education_level', label: 'Education' },
            { key: 'hours_per_day', label: 'Hours per day' },
            { key: 'biggest_blocker', label: 'Biggest blocker' },
            { key: 'college_name', label: 'College name' },
          ].map(field => (
            <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#7A6E58', fontWeight: 600, width: 160, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{field.label}</span>
              <input
                value={extracted[field.key] || ''}
                onChange={e => setExtracted(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder="Not detected — add manually"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter', fontSize: 13, color: extracted[field.key] ? '#F2E8D1' : '#5A5050', fontWeight: extracted[field.key] ? 500 : 400 }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setPhase(selectedMode)}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: 'transparent', color: '#7A6E58', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '12px 24px', cursor: 'pointer' }}>
            ← Edit my response
          </button>
          <button onClick={() => setPhase('theme')}
            style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 15, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '13px 32px', cursor: 'pointer', flex: 1 }}>
            Yes, this is right → Continue
          </button>
        </div>
      </div>
    </div>
  )

  // ── THEME PICKER ──
  if (phase === 'theme') return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 28, color: '#1A2118', display: 'block', marginBottom: 32 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#1A2118', marginBottom: 10 }}>One last thing.</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#5A5A5A', marginBottom: 40, lineHeight: 1.6, fontWeight: 500 }}>
          Pick your vibe — you can always change it later.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setSelectedTheme(key)}
              style={{ width: 100, height: 100, borderRadius: 20, background: t.swatch, border: selectedTheme === key ? '3px solid #0F9E99' : '2px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', transform: selectedTheme === key ? 'scale(1.05)' : 'scale(1)' }}>
              <span style={{ fontFamily: 'Moldie, serif', fontSize: 18, color: t.text }}>M</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: t.text, fontWeight: 500, opacity: 0.7 }}>{t.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => handleFinish(extracted || answers)} disabled={loading}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 48px', cursor: 'pointer', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Setting up your Mirrova...' : 'Enter Mirrova →'}
        </button>
      </div>
    </div>
  )

  // ── QUESTIONS ──
  const q = questions[step]
  return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 48px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 22, color: '#1A2118' }}>mirrova</span>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#8A8A8A', fontWeight: 500, margin: 0 }}>
          {step + 1} / {questions.length}
        </p>
      </div>
      <div style={{ padding: '16px 48px 0' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i <= step ? '#0F9E99' : 'rgba(26,33,24,0.12)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ maxWidth: 620, width: '100%' }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#0F9E99', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Tell us about yourself
            </p>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#1A2118', marginBottom: 0, letterSpacing: '-0.01em' }}>
              {q.q}
            </h2>
          </div>
          {Object.entries(answers).length > 0 && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(answers).slice(-2).map(([key, val]) => (
                val && <div key={key} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#0F9E99', color: '#EFE9E0', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', fontFamily: 'Inter', fontSize: 13, maxWidth: '75%', lineHeight: 1.5, fontWeight: 500 }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A2118', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Moldie, serif', fontSize: 14, color: '#F2E8D1' }}>m</span>
            </div>
            <div style={{ background: '#1A2118', color: '#F2E8D1', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', fontFamily: 'Inter', fontStyle: 'italic', fontSize: 15, maxWidth: '80%', lineHeight: 1.6, fontWeight: 500 }}>
              {q.q}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder={q.ph}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext() } }}
              autoFocus
              rows={2}
              style={{ flex: 1, borderRadius: 16, border: '1.5px solid rgba(26,33,24,0.15)', padding: '14px 18px', fontSize: 14, fontFamily: 'Inter', resize: 'none', outline: 'none', background: '#fff', color: '#1A2118', lineHeight: 1.6, fontWeight: 500 }}
              onFocus={e => e.target.style.borderColor = '#0F9E99'}
              onBlur={e => e.target.style.borderColor = 'rgba(26,33,24,0.15)'}
            />
            <button onClick={handleNext}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 14, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '13px 24px', cursor: 'pointer', flexShrink: 0 }}>
              {step === questions.length - 1 ? 'Done →' : 'Next →'}
            </button>
          </div>
          {(q.key === 'recent_rejection' || q.key === 'built_anything') && (
            <button onClick={handleNext}
              style={{ fontFamily: 'Inter', fontStyle: 'italic', fontSize: 13, color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, display: 'block', fontWeight: 500 }}>
              Skip this one →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}