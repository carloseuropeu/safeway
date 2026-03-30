import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ProfileScreen({ session, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfile(data)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    onLogout()
  }

  const nome = profile?.nome || session.user.email || 'Utilisatrice'
  const initial = nome.charAt(0).toUpperCase()
  const isPremium = profile?.plano === 'premium'

  const s = styles

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.avatarLg}>{initial}</div>
        <h2 style={s.name}>{profile?.nome || 'Utilisatrice'}</h2>
        <p style={s.email}>{session.user.email}</p>
      </div>

      <div style={s.content}>
        <div style={{
          ...s.planCard,
          background: isPremium
            ? 'linear-gradient(135deg, #667EEA, #764AF1)'
            : 'white',
        }}>
          <span style={s.planIcon}>{isPremium ? '⭐' : '🆓'}</span>
          <div style={{ flex: 1 }}>
            <p style={{ ...s.planTitle, color: isPremium ? 'white' : '#222' }}>
              Plan {isPremium ? 'Premium' : 'Gratuit'}
            </p>
            <p style={{ ...s.planSub, color: isPremium ? 'rgba(255,255,255,0.75)' : '#AAA' }}>
              {isPremium
                ? 'Toutes les fonctionnalités incluses'
                : 'Fonctionnalités de base'}
            </p>
          </div>
          {!isPremium && (
            <button style={s.upgradeBtn}>Premium</button>
          )}
        </div>

        <div style={s.infoCard}>
          <InfoRow icon="👤" label="Nom" value={profile?.nome || '—'} />
          <div style={s.divider} />
          <InfoRow icon="📧" label="Email" value={session.user.email} />
          <div style={s.divider} />
          <InfoRow icon="📱" label="Téléphone" value={profile?.telefone || '—'} />
          <div style={s.divider} />
          <InfoRow
            icon="🗓️"
            label="Membre depuis"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                : '—'
            }
          />
        </div>

        <button
          style={{ ...s.logoutBtn, opacity: loggingOut ? 0.7 : 1 }}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Déconnexion...' : '↩  Se déconnecter'}
        </button>

        <p style={s.version}>SafeWay v1.0.0 · Votre sécurité, notre priorité</p>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0'
    }}>
      <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '11px', color: '#BBB', margin: '0 0 2px', fontWeight: '600',
          textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </p>
        <p style={{ fontSize: '14px', color: '#333', fontWeight: '500', margin: 0 }}>
          {value}
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #4ECDC4 0%, #2BB8AF 100%)',
    padding: '52px 24px 40px',
    textAlign: 'center',
    borderRadius: '0 0 36px 36px',
  },
  avatarLg: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '34px',
    fontWeight: '700',
    color: 'white',
    margin: '0 auto 14px',
    border: '3px solid rgba(255,255,255,0.4)',
  },
  name: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '800',
    margin: '0 0 4px',
    letterSpacing: '-0.2px',
  },
  email: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
    margin: 0,
  },
  content: {
    padding: '20px 16px',
  },
  planCard: {
    borderRadius: '18px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  planIcon: {
    fontSize: '28px',
  },
  planTitle: {
    fontWeight: '700',
    fontSize: '16px',
    margin: 0,
  },
  planSub: {
    fontSize: '12px',
    margin: '3px 0 0',
  },
  upgradeBtn: {
    padding: '9px 16px',
    background: 'linear-gradient(135deg, #FF6B9D, #FF3F7A)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  infoCard: {
    background: 'white',
    borderRadius: '18px',
    padding: '4px 20px',
    marginBottom: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  divider: {
    height: '1px',
    background: '#F5F5F5',
  },
  logoutBtn: {
    width: '100%',
    padding: '17px',
    background: 'white',
    color: '#FF6B6B',
    border: '2px solid #FF6B6B',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  version: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#CCC',
  },
}
