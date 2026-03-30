import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import ContactsScreen from './screens/ContactsScreen'
import AlertScreen from './screens/AlertScreen'
import ProfileScreen from './screens/ProfileScreen'
import BottomNav from './components/BottomNav'
import SafeWayLogo from './components/SafeWayLogo'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [activeAlert, setActiveAlert] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSOS = (alert) => {
    setActiveAlert(alert)
    setCurrentScreen('alert')
  }

  const handleCancelAlert = () => {
    setActiveAlert(null)
    setCurrentScreen('home')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'linear-gradient(135deg, #667EEA, #4ECDC4)',
        fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: '12px'
      }}>
        <SafeWayLogo size={64} />
        <p style={{ color: 'white', fontWeight: '700', fontSize: '24px' }}>SafeWay</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Chargement...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ maxWidth: '390px', margin: '0 auto', minHeight: '100vh' }}>
        <LoginScreen onLogin={(sess) => setSession(sess)} />
      </div>
    )
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen session={session} onSOS={handleSOS} />
      case 'contacts':
        return <ContactsScreen session={session} />
      case 'alert':
        return <AlertScreen session={session} alert={activeAlert} onCancel={handleCancelAlert} />
      case 'profile':
        return <ProfileScreen session={session} onLogout={() => { setSession(null); setActiveAlert(null) }} />
      default:
        return <HomeScreen session={session} onSOS={handleSOS} />
    }
  }

  return (
    <div style={{
      maxWidth: '390px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '0 0 40px rgba(0,0,0,0.15)',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '72px' }}>
        {renderScreen()}
      </div>
      <BottomNav
        current={currentScreen}
        onChange={setCurrentScreen}
        hasActiveAlert={!!activeAlert}
      />
    </div>
  )
}

export default App
