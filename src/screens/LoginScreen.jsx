import { useState } from 'react'
import { supabase } from '../supabaseClient'
import SafeWayLogo from '../components/SafeWayLogo'

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      onLogin(data.session)
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        plano: 'gratis',
      })
      onLogin(data.session)
    }
    setLoading(false)
  }

  const s = styles

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.logoWrap}>
          <SafeWayLogo size={48} shieldColor="#FF6B9D" shieldColor2="#FF3F7A" />
        </div>
        <h1 style={s.title}>SafeWay</h1>
        <p style={s.subtitle}>Votre sécurité, notre priorité</p>
      </div>

      <div style={s.card}>
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}
            onClick={() => { setMode('login'); setError('') }}
          >
            Connexion
          </button>
          <button
            style={{ ...s.tab, ...(mode === 'register' ? s.tabActive : {}) }}
            onClick={() => { setMode('register'); setError('') }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <>
              <div style={s.inputGroup}>
                <label style={s.label}>Nom complet</label>
                <input
                  style={s.input}
                  type="text"
                  name="nome"
                  placeholder="Marie Dupont"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Téléphone</label>
                <input
                  style={s.input}
                  type="tel"
                  name="telefone"
                  placeholder="+33 6 12 34 56 78"
                  value={form.telefone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div style={s.inputGroup}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              name="email"
              placeholder="marie@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Mot de passe</label>
            <input
              style={s.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Chargement...'
              : mode === 'login'
              ? 'Se connecter'
              : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #667EEA 0%, #4ECDC4 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoWrap: {
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: '34px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
  card: {
    background: 'white',
    borderRadius: '28px',
    padding: '28px 24px',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  tabs: {
    display: 'flex',
    marginBottom: '24px',
    background: '#F0F0F5',
    borderRadius: '14px',
    padding: '4px',
    gap: '4px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    background: 'transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    color: '#888',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'white',
    color: '#667EEA',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  inputGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid #E8E8F0',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    color: '#333',
    background: '#FAFAFA',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667EEA, #4ECDC4)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
  },
  error: {
    color: '#FF6B6B',
    fontSize: '13px',
    marginBottom: '12px',
    textAlign: 'center',
    background: 'rgba(255,107,107,0.08)',
    padding: '10px',
    borderRadius: '8px',
  },
}
