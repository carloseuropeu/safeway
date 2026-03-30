import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AVATAR_COLORS = ['#667EEA', '#4ECDC4', '#FF6B9D']

export default function AlertScreen({ session, alert, onCancel }) {
  const [contacts, setContacts] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchContacts()

    const startTime = alert?.created_at
      ? new Date(alert.created_at).getTime()
      : Date.now()

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [alert])

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'ativo')
    setContacts(data || [])
  }

  const handleCancel = async () => {
    setCancelling(true)
    if (alert?.id) {
      await supabase
        .from('sos_alerts')
        .update({ status: 'cancelado' })
        .eq('id', alert.id)
    }
    onCancel()
    setCancelling(false)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const s = styles

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.pulseRing} />
        <div style={s.pulseRing2} />
        <p style={s.alertLabel}>🚨 ALERTE ENVOYÉE !</p>
        <div style={s.timerBox}>
          <span style={s.timerText}>{formatTime(elapsed)}</span>
        </div>
        <p style={s.timerLabel}>Temps écoulé depuis l'alerte</p>
      </div>

      <div style={s.content}>
        <div style={s.section}>
          <p style={s.sectionTitle}>Contacts notifiés</p>

          {contacts.length === 0 ? (
            <div style={s.noContacts}>
              <p style={{ fontWeight: '600', color: '#FF6B6B' }}>
                ⚠️ Aucun contact de confiance
              </p>
              <p style={{ fontSize: '12px', color: '#AAA', marginTop: '4px' }}>
                Ajoutez des contacts dans l'onglet Contacts.
              </p>
            </div>
          ) : (
            contacts.map((c, idx) => (
              <div key={c.id} style={s.contactRow}>
                <div style={{ ...s.avatar, background: AVATAR_COLORS[idx % 3] }}>
                  {c.nome.charAt(0).toUpperCase()}
                </div>
                <div style={s.contactInfo}>
                  <p style={s.contactName}>{c.nome}</p>
                  <p style={s.contactPhone}>{c.telefone}</p>
                </div>
                <div style={s.checkCircle}>✓</div>
              </div>
            ))
          )}
        </div>

        {alert?.latitude && (
          <div style={s.locationCard}>
            <p style={s.locationTitle}>📍 Position partagée</p>
            <p style={s.locationCoords}>
              {Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)}
            </p>
          </div>
        )}

        <a href="tel:112" style={s.callBtn}>
          📞 Appeler le 112
        </a>

        <button
          style={{ ...s.cancelBtn, opacity: cancelling ? 0.7 : 1 }}
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? "Annulation en cours..." : "✕  Annuler l'alerte"}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFF5F5',
  },
  header: {
    background: 'linear-gradient(145deg, #FF6B6B 0%, #FF3E3E 100%)',
    padding: '52px 24px 44px',
    textAlign: 'center',
    borderRadius: '0 0 36px 36px',
    position: 'relative',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.12)',
    animation: 'pulse-ring 2s ease-out infinite',
  },
  pulseRing2: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.08)',
    animation: 'pulse-ring 2s ease-out infinite 0.6s',
  },
  alertLabel: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '800',
    margin: '0 0 24px',
    position: 'relative',
    letterSpacing: '0.5px',
    animation: 'blink 1.5s ease-in-out infinite',
  },
  timerBox: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.18)',
    borderRadius: '16px',
    padding: '10px 28px',
    marginBottom: '10px',
    position: 'relative',
  },
  timerText: {
    color: 'white',
    fontSize: '44px',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '2px',
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '12px',
    margin: 0,
    position: 'relative',
    fontWeight: '500',
  },
  content: {
    padding: '20px 16px',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: '15px',
    color: '#333',
    margin: '0 0 12px',
  },
  contactRow: {
    background: 'white',
    borderRadius: '16px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#222',
    margin: 0,
  },
  contactPhone: {
    fontSize: '13px',
    color: '#AAA',
    margin: '2px 0 0',
  },
  checkCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(78,205,196,0.12)',
    color: '#4ECDC4',
    fontWeight: '700',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContacts: {
    background: 'white',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
  },
  locationCard: {
    background: 'white',
    borderRadius: '14px',
    padding: '14px 16px',
    marginBottom: '14px',
    boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
  },
  locationTitle: {
    fontWeight: '600',
    fontSize: '13px',
    color: '#444',
    margin: '0 0 4px',
  },
  locationCoords: {
    fontSize: '12px',
    color: '#888',
    fontFamily: 'monospace',
    margin: 0,
  },
  callBtn: {
    display: 'block',
    width: '100%',
    padding: '17px',
    background: 'linear-gradient(135deg, #667EEA, #764AF1)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    marginBottom: '12px',
    boxSizing: 'border-box',
    letterSpacing: '0.3px',
  },
  cancelBtn: {
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
  },
}
