import { useState } from 'react'
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
      { key: 'education_level', q: "What's your education level and type of college?", ph: "e.g. B.Tech 3rd year at a private college in Tamil Nadu, or MBA at IIM..." },
      { key: 'hours_per_day', q: "How many hours per day can you realistically commit to upskilling?", ph: "e.g. 1 hour on weekdays, 3 hours on weekends..." },
      { key: 'built_anything', q: "Have you ever built anything — project, app, business, event, anything at all?", ph: "e.g. Built a small e-commerce site, organised a college fest, ran an Instagram page..." },
      { key: 'biggest_blocker', q: "What's the single biggest thing blocking you right now — be completely honest.", ph: "e.g. I don't know where to start, my parents want me in government jobs, I failed backlogs, I have no network..." },
    ],
    Hindi: [
      { key: 'current_field', q: "आप अभी क्या पढ़ रहे हैं या काम कर रहे हैं?", ph: "जैसे: Computer Science, B.Com, Mechanical Engineering..." },
      { key: 'dream_direction', q: "आप असल में क्या करना चाहते हैं? सच बताइए।", ph: "जैसे: मैं UX design में काम करना चाहता/चाहती हूं..." },
      { key: 'top_skill', q: "एक चीज़ जो आप सच में अच्छे से करते हैं?", ph: "जैसे: मैं complex चीज़ें आसानी से समझा सकता/सकती हूं..." },
      { key: 'biggest_fear', q: "आपके भविष्य के बारे में सबसे बड़ा डर क्या है?", ph: "जैसे: degree बेकार हो जाएगी, placement नहीं मिलेगी..." },
      { key: 'recent_rejection', q: "क्या हाल ही में कोई rejection मिली? बताइए।", ph: "जैसे: 3 internships में reject हुआ/हुई... (skip करें अगर नहीं)" },
      { key: 'success_vision', q: "5 साल बाद success कैसी दिखती है आपको?", ph: "जैसे: अच्छा काम, अच्छी कमाई, खुद पर गर्व..." },
      { key: 'city', q: "आप किस शहर या राज्य से हैं?", ph: "जैसे: दिल्ली, पटना, लखनऊ, ग्रामीण UP..." },
      { key: 'education_level', q: "आपकी शिक्षा का स्तर और college का प्रकार क्या है?", ph: "जैसे: B.Tech 3rd year, private college, Bihar..." },
      { key: 'hours_per_day', q: "आप प्रतिदिन कितने घंटे upskilling के लिए दे सकते हैं?", ph: "जैसे: weekdays पर 1 घंटा, weekends पर 3 घंटे..." },
      { key: 'built_anything', q: "क्या आपने कभी कुछ बनाया है — project, app, business, event?", ph: "जैसे: एक छोटी website बनाई, college fest organize किया..." },
      { key: 'biggest_blocker', q: "अभी आपको सबसे ज़्यादा क्या रोक रहा है? बिल्कुल सच बताइए।", ph: "जैसे: शुरू कहाँ से करूं समझ नहीं आता, घरवाले govt job चाहते हैं..." },
    ],
    Tamil: [
      { key: 'current_field', q: "நீங்கள் இப்போது என்ன படிக்கிறீர்கள் அல்லது வேலை செய்கிறீர்கள்?", ph: "எ.கா: Computer Science, B.Com, Mechanical Engineering..." },
      { key: 'dream_direction', q: "நீங்கள் உண்மையில் என்ன செய்ய விரும்புகிறீர்கள்?", ph: "எ.கா: நான் UX design-ல் வேலை செய்ய விரும்புகிறேன்..." },
      { key: 'top_skill', q: "நீங்கள் உண்மையில் நன்றாக செய்யும் ஒரு விஷயம்?", ph: "எ.கா: நான் கஷ்டமான விஷயங்களை எளிமையாக விளக்க முடியும்..." },
      { key: 'biggest_fear', q: "உங்கள் எதிர்காலத்தில் உங்களுக்கு மிகவும் பயமாக இருப்பது என்ன?", ph: "எ.கா: படிப்பு வீண் ஆகும், வேலை கிடைக்காது..." },
      { key: 'recent_rejection', q: "சமீபத்தில் ஏதாவது rejection கிடைத்ததா?", ph: "எ.கா: 3 internships-ல் reject ஆனேன்... (பொருந்தாவிட்டால் skip)" },
      { key: 'success_vision', q: "5 ஆண்டுகளில் வெற்றி உங்களுக்கு எப்படி தெரிகிறது?", ph: "எ.கா: நல்ல வேலை, நல்ல சம்பளம், என்னை பற்றி பெருமையாக உணர்வேன்..." },
      { key: 'city', q: "நீங்கள் எந்த நகரம் அல்லது மாநிலத்தில் இருந்து வருகிறீர்கள்?", ph: "எ.கா: Chennai, Coimbatore, Madurai, கிராமப்புற Tamil Nadu..." },
      { key: 'education_level', q: "உங்கள் கல்வி நிலை மற்றும் கல்லூரி வகை என்ன?", ph: "எ.கா: B.Tech 3rd year, private college, Tamil Nadu..." },
      { key: 'hours_per_day', q: "நீங்கள் ஒரு நாளில் எத்தனை மணி நேரம் upskilling-க்கு ஒதுக்க முடியும்?", ph: "எ.கா: weekdays-ல் 1 மணி நேரம், weekends-ல் 3 மணி நேரம்..." },
      { key: 'built_anything', q: "நீங்கள் எப்போதாவது ஏதாவது உருவாக்கினீர்களா — project, app, business, event?", ph: "எ.கா: ஒரு சிறிய website செய்தேன், college fest organize செய்தேன்..." },
      { key: 'biggest_blocker', q: "இப்போது உங்களை மிகவும் தடுப்பது என்ன? முற்றிலும் நேர்மையாக சொல்லுங்கள்.", ph: "எ.கா: எங்கிருந்து தொடங்குவது தெரியவில்லை, வீட்டில் govt job வேண்டும் என்கிறார்கள்..." },
    ],
    Telugu: [
      { key: 'current_field', q: "మీరు ప్రస్తుతం ఏమి చదువుతున్నారు లేదా పని చేస్తున్నారు?", ph: "ఉదా: Computer Science, B.Com, Mechanical Engineering..." },
      { key: 'dream_direction', q: "మీరు నిజంగా ఏమి చేయాలనుకుంటున్నారు?", ph: "ఉదా: నేను UX design లో పని చేయాలనుకుంటున్నాను..." },
      { key: 'top_skill', q: "మీరు నిజంగా బాగా చేసే ఒక విషయం ఏమిటి?", ph: "ఉదా: నేను కష్టమైన విషయాలను సులభంగా వివరించగలను..." },
      { key: 'biggest_fear', q: "మీ భవిష్యత్తు గురించి మీకు అత్యంత భయంగా ఉన్నది ఏమిటి?", ph: "ఉదా: డిగ్రీ వృధా అవుతుంది, ఉద్యోగం రాదు..." },
      { key: 'recent_rejection', q: "ఇటీవల మీకు rejection వచ్చిందా?", ph: "ఉదా: 3 internships లో reject అయ్యాను... (వర్తించకపోతే skip)" },
      { key: 'success_vision', q: "5 సంవత్సరాలలో success మీకు ఎలా కనిపిస్తుంది?", ph: "ఉదా: మంచి పని, మంచి జీతం, నా గురించి గర్వంగా అనిపిస్తుంది..." },
      { key: 'city', q: "మీరు ఏ నగరం లేదా రాష్ట్రం నుండి వచ్చారు?", ph: "ఉదా: Hyderabad, Vijayawada, గ్రామీణ Andhra Pradesh..." },
      { key: 'education_level', q: "మీ విద్యా స్థాయి మరియు కళాశాల రకం ఏమిటి?", ph: "ఉదా: B.Tech 3rd year, private college, Telangana..." },
      { key: 'hours_per_day', q: "మీరు రోజుకు ఎన్ని గంటలు upskilling కి కేటాయించగలరు?", ph: "ఉదా: weekdays లో 1 గంట, weekends లో 3 గంటలు..." },
      { key: 'built_anything', q: "మీరు ఎప్పుడైనా ఏదైనా నిర్మించారా — project, app, business, event?", ph: "ఉదా: చిన్న website చేశాను, college fest organize చేశాను..." },
      { key: 'biggest_blocker', q: "ఇప్పుడు మిమ్మల్ని అత్యంత ఆపుతున్నది ఏమిటి? పూర్తిగా నిజాయితీగా చెప్పండి.", ph: "ఉదా: ఎక్కడ నుండి మొదలుపెట్టాలో తెలియదు, ఇంట్లో govt job కావాలని అంటున్నారు..." },
    ],
    Kannada: [
      { key: 'current_field', q: "ನೀವು ಈಗ ಏನು ಓದುತ್ತಿದ್ದೀರಿ ಅಥವಾ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೀರಿ?", ph: "ಉದಾ: Computer Science, B.Com, Mechanical Engineering..." },
      { key: 'dream_direction', q: "ನೀವು ನಿಜವಾಗಿ ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?", ph: "ಉದಾ: ನಾನು UX design ನಲ್ಲಿ ಕೆಲಸ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ..." },
      { key: 'top_skill', q: "ನೀವು ನಿಜವಾಗಿ ಚೆನ್ನಾಗಿ ಮಾಡುವ ಒಂದು ವಿಷಯ?", ph: "ಉದಾ: ನಾನು ಕಷ್ಟದ ವಿಷಯಗಳನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಬಲ್ಲೆ..." },
      { key: 'biggest_fear', q: "ನಿಮ್ಮ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ನಿಮಗೆ ಅತ್ಯಂತ ಭಯವಾಗಿರುವುದು ಏನು?", ph: "ಉದಾ: ಪದವಿ ವ್ಯರ್ಥವಾಗುತ್ತದೆ, ಕೆಲಸ ಸಿಗುವುದಿಲ್ಲ..." },
      { key: 'recent_rejection', q: "ಇತ್ತೀಚೆಗೆ ನಿಮಗೆ rejection ಬಂದಿದೆಯೇ?", ph: "ಉದಾ: 3 internships ನಲ್ಲಿ reject ಆದೆ... (ಅನ್ವಯಿಸದಿದ್ದರೆ skip)" },
      { key: 'success_vision', q: "5 ವರ್ಷಗಳಲ್ಲಿ success ನಿಮಗೆ ಹೇಗೆ ಕಾಣಿಸುತ್ತದೆ?", ph: "ಉದಾ: ಒಳ್ಳೆಯ ಕೆಲಸ, ಒಳ್ಳೆಯ ಸಂಬಳ, ನನ್ನ ಬಗ್ಗೆ ಹೆಮ್ಮೆ ಎನಿಸುತ್ತದೆ..." },
      { key: 'city', q: "ನೀವು ಯಾವ ನಗರ ಅಥವಾ ರಾಜ್ಯದಿಂದ ಬಂದಿದ್ದೀರಿ?", ph: "ಉದಾ: Bangalore, Mysuru, ಗ್ರಾಮೀಣ Karnataka..." },
      { key: 'education_level', q: "ನಿಮ್ಮ ಶಿಕ್ಷಣ ಮಟ್ಟ ಮತ್ತು ಕಾಲೇಜಿನ ಪ್ರಕಾರ ಏನು?", ph: "ಉದಾ: B.Tech 3rd year, private college, Karnataka..." },
      { key: 'hours_per_day', q: "ನೀವು ದಿನಕ್ಕೆ ಎಷ್ಟು ಗಂಟೆ upskilling ಗೆ ಮೀಸಲಿಡಬಹುದು?", ph: "ಉದಾ: weekdays ನಲ್ಲಿ 1 ಗಂಟೆ, weekends ನಲ್ಲಿ 3 ಗಂಟೆ..." },
      { key: 'built_anything', q: "ನೀವು ಎಂದಾದರೂ ಏನಾದರೂ ನಿರ್ಮಿಸಿದ್ದೀರಾ — project, app, business, event?", ph: "ಉದಾ: ಒಂದು ಸಣ್ಣ website ಮಾಡಿದೆ, college fest organize ಮಾಡಿದೆ..." },
      { key: 'biggest_blocker', q: "ಈಗ ನಿಮ್ಮನ್ನು ಅತ್ಯಂತ ತಡೆಯುತ್ತಿರುವುದು ಏನು? ಸಂಪೂರ್ಣ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಹೇಳಿ.", ph: "ಉದಾ: ಎಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸಬೇಕೆಂದು ತಿಳಿಯುತ್ತಿಲ್ಲ, ಮನೆಯಲ್ಲಿ govt job ಬೇಕೆಂದು ಹೇಳುತ್ತಾರೆ..." },
    ],
    Bengali: [
      { key: 'current_field', q: "আপনি এখন কী পড়ছেন বা কাজ করছেন?", ph: "যেমন: Computer Science, B.Com, Mechanical Engineering..." },
      { key: 'dream_direction', q: "আপনি আসলে কী করতে চান? সৎভাবে বলুন।", ph: "যেমন: আমি UX design-এ কাজ করতে চাই..." },
      { key: 'top_skill', q: "একটি জিনিস যা আপনি সত্যিই ভালো করেন?", ph: "যেমন: আমি জটিল বিষয়গুলো সহজে বোঝাতে পারি..." },
      { key: 'biggest_fear', q: "আপনার ভবিষ্যৎ নিয়ে আপনার সবচেয়ে বড় ভয় কী?", ph: "যেমন: ডিগ্রি নষ্ট হবে, চাকরি পাব না..." },
      { key: 'recent_rejection', q: "সম্প্রতি কোনো rejection পেয়েছেন?", ph: "যেমন: ৩টি internship-এ reject হয়েছি... (না হলে skip)" },
      { key: 'success_vision', q: "৫ বছরে success আপনার কাছে কেমন দেখায়?", ph: "যেমন: ভালো কাজ, ভালো আয়, নিজেকে নিয়ে গর্বিত..." },
      { key: 'city', q: "আপনি কোন শহর বা রাজ্য থেকে এসেছেন?", ph: "যেমন: Kolkata, Dhanbad, গ্রামীণ West Bengal..." },
      { key: 'education_level', q: "আপনার শিক্ষার স্তর এবং কলেজের ধরন কী?", ph: "যেমন: B.Tech 3rd year, private college, West Bengal..." },
      { key: 'hours_per_day', q: "আপনি প্রতিদিন কত ঘণ্টা upskilling-এ দিতে পারবেন?", ph: "যেমন: weekdays-এ ১ ঘণ্টা, weekends-এ ৩ ঘণ্টা..." },
      { key: 'built_anything', q: "আপনি কি কখনো কিছু তৈরি করেছেন — project, app, business, event?", ph: "যেমন: একটি ছোট website বানিয়েছি, college fest organize করেছি..." },
      { key: 'biggest_blocker', q: "এখন আপনাকে সবচেয়ে বেশি কী আটকাচ্ছে? সম্পূর্ণ সৎভাবে বলুন।", ph: "যেমন: কোথা থেকে শুরু করব বুঝতে পারছি না, বাড়িতে govt job চাইছে..." },
    ],
  }
  return q[lang] || q['English']
}

