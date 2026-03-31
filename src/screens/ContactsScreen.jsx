import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AVATAR_COLORS = ['#667EEA', '#4ECDC4', '#FF6B9D']

export default function ContactsScreen({ session }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [form, setForm] = useState({ nome: '', telefone: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [session])

  const fetchContacts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'ativo')
      .order('created_at', { ascending: true })
    setContacts(data || [])
    setLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (editingContact) {
      const { error } = await supabase
        .from('trusted_contacts')
        .update({ nome: form.nome, telefone: form.telefone })
        .eq('id', editingContact.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      if (contacts.length >= 3) {
        setError('Vous avez atteint le maximum de 3 contacts.')
        setSaving(false)
        return
      }
      // Garantir que o perfil existe na tabela users antes de inserir o contacto
      await supabase.from('users').upsert({
        id: session.user.id,
        email: session.user.email,
        plano: 'gratis',
      }, { onConflict: 'id' })

      const { error } = await supabase
        .from('trusted_contacts')
        .insert({
          user_id: session.user.id,
          nome: form.nome,
          telefone: form.telefone,
          status: 'ativo',
        })
      if (error) { setError(error.message); setSaving(false); return }
    }

    setSaving(false)
    setShowForm(false)
    setEditingContact(null)
    setForm({ nome: '', telefone: '' })
    fetchContacts()
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setForm({ nome: contact.nome, telefone: contact.telefone })
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id) => {
    await supabase
      .from('trusted_contacts')
      .update({ status: 'inativo' })
      .eq('id', id)
    fetchContacts()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContact(null)
    setForm({ nome: '', telefone: '' })
    setError('')
  }

  const s = styles

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>Contacts de confiance</h2>
        <p style={s.subtitle}>
          {contacts.length}/3 contacts · Alertés en cas d'urgence
        </p>
      </div>

      <div style={s.content}>
        {loading ? (
          <p style={s.emptyMsg}>Chargement...</p>
        ) : (
          <>
            {contacts.length === 0 && !showForm && (
              <div style={s.emptyState}>
                <span style={{ fontSize: '52px' }}>👥</span>
                <p style={s.emptyTitle}>Aucun contact</p>
                <p style={s.emptyText}>
                  Ajoutez jusqu'à 3 contacts de confiance qui seront alertés
                  immédiatement si vous appuyez sur SOS.
                </p>
              </div>
            )}

            {contacts.length > 0 && (
              <div style={s.list}>
                {contacts.map((c, idx) => (
                  <div key={c.id} style={s.card}>
                    <div style={{ ...s.avatar, background: AVATAR_COLORS[idx % 3] }}>
                      {c.nome.charAt(0).toUpperCase()}
                    </div>
                    <div style={s.info}>
                      <p style={s.contactName}>{c.nome}</p>
                      <p style={s.contactPhone}>{c.telefone}</p>
                    </div>
                    <div style={s.actions}>
                      <button style={s.callBtn} onClick={() => { window.location.href = 'tel:' + c.telefone }}>📞</button>
                      <button style={s.editBtn} onClick={() => handleEdit(c)}>✏️</button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(c.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showForm ? (
              <div style={s.form}>
                <h3 style={s.formTitle}>
                  {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
                </h3>
                <form onSubmit={handleSave}>
                  <div style={s.inputGroup}>
                    <label style={s.label}>Nom complet</label>
                    <input
                      style={s.input}
                      type="text"
                      placeholder="Marie Dupont"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.label}>Téléphone</label>
                    <input
                      style={s.input}
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p style={s.error}>{error}</p>}
                  <div style={s.btnRow}>
                    <button type="button" style={s.cancelBtn} onClick={handleCancel}>
                      Annuler
                    </button>
                    <button type="submit" style={s.saveBtn} disabled={saving}>
                      {saving ? '...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            ) : contacts.length < 3 ? (
              <button style={s.addBtn} onClick={() => setShowForm(true)}>
                + Ajouter un contact
              </button>
            ) : (
              <div style={s.limitBadge}>
                ✓ Maximum de 3 contacts atteint
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #667EEA 0%, #764AF1 100%)',
    padding: '52px 24px 36px',
    borderRadius: '0 0 36px 36px',
  },
  title: {
    color: 'white',
    fontSize: '26px',
    fontWeight: '800',
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '13px',
    margin: 0,
    fontWeight: '500',
  },
  content: {
    padding: '20px 16px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  card: {
    background: 'white',
    borderRadius: '18px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '20px',
    flexShrink: 0,
  },
  info: {
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
    color: '#999',
    margin: '3px 0 0',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  callBtn: {
    background: 'rgba(78,205,196,0.08)',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 10px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  editBtn: {
    background: 'rgba(102,126,234,0.08)',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 10px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  deleteBtn: {
    background: 'rgba(255,107,107,0.08)',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 10px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px 32px',
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: '18px',
    color: '#333',
    margin: '14px 0 8px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#999',
    lineHeight: '1.6',
    maxWidth: '280px',
    margin: '0 auto',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#AAA',
    padding: '40px 0',
  },
  form: {
    background: 'white',
    borderRadius: '18px',
    padding: '22px 20px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    marginBottom: '14px',
  },
  formTitle: {
    fontWeight: '700',
    fontSize: '17px',
    color: '#222',
    margin: '0 0 18px',
  },
  inputGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '13px 15px',
    border: '1.5px solid #E8E8F0',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    background: '#FAFAFA',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#333',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
  },
  cancelBtn: {
    flex: 1,
    padding: '13px',
    background: '#F0F0F5',
    color: '#666',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '13px',
    background: 'linear-gradient(135deg, #667EEA, #764AF1)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  },
  addBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667EEA, #764AF1)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  },
  limitBadge: {
    textAlign: 'center',
    padding: '14px',
    color: '#4ECDC4',
    fontWeight: '600',
    fontSize: '14px',
    background: 'rgba(78,205,196,0.08)',
    borderRadius: '12px',
    border: '1.5px solid rgba(78,205,196,0.2)',
  },
  error: {
    color: '#FF6B6B',
    fontSize: '13px',
    marginBottom: '10px',
    background: 'rgba(255,107,107,0.08)',
    padding: '10px 12px',
    borderRadius: '8px',
  },
}
