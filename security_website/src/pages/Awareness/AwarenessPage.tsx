import { useEffect, useState, type FormEvent } from 'react'
import { getAwareness, createAwarenessItem, deleteAwarenessItem } from '../../api/client'
import { awareness as defaultAwareness, type AwarenessItem } from '../../data/awareness'
import { useAdmin } from '../../hooks/useAdmin'
import DeviceImageUploader from '../../components/common/DeviceImageUploader'

export default function AwarenessPage() {
  const isAdmin = useAdmin()
  const [items, setItems] = useState<AwarenessItem[]>(defaultAwareness)
  const [selectedYear, setSelectedYear] = useState('2026-27')
  const [selectedCat, setSelectedCat] = useState('all')
  const [activeLightboxItem, setActiveLightboxItem] = useState<AwarenessItem | null>(null)

  // Admin state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Cyber Advisory')
  const [formYear, setFormYear] = useState('2026-27')
  const [formDate, setFormDate] = useState('July 2026')
  const [formImage, setFormImage] = useState('')
  const [formDescription, setFormDescription] = useState('')

  useEffect(() => {
    let active = true
    getAwareness()
      .then((data) => {
        if (!active) return
        if (data && data.length > 0) {
          const merged = data.map((apiItem) => {
            const fallback = defaultAwareness.find(
              (a) => a.title.toLowerCase() === apiItem.title.toLowerCase() || a.id === apiItem.id
            )
            return {
              ...fallback,
              ...apiItem,
              image: apiItem.image || fallback?.image || '',
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

  const handleAddCampaign = async (e: FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formImage.trim()) return
    setSubmitting(true)
    setAdminError(null)

    try {
      const created = await createAwarenessItem({
        title: formTitle.trim(),
        category: formCategory.trim(),
        year: formYear.trim(),
        date: formDate.trim(),
        imageUrl: formImage.trim(),
        alt: formTitle.trim(),
        description: formDescription.trim(),
      })

      const newItem: AwarenessItem = {
        id: created.id || Date.now(),
        title: created.title || formTitle.trim(),
        category: formCategory.trim(),
        year: formYear.trim(),
        date: formDate.trim(),
        image: formImage.trim(),
        alt: formTitle.trim(),
        description: formDescription.trim(),
      }

      setItems((prev) => [newItem, ...prev])
      setShowAddModal(false)
      setFormTitle('')
      setFormImage('')
      setFormDescription('')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to publish awareness campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCampaign = async (item: AwarenessItem) => {
    if (!window.confirm(`Delete awareness campaign "${item.title}"?`)) return
    try {
      if (item.id) {
        await deleteAwarenessItem(item.id)
      }
      setItems((prev) =>
        prev.filter((a) => (a.id && item.id ? a.id !== item.id : a.title !== item.title))
      )
      if (activeLightboxItem?.title === item.title) {
        setActiveLightboxItem(null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete campaign')
    }
  }

  const years = Array.from(new Set(items.map((a) => a.year || '2026-27')))

  const filteredItems = items.filter((item) => {
    const matchesYear = !item.year || item.year === selectedYear
    const matchesCat =
      selectedCat === 'all' || item.category.toLowerCase().includes(selectedCat.toLowerCase())
    return matchesYear && matchesCat
  })

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Campus Cyber Awareness</p>
          <h1>Empowering students with proactive cybersecurity alerts, tips, and campaigns.</h1>
          <p className="hero-lede">
            Visual alerts, campaign posters, and practical security advisories published by the
            club to cultivate campus-wide digital defense.
          </p>
        </div>
      </section>

      {isAdmin && (
        <div className="admin-action-bar">
          <div className="admin-badge-group">
            <span className="admin-badge-tag">Admin Mode</span>
            <p>You have permission to publish new awareness advisories or archive existing posters.</p>
          </div>
          <button
            type="button"
            className="admin-btn-add"
            onClick={() => {
              setAdminError(null)
              setShowAddModal(true)
            }}
          >
            + Add Awareness Campaign
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Publish Cyber Awareness Alert</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {adminError && <div className="admin-form-error">{adminError}</div>}

            <form onSubmit={handleAddCampaign} className="admin-form-grid">
              <div className="admin-field-group">
                <label htmlFor="aware-title">Campaign Title *</label>
                <input
                  id="aware-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Defend Against QR Code Phishing (Quishing)"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="aware-cat">Category *</label>
                  <select
                    id="aware-cat"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Cyber Advisory">Cyber Advisory</option>
                    <option value="Campaign Poster">Campaign Poster</option>
                    <option value="Security Guide">Security Guide</option>
                    <option value="Threat Notice">Threat Notice</option>
                  </select>
                </div>
                <div className="admin-field-group">
                  <label htmlFor="aware-year">Year *</label>
                  <input
                    id="aware-year"
                    type="text"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2026-27"
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label htmlFor="aware-date">Date Label</label>
                <input
                  id="aware-date"
                  type="text"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  placeholder="e.g. July 2026"
                />
              </div>

              {/* Direct image upload from device */}
              <DeviceImageUploader
                value={formImage}
                onChange={setFormImage}
                label="Campaign Poster / Infographic from Device *"
                required
                helpText="Select or drag campaign graphic from your device (PNG, JPG, WebP, SVG)"
              />

              <div className="admin-field-group">
                <label htmlFor="aware-desc">Description &amp; Actionable Tips</label>
                <textarea
                  id="aware-desc"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline preventive measures, red flags to inspect, and response guidelines..."
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
                  disabled={submitting || !formImage}
                >
                  {submitting ? 'Publishing...' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="awareness-browser">
        <div className="team-controls-bar awareness-controls-bar">
          <div className="team-years awareness-years" role="group" aria-label="Select awareness campaign year">
            {years.map((year) => (
              <button
                key={year}
                className={`gallery-year-button awareness-year-button ${year === selectedYear ? 'is-active' : ''}`}
                type="button"
                aria-pressed={year === selectedYear}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="team-filters awareness-filters" role="group" aria-label="Filter awareness campaigns">
            {[
              { id: 'all', label: 'All Campaigns' },
              { id: 'advisory', label: 'Advisories' },
              { id: 'poster', label: 'Posters' },
              { id: 'guide', label: 'Guides' },
            ].map((cat) => (
              <button
                key={cat.id}
                className={`team-filter-button ${selectedCat === cat.id ? 'is-active' : ''}`}
                type="button"
                aria-pressed={selectedCat === cat.id}
                onClick={() => setSelectedCat(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="awareness-empty">
            <p className="team-empty">No awareness posters found for this selection.</p>
          </div>
        ) : (
          <div className="card-grid awareness-grid">
            {filteredItems.map((item) => (
              <article className="card awareness-card" key={item.id ? `${item.id}-${item.title}` : item.title}>
                <div className="awareness-card-header">
                  <span className="awareness-cat-pill">
                    {item.category.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <span className="awareness-year-pill">{item.year}</span>
                </div>

                {item.image && (
                  <div className="awareness-image-wrapper">
                    <button
                      className="awareness-image-btn"
                      type="button"
                      aria-label={`Enlarge ${item.title}`}
                      onClick={() => setActiveLightboxItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.title || item.alt}
                        className="awareness-poster-img is-loaded"
                        loading="lazy"
                      />
                      <span className="awareness-image-overlay" aria-hidden="true">
                        <span className="awareness-overlay-text">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>{' '}
                          View Poster
                        </span>
                      </span>
                    </button>
                  </div>
                )}

                <div className="card-body awareness-card-body">
                  {item.date && <p className="awareness-date">{item.date}</p>}
                  <h3 className="awareness-card-title">{item.title}</h3>
                  <div className="awareness-card-divider" aria-hidden="true" />
                  <p className="awareness-card-desc">{item.description}</p>
                  <div className="awareness-card-actions">
                    <button
                      className="button button-ghost button-sm awareness-preview-btn"
                      type="button"
                      onClick={() => setActiveLightboxItem(item)}
                    >
                      View Poster
                    </button>
                    <a
                      className="button button-primary button-sm"
                      href={item.image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Full Res ↗
                    </a>
                  </div>

                  {isAdmin && (
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => handleDeleteCampaign(item)}
                        title={`Delete ${item.title}`}
                      >
                        ✕ Delete Campaign
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {activeLightboxItem && (
          <div
            className="awareness-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded awareness poster"
            onClick={() => setActiveLightboxItem(null)}
          >
            <button
              className="awareness-lightbox-close"
              type="button"
              aria-label="Close image"
              onClick={() => setActiveLightboxItem(null)}
            >
              &times;
            </button>
            <div
              className="awareness-lightbox-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeLightboxItem.image}
                alt={activeLightboxItem.title}
                className="awareness-lightbox-img"
              />
              <div className="awareness-lightbox-info">
                <h3 className="awareness-lightbox-title">{activeLightboxItem.title}</h3>
                <p className="awareness-lightbox-caption">{activeLightboxItem.description}</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <a
                    className="button button-primary button-sm awareness-lightbox-link"
                    href={activeLightboxItem.image}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Original ↗
                  </a>
                  {isAdmin && (
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={() => handleDeleteCampaign(activeLightboxItem)}
                    >
                      ✕ Delete Campaign
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