const getSubtitles = (lang) => {
  const s = {
    English: [
      { heading: "Let's start with where you are.", sub: "Your current field helps us understand your starting point." },
      { heading: "Now tell us where you want to go.", sub: "Don't filter yourself. What actually excites you?" },
      { heading: "What's your superpower?", sub: "One thing you're genuinely better at than most people." },
      { heading: "Be honest — what worries you?", sub: "Your fear helps us build a plan that addresses it directly." },
      { heading: "Have you hit any walls recently?", sub: "Rejection data helps us find your real blind spots." },
      { heading: "Last one — paint your future.", sub: "In 5 years — what does a great life look like to you?" },
      { heading: "Where are you based?", sub: "Job markets differ massively by city. This changes your advice completely." },
      { heading: "Tell us about your education.", sub: "College tier and level affects what opportunities are realistic for you." },
      { heading: "How much time do you have?", sub: "Your plan needs to fit your real life — not an ideal one." },
      { heading: "Have you built anything?", sub: "Projects, businesses, events — anything counts. This is your portfolio signal." },
      { heading: "What's really blocking you?", sub: "This is the most important question. Be completely honest — nobody else will see this." },
    ],
    Hindi: [
      { heading: "चलिए शुरू करते हैं।", sub: "आप अभी कहाँ हैं — यह हमें आपकी शुरुआत समझने में मदद करता है।" },
      { heading: "अब बताइए — आप कहाँ जाना चाहते हैं?", sub: "खुद को filter मत करिए। जो सच में अच्छा लगता है वो बताइए।" },
      { heading: "आपकी superpower क्या है?", sub: "एक चीज़ जो आप ज़्यादातर लोगों से बेहतर करते हैं।" },
      { heading: "सच बताइए — क्या डर लगता है?", sub: "आपका डर जानकर हम एक plan बना सकते हैं।" },
      { heading: "क्या कोई wall मिली है?", sub: "Rejection का data हमें असली blind spots खोजने में मदद करता है।" },
      { heading: "आखिरी सवाल — अपना future describe करिए।", sub: "5 साल बाद एक अच्छी life कैसी दिखती है आपको?" },
      { heading: "आप कहाँ से हैं?", sub: "हर शहर का job market अलग है। यह आपकी advice पूरी तरह बदल देता है।" },
      { heading: "अपनी education के बारे में बताइए।", sub: "College का tier और level बताता है कि कौन से opportunities realistic हैं।" },
      { heading: "आपके पास कितना time है?", sub: "आपका plan आपकी real life के हिसाब से बनेगा।" },
      { heading: "क्या आपने कभी कुछ बनाया है?", sub: "Projects, businesses, events — कुछ भी। यह आपका portfolio signal है।" },
      { heading: "असल में क्या रोक रहा है?", sub: "यह सबसे ज़रूरी सवाल है। बिल्कुल सच बताइए।" },
    ],
    Tamil: [
      { heading: "தொடங்குவோம்.", sub: "நீங்கள் இப்போது எங்கே இருக்கிறீர்கள் என்பதை புரிந்துகொள்ள உதவுங்கள்." },
      { heading: "நீங்கள் எங்கே போக விரும்புகிறீர்கள்?", sub: "உங்களை filter செய்யாதீர்கள். உண்மையில் என்ன பிடிக்கும்?" },
      { heading: "உங்கள் superpower என்ன?", sub: "பெரும்பாலான மக்களை விட நீங்கள் நன்றாக செய்யும் ஒன்று." },
      { heading: "நேர்மையாக — என்ன பயமாக இருக்கிறது?", sub: "உங்கள் பயத்தை அறிந்து நாங்கள் ஒரு plan செய்யலாம்." },
      { heading: "ஏதாவது தடை வந்ததா?", sub: "Rejection data உங்கள் blind spots கண்டுபிடிக்க உதவுகிறது." },
      { heading: "கடைசி கேள்வி — உங்கள் எதிர்காலம்.", sub: "5 ஆண்டுகளில் ஒரு நல்ல வாழ்க்கை எப்படி இருக்கும்?" },
      { heading: "நீங்கள் எங்கிருந்து வருகிறீர்கள்?", sub: "ஒவ்வொரு நகரத்திலும் job market வேறுபடும். இது உங்கள் ஆலோசனையை மாற்றும்." },
      { heading: "உங்கள் கல்வியைப் பற்றி சொல்லுங்கள்.", sub: "College tier மற்றும் level எந்த opportunities realistic என்பதை காட்டுகிறது." },
      { heading: "உங்களுக்கு எவ்வளவு நேரம் உள்ளது?", sub: "உங்கள் plan உங்கள் real life-க்கு ஏற்றதாக இருக்கும்." },
      { heading: "நீங்கள் எதையாவது உருவாக்கினீர்களா?", sub: "Projects, businesses, events — எதுவும் கணக்கில் வரும்." },
      { heading: "உண்மையில் என்ன தடுக்கிறது?", sub: "இது மிக முக்கியமான கேள்வி. முற்றிலும் நேர்மையாக சொல்லுங்கள்." },
    ],
    Telugu: [
      { heading: "ప్రారంభిద్దాం.", sub: "మీరు ఇప్పుడు ఎక్కడ ఉన్నారో అర్థం చేసుకోవడానికి సహాయపడండి." },
      { heading: "మీరు ఎక్కడికి వెళ్ళాలనుకుంటున్నారు?", sub: "మిమ్మల్ని filter చేసుకోకండి. నిజంగా ఏమి నచ్చుతుందో చెప్పండి." },
      { heading: "మీ superpower ఏమిటి?", sub: "చాలా మంది కంటే మీరు బాగా చేసే ఒక విషయం." },
      { heading: "నిజాయితీగా — ఏమి భయంగా ఉంది?", sub: "మీ భయాన్ని తెలుసుకుని మేము ఒక plan చేయగలం." },
      { heading: "ఏదైనా అడ్డంకి వచ్చిందా?", sub: "Rejection data మీ blind spots కనుగొనడంలో సహాయపడుతుంది." },
      { heading: "చివరి ప్రశ్న — మీ భవిష్యత్తు.", sub: "5 సంవత్సరాలలో మంచి జీవితం ఎలా ఉంటుంది?" },
      { heading: "మీరు ఎక్కడ నుండి వచ్చారు?", sub: "ప్రతి నగరంలో job market వేరుగా ఉంటుంది. ఇది మీ సలహాను మారుస్తుంది." },
      { heading: "మీ విద్య గురించి చెప్పండి.", sub: "College tier మరియు level ఏ opportunities realistic అని చూపిస్తుంది." },
      { heading: "మీకు ఎంత సమయం ఉంది?", sub: "మీ plan మీ real life కి సరిపోయేలా ఉంటుంది." },
      { heading: "మీరు ఏదైనా నిర్మించారా?", sub: "Projects, businesses, events — ఏదైనా లెక్కలోకి వస్తుంది." },
      { heading: "నిజంగా ఏమి ఆపుతున్నది?", sub: "ఇది అత్యంత ముఖ్యమైన ప్రశ్న. పూర్తిగా నిజాయితీగా చెప్పండి." },
    ],
    Kannada: [
      { heading: "ಪ್ರಾರಂಭಿಸೋಣ.", sub: "ನೀವು ಈಗ ಎಲ್ಲಿದ್ದೀರಿ ಎಂದು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಿ." },
      { heading: "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ?", sub: "ನಿಮ್ಮನ್ನು filter ಮಾಡಿಕೊಳ್ಳಬೇಡಿ. ನಿಜವಾಗಿ ಏನು ಇಷ್ಟ ಎಂದು ಹೇಳಿ." },
      { heading: "ನಿಮ್ಮ superpower ಏನು?", sub: "ಹೆಚ್ಚಿನ ಜನರಿಗಿಂತ ನೀವು ಚೆನ್ನಾಗಿ ಮಾಡುವ ಒಂದು ವಿಷಯ." },
      { heading: "ಪ್ರಾಮಾಣಿಕವಾಗಿ — ಏನು ಭಯವಾಗಿದೆ?", sub: "ನಿಮ್ಮ ಭಯ ತಿಳಿದು ನಾವು ಒಂದು plan ಮಾಡಬಹುದು." },
      { heading: "ಯಾವುದಾದರೂ ತಡೆ ಬಂದಿದೆಯೇ?", sub: "Rejection data ನಿಮ್ಮ blind spots ಕಂಡುಹಿಡಿಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ." },
      { heading: "ಕೊನೆಯ ಪ್ರಶ್ನೆ — ನಿಮ್ಮ ಭವಿಷ್ಯ.", sub: "5 ವರ್ಷಗಳಲ್ಲಿ ಒಳ್ಳೆಯ ಜೀವನ ಹೇಗಿರುತ್ತದೆ?" },
      { heading: "ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?", sub: "ಪ್ರತಿ ನಗರದಲ್ಲಿ job market ಭಿನ್ನವಾಗಿರುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಸಲಹೆಯನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ." },
      { heading: "ನಿಮ್ಮ ಶಿಕ್ಷಣದ ಬಗ್ಗೆ ಹೇಳಿ.", sub: "College tier ಮತ್ತು level ಯಾವ opportunities realistic ಎಂದು ತೋರಿಸುತ್ತದೆ." },
      { heading: "ನಿಮಗೆ ಎಷ್ಟು ಸಮಯ ಇದೆ?", sub: "ನಿಮ್ಮ plan ನಿಮ್ಮ real life ಗೆ ಹೊಂದಿಕೆಯಾಗುವಂತೆ ಇರುತ್ತದೆ." },
      { heading: "ನೀವು ಏನಾದರೂ ನಿರ್ಮಿಸಿದ್ದೀರಾ?", sub: "Projects, businesses, events — ಯಾವುದಾದರೂ ಲೆಕ್ಕಕ್ಕೆ ಬರುತ್ತದೆ." },
      { heading: "ನಿಜವಾಗಿ ಏನು ತಡೆಯುತ್ತಿದೆ?", sub: "ಇದು ಅತ್ಯಂತ ಮುಖ್ಯವಾದ ಪ್ರಶ್ನೆ. ಸಂಪೂರ್ಣ ಪ್ರಾಮಾಣಿಕವಾಗಿ ಹೇಳಿ." },
    ],
    Bengali: [
      { heading: "শুরু করা যাক।", sub: "আপনি এখন কোথায় আছেন তা বুঝতে সাহায্য করুন।" },
      { heading: "আপনি কোথায় যেতে চান?", sub: "নিজেকে filter করবেন না। সত্যিই কী ভালো লাগে বলুন।" },
      { heading: "আপনার superpower কী?", sub: "একটি জিনিস যা আপনি বেশিরভাগ মানুষের চেয়ে ভালো করেন।" },
      { heading: "সৎভাবে — কী ভয় লাগছে?", sub: "আপনার ভয় জেনে আমরা একটি plan করতে পারি।" },
      { heading: "কোনো বাধা এসেছিল?", sub: "Rejection data আপনার blind spots খুঁজে পেতে সাহায্য করে।" },
      { heading: "শেষ প্রশ্ন — আপনার ভবিষ্যৎ।", sub: "৫ বছরে একটি ভালো জীবন কেমন দেখায়?" },
      { heading: "আপনি কোথা থেকে এসেছেন?", sub: "প্রতিটি শহরে job market আলাদা। এটি আপনার পরামর্শ পরিবর্তন করে।" },
      { heading: "আপনার শিক্ষা সম্পর্কে বলুন।", sub: "College tier এবং level কোন opportunities realistic তা দেখায়।" },
      { heading: "আপনার কাছে কত সময় আছে?", sub: "আপনার plan আপনার real life-এর সাথে মানানসই হবে।" },
      { heading: "আপনি কি কিছু তৈরি করেছেন?", sub: "Projects, businesses, events — যেকোনো কিছু গণনায় আসে।" },
      { heading: "সত্যিই কী আটকাচ্ছে?", sub: "এটি সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন। সম্পূর্ণ সৎভাবে বলুন।" },
    ],
  }
  return s[lang] || s['English']
}

