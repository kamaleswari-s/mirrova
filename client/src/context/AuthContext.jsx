import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mirrova_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('mirrova_token')
          delete axios.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('mirrova_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // Always fetch fresh user data from server after login
    axios.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(userData))
  }

  const logout = () => {
    localStorage.removeItem('mirrova_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)