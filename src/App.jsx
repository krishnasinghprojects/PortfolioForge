import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import InteractiveEditor from './components/InteractiveEditor'
import './App.css'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDzyjLVHhGE5NbDsuaHhhZ4tdvrUgEJt3E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "krishnasinghportfolio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "krishnasinghportfolio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "krishnasinghportfolio.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "811580744649",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:811580744649:web:44475b391b166b14fafe18",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-THQRRDJSR0"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setAuthLoading(false)
      if (user) {
        loadData()
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const loadData = async () => {
    try {
      // First try to load from Firebase
      const docRef = doc(db, 'portfolio', 'mainDetails')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const firebaseData = docSnap.data()
        setData(firebaseData)
        showNotification('Loaded from Firebase successfully', 'success')
      } else {
        // Fallback to local JSON file
        const response = await fetch('/Data/portfolio-data.json')
        if (!response.ok) throw new Error('Failed to load data')
        const localData = await response.json()
        setData(localData)
        showNotification('Loaded from local file', 'info')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Initialize with empty structure if all else fails
      setData({
        titleTop: "Portfolio",
        navbar: { navbar_name: "", name_abbrivation: "", resume: { text: "", url: "" } },
        about: { greeting: "", title: "", description: "", downloadCV: { text: "", url: "" } },
        projects: [],
        skills: {},
        certificates: {},
        badges: {},
        social: [],
        education: [],
        contact: { title: "", info: [], button: { text: "", url: "" } },
        footer: { copyrightText: "" },
        journey: []
      })
      showNotification('Using default data structure', 'warning')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div')
    notification.className = `glassmorphic-notification ${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon ${type}"></div>
        <div class="notification-text">${message}</div>
      </div>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('fade-out')
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 3000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
      showNotification('Login Success', 'success')
    } catch (error) {
      console.error('Login error:', error)
      showNotification(`Login failed`, 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setData(null)
      showNotification('Logged out successfully', 'info')
    } catch (error) {
      console.error('Logout error:', error)
      showNotification(`Logout failed: ${error.message}`, 'error')
    }
  }

  const saveToFirebase = async () => {
    if (!data || saving) return
    setSaving(true)
    try {
      // Process blog content for projects
      const blogs = {}
      data.projects.forEach(project => {
        if (project.blogContent && project.blogContent.trim()) {
          const blogKey = project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          blogs[blogKey] = {
            title: project.name,
            subtitle: project.description,
            content: project.blogContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      })
      
      // Add metadata
      const dataToSave = { 
        ...data, 
        blogs,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
      
      await setDoc(doc(db, 'portfolio', 'mainDetails'), dataToSave)
      showNotification('Successfully saved to Firebase', 'success')
    } catch (error) {
      console.error('Error saving to Firebase:', error)
      showNotification(`Save failed: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <div className="loading">Checking authentication...</div>
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Portfolio Admin Panel</h1>
            <p>Please sign in to access the admin panel</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="admin@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div className="login-footer">
            <p>Secure access to portfolio management</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading portfolio data...</div>
  }

  if (!data) {
    return <div className="loading">Initializing portfolio...</div>
  }

  const formatUserName = (email) => {
    if (!email) return 'User'
    const username = email.split('@')[0]
    return username.charAt(0).toUpperCase() + username.slice(1)
  }

  const getUserInitial = (email) => {
    if (!email) return 'U'
    const username = email.split('@')[0]
    return username.charAt(0).toUpperCase()
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-left">
          <div className="user-avatar">
            {getUserInitial(user.email)}
          </div>
          <div className="user-info">
            <div className="user-name">{formatUserName(user.email)}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <InteractiveEditor data={data} setData={setData} onSave={saveToFirebase} saving={saving} />
    </div>
  )
}

export default App
