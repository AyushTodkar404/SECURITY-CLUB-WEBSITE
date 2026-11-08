import { Link } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { getFlagships, createFlagship, deleteFlagship } from '../../api/client'
import { flagships as defaultFlagships, type Flagship } from '../../data/flagships'
import { useAdmin } from '../../hooks/useAdmin'
import DeviceImageUploader from '../../components/common/DeviceImageUploader'

export default function FlagshipsPage() {
  const isAdmin = useAdmin()
  const [items, setItems] = useState<Flagship[]>(defaultFlagships)

  // Admin add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formYear, setFormYear] = useState('2026')
  const [formFormat, setFormFormat] = useState('Hands-on Defensive & Offensive Lab')
  const [formDescription, setFormDescription] = useState('')
  const [formImage, setFormImage] = useState('')

  useEffect(() => {
    let active = true
    getFlagships()
      .then((data) => {
        if (!active) return
        if (data && data.length > 0) {
          const merged = data.map((apiItem) => {
            const fallback = defaultFlagships.find(
              (f) => f.title.toLowerCase() === apiItem.title.toLowerCase() || f.id === apiItem.id
            )
            return {
              ...fallback,
              ...apiItem,
              pillars: fallback?.pillars,
              format: fallback?.format || (apiItem as any).format,
              cycle: fallback?.cycle || (apiItem as any).cycle,
              badge: fallback?.badge || (apiItem.title.toLowerCase().includes('siege') ? 'siege' : 'sprint'),
              status: fallback?.status || (apiItem as any).status,
            }
          })
          setItems(merged)
        }
      })
      .catch(() => {
        // Fallback already set
      })
    return () => {
      active = false
    }
  }, [])

  const handleAddFlagship = async (e: FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDescription.trim()) return
    setSubmitting(true)
    setAdminError(null)

    try {
      const created = await createFlagship({
        title: formTitle.trim(),
        description: formDescription.trim(),
        year: formYear,
        image: formImage.trim() || undefined,
      })

      const newFlagship: Flagship = {
        id: created.id || Date.now(),
        title: created.title || formTitle.trim(),
        description: formDescription.trim(),
        format: formFormat.trim() || undefined,
        cycle: `${formYear} Edition`,
        status: 'published',
        badge: formTitle.toLowerCase().includes('siege') ? 'siege' : 'sprint',
        year: formYear,
      }

      setItems((prev) => [newFlagship, ...prev])
      setShowAddModal(false)
      setFormTitle('')
      setFormDescription('')
      setFormImage('')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to create flagship initiative')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFlagship = async (item: Flagship) => {
    if (!window.confirm(`Delete flagship initiative "${item.title}"?`)) return
    try {
      if (item.id) {
        await deleteFlagship(item.id)
      }
      setItems((prev) =>
        prev.filter((f) => (f.id && item.id ? f.id !== item.id : f.title !== item.title))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete flagship initiative')
    }
  }

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Our signature initiatives</p>
          <h1>Programs that turn curiosity into capability.</h1>
          <p className="hero-lede">
            Our recurring initiatives create clear ways to learn, practise and contribute throughout
            the academic year.
          </p>
        </div>
      </section>

      {isAdmin && (
        <div className="admin-action-bar">
          <div className="admin-badge-group">
            <span className="admin-badge-tag">Admin Mode</span>
            <p>You have permission to register new flagship initiatives or archive existing ones.</p>
          </div>
          <button
            type="button"
            className="admin-btn-add"
            onClick={() => {
              setAdminError(null)
              setShowAddModal(true)
            }}
          >
            + Add Flagship Initiative
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create Flagship Initiative</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {adminError && <div className="admin-form-error">{adminError}</div>}

            <form onSubmit={handleAddFlagship} className="admin-form-grid">
              <div className="admin-field-group">
                <label htmlFor="flagship-title">Program Title *</label>
                <input
                  id="flagship-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Cyber Siege 2026"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="flagship-year">Academic Year *</label>
                  <input
                    id="flagship-year"
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    min="2020"
                    max="2035"
                    placeholder="2026"
                  />
                </div>
                <div className="admin-field-group">
                  <label htmlFor="flagship-format">Program Format</label>
                  <input
                    id="flagship-format"
                    type="text"
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    placeholder="e.g. 4-Week Attack & Defense Sandbox"
                  />
                </div>
              </div>

              <DeviceImageUploader
                value={formImage}
                onChange={setFormImage}
                label="Flagship Emblem / Image from Device"
              />

              <div className="admin-field-group">
                <label htmlFor="flagship-desc">Description *</label>
                <textarea
                  id="flagship-desc"
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline the structure, goals, target audience, and expected outcomes..."
                />
              </div>

              <div className="admin-form-footer">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Flagship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flagship-browser">
        <div className="flagship-overview-banner">
          <div className="flagship-banner-meta">
            <span className="status-beacon" aria-hidden="true" />
            <span className="flagship-badge-lead">Flagship Initiatives</span>
          </div>
          <p className="flagship-banner-text">
            Annual programs designed to guide students from introductory fundamentals to hands-on security practice.
          </p>
        </div>

        <div className="card-grid flagship-grid">
          {items.map((item, index) => {
            const numTag = `Initiative 0${index + 1}`
            const isSiege = item.badge === 'siege' || /siege/i.test(item.title)
            const emblemSvg = isSiege ? (
              <svg viewBox="0 0 48 48" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M24 4 L40 10 V22 C40 32 32 40 24 44 C16 40 8 32 8 22 Z" stroke="var(--cyan)" fill="rgba(0,229,255,0.06)" />
                <path d="M24 14 L32 24 L24 34 L16 24 Z" stroke="var(--green)" />
                <circle cx="24" cy="24" r="3" fill="var(--green)" />
              </svg>
            ) : (
              <svg viewBox="0 0 48 48" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="8" y="10" width="32" height="28" rx="3" stroke="var(--cyan)" fill="rgba(0,229,255,0.06)" />
                <path d="M16 20 L24 14 L32 20" stroke="var(--green)" />
                <path d="M16 28 L24 34 L32 28" stroke="var(--green)" />
                <circle cx="24" cy="24" r="2.5" fill="var(--cyan)" />
              </svg>
            )

            return (
              <article className="card flagship-card" key={item.id ? `${item.id}-${item.title}` : item.title}>
                <div className="flagship-card-header">
                  <div className="flagship-meta-left">
                    <span className="flagship-num-pill">{numTag}</span>
                    <span className="flagship-status-pill">
                      {item.status || item.cycle || '2026-27 Edition'}
                    </span>
                  </div>
                  <div className="flagship-emblem">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                    ) : (
                      emblemSvg
                    )}
                  </div>
                </div>

                <div className="card-body flagship-card-body">
                  {item.format && <p className="flagship-format-tag">{item.format}</p>}
                  <h3 className="flagship-title">{item.title}</h3>
                  <div className="flagship-divider" aria-hidden="true" />
                  <p className="flagship-desc">{item.description}</p>

                  {item.pillars && item.pillars.length > 0 && (
                    <div className="flagship-pillars">
                      {item.pillars.map((pillar) => (
                        <span className="flagship-pillar-tag" key={pillar}>
                          <span className="pillar-bullet" aria-hidden="true">&bull;</span>
                          {pillar}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flagship-card-actions">
                    <Link className="button button-primary button-sm" to="/submission">
                      Register Interest &rarr;
                    </Link>
                    <Link className="button button-ghost button-sm" to="/contact">
                      Inquire Details &nearr;
                    </Link>
                  </div>

                  {isAdmin && (
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => handleDeleteFlagship(item)}
                        title={`Delete ${item.title}`}
                      >
                        ✕ Delete Flagship
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