export default function Onboarding() {
  const [phase, setPhase] = useState('language')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('ivory')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const questions = getQuestions(selectedLanguage)
  const subtitles = getSubtitles(selectedLanguage)

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

  const handleFinish = async () => {
    setLoading(true)
    try {
      await axios.post('/api/onboarding/save', { ...answers, preferred_language: selectedLanguage })
      await axios.patch('/api/auth/theme', { theme: selectedTheme })
      updateUser({ theme: selectedTheme, onboarding_complete: true, preferred_language: selectedLanguage })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const q = questions[step]

  // ── LANGUAGE PICKER ──
  if (phase === 'language') return (
    <div style={{ minHeight: '100vh', background: '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 580, width: '100%' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 28, color: '#F2E8D1', display: 'block', marginBottom: 40 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 32, color: '#F2E8D1', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Which language do you think in?
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#7A6E58', marginBottom: 36, lineHeight: 1.6, fontWeight: 500 }}>
          Your questions, your future self, your plan — all in your language. This is not just translation. It's your voice.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {languages.map(lang => (
            <button key={lang.key} onClick={() => setSelectedLanguage(lang.key)}
              style={{ background: selectedLanguage === lang.key ? 'rgba(15,158,153,0.15)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${selectedLanguage === lang.key ? '#0F9E99' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: '20px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', transform: selectedLanguage === lang.key ? 'scale(1.02)' : 'scale(1)' }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{lang.flag}</span>
              <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: selectedLanguage === lang.key ? '#0F9E99' : '#F2E8D1', margin: '0 0 4px' }}>{lang.label}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: 0 }}>{lang.native}</p>
              {selectedLanguage === lang.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F9E99', margin: '8px auto 0' }} />}
            </button>
          ))}
        </div>
        <div style={{ background: 'rgba(15,158,153,0.08)', borderRadius: 12, padding: '14px 18px', marginBottom: 28, border: '1px solid rgba(15,158,153,0.15)' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#7A6E58', margin: 0, lineHeight: 1.6 }}>
            🌏 <strong style={{ color: '#0F9E99' }}>India has 22 official languages.</strong> We support 6 right now and adding more. Your language is not a barrier — it's your strength.
          </p>
        </div>
        <button onClick={() => setPhase('questions')}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 48px', cursor: 'pointer', width: '100%' }}>
          Continue in {languages.find(l => l.key === selectedLanguage)?.native} →
        </button>
      </div>
    </div>
  )

  // ── THEME PICKER ──
  if (phase === 'theme') return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 28, color: '#1A2118', display: 'block', marginBottom: 32 }}>mirrova</span>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#1A2118', marginBottom: 10, letterSpacing: '-0.02em' }}>One last thing.</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#5A5A5A', marginBottom: 40, lineHeight: 1.6, fontWeight: 500 }}>
          Pick your vibe — you can always change it later.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setSelectedTheme(key)} style={{ width: 100, height: 100, borderRadius: 20, background: t.swatch, border: selectedTheme === key ? '3px solid #0F9E99' : '2px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'border 0.2s, transform 0.15s', transform: selectedTheme === key ? 'scale(1.05)' : 'scale(1)' }}>
              <span style={{ fontFamily: 'Moldie, serif', fontSize: 18, color: t.text }}>M</span>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: t.text, fontWeight: 500, opacity: 0.7 }}>{t.label}</span>
            </button>
          ))}
        </div>
        <button onClick={handleFinish} disabled={loading}
          style={{ fontFamily: 'Inter', fontStyle: 'italic', fontWeight: 700, fontSize: 16, background: '#0F9E99', color: '#EFE9E0', border: 'none', borderRadius: 99, padding: '14px 48px', cursor: 'pointer', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Setting up your Mirrova...' : 'Enter Mirrova →'}
        </button>
      </div>
    </div>
  )

  // ── QUESTIONS ──
  return (
    <div style={{ minHeight: '100vh', background: '#EFE9E0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 48px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Moldie, serif', fontSize: 22, color: '#1A2118' }}>mirrova</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#8A8A8A', fontWeight: 500 }}>
            {languages.find(l => l.key === selectedLanguage)?.native}
          </span>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#8A8A8A', fontWeight: 500, margin: 0 }}>
            {step + 1} / {questions.length}
          </p>
        </div>
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
              {selectedLanguage === 'English' ? 'Tell us about yourself' :
               selectedLanguage === 'Hindi' ? 'अपने बारे में बताइए' :
               selectedLanguage === 'Tamil' ? 'உங்களைப் பற்றி சொல்லுங்கள்' :
               selectedLanguage === 'Telugu' ? 'మీ గురించి చెప్పండి' :
               selectedLanguage === 'Kannada' ? 'ನಿಮ್ಮ ಬಗ್ಗೆ ಹೇಳಿ' :
               'আপনার সম্পর্কে বলুন'}
            </p>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 28, color: '#1A2118', marginBottom: 8, letterSpacing: '-0.01em' }}>
              {subtitles[step]?.heading}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#7A7A7A', lineHeight: 1.6, fontWeight: 500 }}>
              {subtitles[step]?.sub}
            </p>
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
              style={{ flex: 1, borderRadius: 16, border: '1.5px solid rgba(26,33,24,0.15)', padding: '14px 18px', fontSize: 14, fontFamily: 'Inter', resize: 'none', outline: 'none', background: '#fff', color: '#1A2118', lineHeight: 1.6, transition: 'border-color 0.15s', fontWeight: 500 }}
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
              {selectedLanguage === 'Hindi' ? 'इसे skip करें →' :
               selectedLanguage === 'Tamil' ? 'இதை skip செய்யுங்கள் →' :
               selectedLanguage === 'Telugu' ? 'దీన్ని skip చేయండి →' :
               selectedLanguage === 'Kannada' ? 'ಇದನ್ನು skip ಮಾಡಿ →' :
               selectedLanguage === 'Bengali' ? 'এটি skip করুন →' :
               'Skip this one →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}