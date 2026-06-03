import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import axios from 'axios'

// Set base URL for production
if (import.meta.env.PROD) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://mirrova-server.onrender.com'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Mirrova SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err))
  })
}