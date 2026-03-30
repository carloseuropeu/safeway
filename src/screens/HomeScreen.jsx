import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import SafeWayLogo from '../components/SafeWayLogo'

export default function HomeScreen({ session, onSOS }) {
  const [userProfile, setUserProfile] = useState(null)
  const [sosLoading, setSosLoading] = useState(false)
  const [sosError, setSosError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setUserProfile(data)
  }

  const handleSOS = async () => {
    setSosLoading(true)
    setSosError('')

    let latitude = null
    let longitude = null

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          enableHighAccuracy: true,
        })
      )
      latitude = position.coords.latitude
      longitude = position.coords.longitude
    } catch {
      // GPS indisponível, continua sem coordenadas
    }

    const { data, error } = await supabase
      .from('sos_alerts')
      .insert({
        user_id: session.user.id,
        latitude,
        longitude,
        status: 'ativo',
        mensagem: latitude
          ? 'SOS envoyé depuis SafeWay'
          : 'SOS envoyé depuis SafeWay (GPS indisponible)',
      })
      .select()
      .single()

    if (error) {
      setSosError("Erreur lors de l'envoi. Réessayez.")
    } else {
      onSOS(data)
    }
    setSosLoading(false)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = userProfile?.nome?.split(' ')[0] || session.user.email?.split('@')[0] || 'vous'

  const s = styles

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <p style={s.greeting}>{greeting},</p>
            <h2 style={s.name}>{firstName} 👋</h2>
          </div>
          <div style={s.logoCircle}>
            <SafeWayLogo size={30} shieldColor="white" shieldColor2="rgba(255,255,255,0.85)" />
          </div>
        </div>
      </div>

      <div style={s.statusCard}>
        <div style={s.statusLeft}>
          <div style={s.statusDot} />
          <div>
            <p style={s.statusTitle}>Vous êtes en sécurité</p>
            <p style={s.statusSub}>Aucune alerte active</p>
          </div>
        </div>
        <span style={s.statusCheck}>✓</span>
      </div>

      <div style={s.sosSection}>
        <p style={s.sosLabel}>APPUYEZ EN CAS D'URGENCE</p>

        <div style={s.sosRing}>
          <button
            style={{
              ...s.sosBtn,
              transform: sosLoading ? 'scale(0.95)' : 'scale(1)',
              opacity: sosLoading ? 0.8 : 1,
            }}
            onClick={handleSOS}
            disabled={sosLoading}
          >
            <span style={s.sosBtnText}>{sosLoading ? '...' : 'SOS'}</span>
            <span style={s.sosBtnSub}>
              {sosLoading ? 'Envoi...' : 'Alerter mes contacts'}
            </span>
          </button>
        </div>

        {sosError && <p style={s.sosError}>{sosError}</p>}

        <p style={s.sosHint}>
          Votre position GPS sera partagée avec vos contacts de confiance
        </p>
      </div>

      <div style={s.infoCard}>
        <p style={s.infoTitle}>💡 Comment ça marche ?</p>
        <p style={s.infoText}>
          En cas d'urgence, appuyez sur SOS. Vos contacts de confiance seront
          immédiatement alertés avec votre position.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    paddingBottom: '16px',
  },
  header: {
    background: 'linear-gradient(135deg, #4ECDC4 0%, #2BB8AF 100%)',
    padding: '52px 24px 36px',
    borderRadius: '0 0 36px 36px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  name: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '800',
    margin: '4px 0 0',
    letterSpacing: '-0.3px',
  },
  logoCircle: {
    width: '52px',
    height: '52px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    background: 'white',
    margin: '16px 16px 8px',
    padding: '16px 20px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    background: '#4ECDC4',
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: '0 0 0 5px rgba(78,205,196,0.18)',
  },
  statusTitle: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#222',
    margin: 0,
  },
  statusSub: {
    fontSize: '12px',
    color: '#999',
    margin: '2px 0 0',
  },
  statusCheck: {
    color: '#4ECDC4',
    fontWeight: '700',
    fontSize: '22px',
  },
  sosSection: {
    padding: '24px 24px 16px',
    textAlign: 'center',
  },
  sosLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: '1.8px',
    marginBottom: '28px',
  },
  sosRing: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: 'rgba(255,107,157,0.10)',
    marginBottom: '24px',
  },
  sosBtn: {
    width: '188px',
    height: '188px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #FF6B9D, #FF3F7A)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 40px rgba(255,107,157,0.55)',
    transition: 'all 0.18s ease',
    fontFamily: 'Inter, sans-serif',
  },
  sosBtnText: {
    color: 'white',
    fontSize: '54px',
    fontWeight: '800',
    lineHeight: 1,
    letterSpacing: '-1px',
  },
  sosBtnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '10px',
    fontWeight: '500',
    marginTop: '6px',
    letterSpacing: '0.3px',
  },
  sosError: {
    color: '#FF6B6B',
    fontSize: '13px',
    marginBottom: '8px',
  },
  sosHint: {
    fontSize: '12px',
    color: '#AAAAAA',
    lineHeight: '1.6',
    maxWidth: '260px',
    margin: '0 auto',
  },
  infoCard: {
    background: 'linear-gradient(135deg, rgba(102,126,234,0.06), rgba(78,205,196,0.06))',
    border: '1.5px solid rgba(102,126,234,0.12)',
    margin: '0 16px',
    padding: '16px 18px',
    borderRadius: '18px',
  },
  infoTitle: {
    fontWeight: '600',
    fontSize: '13px',
    color: '#667EEA',
    margin: '0 0 6px',
  },
  infoText: {
    fontSize: '12px',
    color: '#777',
    margin: 0,
    lineHeight: '1.6',
  },
}
