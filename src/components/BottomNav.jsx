const NAV_ITEMS = [
  { id: 'home',     label: 'Accueil',  icon: '🏠' },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'alert',    label: 'Alerte',   icon: '🔔' },
  { id: 'profile',  label: 'Profil',   icon: '👤' },
]

export default function BottomNav({ current, onChange, hasActiveAlert }) {
  return (
    <div style={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive = current === item.id
        const isAlertTab = item.id === 'alert'
        const alertActive = isAlertTab && hasActiveAlert

        const activeColor = alertActive ? '#FF6B6B' : '#667EEA'
        const icon = alertActive ? '🚨' : item.icon

        return (
          <button
            key={item.id}
            style={styles.item}
            onClick={() => onChange(item.id)}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
              {alertActive && (
                <span style={styles.badge} />
              )}
            </div>
            <span style={{
              ...styles.label,
              color: isActive ? activeColor : '#BBBBBB',
              fontWeight: isActive ? '700' : '500',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{ ...styles.activeLine, background: activeColor }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '390px',
    background: 'white',
    borderTop: '1px solid #F0F0F0',
    display: 'flex',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
    zIndex: 1000,
  },
  item: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '10px 0 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    fontFamily: 'Inter, sans-serif',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '0.2px',
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-4px',
    width: '9px',
    height: '9px',
    background: '#FF6B6B',
    borderRadius: '50%',
    border: '2px solid white',
  },
  activeLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '2.5px',
    borderRadius: '0 0 3px 3px',
  },
}
