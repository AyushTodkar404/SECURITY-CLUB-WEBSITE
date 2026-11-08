import { useEffect, useState, type FormEvent } from 'react'
import { getEvents, createEvent, deleteEvent } from '../../api/client'
import { events as defaultEvents, type EventItem } from '../../data/events'
import { useAdmin } from '../../hooks/useAdmin'

function eventYear(dateStr?: string) {
  const value = String(dateStr || '').trim()
  const iso = value.match(/^(\d{4})[-/]/)
  const dayFirst = value.match(/^\d{1,2}[-/]\d{1,2}[-/](\d{4})$/)
  return (iso && iso[1]) || (dayFirst && dayFirst[1]) || '2026'
}

export default function EventsPage() {
  const isAdmin = useAdmin()
  const [items, setItems] = useState<EventItem[]>(defaultEvents)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null)

  // Admin add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState('workshop')
  const [formStartsAt, setFormStartsAt] = useState('')
  const [formVenue, setFormVenue] = useState('Seminar Hall')
  const [formSummary, setFormSummary] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPoster, setFormPoster] = useState('')
  const [formCapacity, setFormCapacity] = useState('60')

  useEffect(() => {
    let active = true
    getEvents()
      .then((data) => {
        if (!active) return
        if (data && data.length > 0) {
          const merged = data.map((apiItem) => {
            const fallback = defaultEvents.find(
              (d) => d.title.toLowerCase() === apiItem.title.toLowerCase() || d.id === apiItem.id
            )
            return {
              ...apiItem,
              poster: apiItem.poster || apiItem.image || fallback?.poster || fallback?.image,
              venue: apiItem.venue || fallback?.venue,
              speaker: fallback?.speaker,
              dateLabel: fallback?.dateLabel,
              objectives: fallback?.objectives,
              outcomes: fallback?.outcomes,
              attachments: fallback?.attachments,
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

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formStartsAt) return
    setSubmitting(true)
    setAdminError(null)

    try {
      const startsDate = new Date(formStartsAt).toISOString()
      const summaryText = formSummary.trim() || formTitle.trim()
      const descText = formDescription.trim() || summaryText

      const created = await createEvent({
        title: formTitle.trim(),
        type: formType as any,
        starts_at: startsDate,
        venue: formVenue.trim() || undefined,
        summary: summaryText,
        description: descText,
        poster: formPoster.trim() || undefined,
        capacity: Number(formCapacity) || undefined,
        status: 'published',
        tags: [formType],
      })

      const newEvent: EventItem = {
        id: created.id || Date.now(),
        title: created.title || formTitle.trim(),
        type: formType,
        date: startsDate,
        dateLabel: startsDate.slice(0, 10),
        venue: formVenue.trim() || 'Seminar Hall',
        description: descText,
        poster: formPoster.trim() || undefined,
        image: formPoster.trim() || undefined,
        tags: [formType],
      }

      setItems((prev) => [newEvent, ...prev])
      setShowAddModal(false)
      setFormTitle('')
      setFormSummary('')
      setFormDescription('')
      setFormPoster('')
      setFormStartsAt('')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async (event: EventItem) => {
    if (!window.confirm(`Delete event "${event.title}"?`)) return
    try {
      if (event.id) {
        await deleteEvent(event.id)
      }
      setItems((prev) =>
        prev.filter((e) => (e.id && event.id ? e.id !== event.id : e.title !== event.title))
      )
      if (activeEvent?.title === event.title) {
        setActiveEvent(null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  const years = Array.from(new Set(items.map((i) => eventYear(i.date)))).sort().reverse()
  const currentYear = years.includes(selectedYear) ? selectedYear : (years[0] || '2026')
  const yearItems = items.filter((item) => eventYear(item.date) === currentYear)

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Events archive</p>
          <h1>Learn together. Build together. Defend together.</h1>
          <p className="hero-lede">
            Browse Security Club events by year. Select a year to see that year’s workshops,
            bootcamps and community sessions.
          </p>
        </div>
      </section>

      {isAdmin && (
        <div className="admin-action-bar">
          <div className="admin-badge-group">
            <span className="admin-badge-tag">Admin Mode</span>
            <p>You have permission to schedule new events or archive existing sessions.</p>
          </div>
          <button
            type="button"
            className="admin-btn-add"
            onClick={() => {
              setAdminError(null)
              setShowAddModal(true)
            }}
          >
            + Add Event
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create New Event</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {adminError && <div className="admin-form-error">{adminError}</div>}

            <form onSubmit={handleAddEvent} className="admin-form-grid">
              <div className="admin-field-group">
                <label htmlFor="event-title">Event Title *</label>
                <input
                  id="event-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Hands-on Threat Hunting Workshop"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="event-type">Event Type *</label>
                  <select
                    id="event-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    <option value="workshop">Workshop</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="seminar">Seminar</option>
                    <option value="competition">Competition</option>
                    <option value="inauguration">Inauguration</option>
                  </select>
                </div>
                <div className="admin-field-group">
                  <label htmlFor="event-starts">Starts At (Date/Time) *</label>
                  <input
                    id="event-starts"
                    type="datetime-local"
                    required
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="event-venue">Venue</label>
                  <input
                    id="event-venue"
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="Seminar Hall / Lab 3 / Online"
                  />
                </div>
                <div className="admin-field-group">
                  <label htmlFor="event-capacity">Capacity</label>
                  <input
                    id="event-capacity"
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    min="1"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label htmlFor="event-poster">Poster / Image URL</label>
                <input
                  id="event-poster"
                  type="text"
                  value={formPoster}
                  onChange={(e) => setFormPoster(e.target.value)}
                  placeholder="/events/posters/... or https://..."
                />
              </div>

              <div className="admin-field-group">
                <label htmlFor="event-summary">Summary</label>
                <input
                  id="event-summary"
                  type="text"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="One sentence description of the session..."
                />
              </div>

              <div className="admin-field-group">
                <label htmlFor="event-desc">Full Description</label>
                <textarea
                  id="event-desc"
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed session agenda, speakers, requirements..."
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
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="event-browser">
        <div className="event-years" role="group" aria-label="Filter events by year">
          {years.map((year) => (
            <button
              key={year}
              className={`gallery-year-button event-year-button ${year === currentYear ? 'is-active' : ''}`}
              type="button"
              aria-pressed={year === currentYear}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <section className="event-year-group" aria-label={`Events in ${currentYear}`}>
          <div className="card-grid event-grid">
            {yearItems.map((event) => {
              const posterSrc = event.poster || event.image
              return (
                <article
                  key={event.id ? `${event.id}-${event.title}` : event.title}
                  className="card event-card"
                  data-event-id={event.title}
                  tabIndex={0}
                  onClick={() => setActiveEvent(event)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveEvent(event)
                    }
                  }}
                >
                  {posterSrc ? (
                    <img
                      src={posterSrc}
                      alt={event.title}
                      className="card-image is-loaded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-image card-placeholder" aria-hidden="true" />
                  )}

                  <div className="card-body">
                    <p className="card-meta">
                      {event.type.toUpperCase()} &middot; {event.dateLabel || event.date.slice(0, 10)}
                    </p>
                    <h3>{event.title}</h3>
                    {event.venue && <p className="role">&Omicron; {event.venue}</p>}
                    <p>{event.description}</p>
                    <p className="card-action-hint">View event details &rarr;</p>

                    {isAdmin && (
                      <div className="admin-card-actions">
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEvent(event)
                          }}
                          title={`Delete ${event.title}`}
                        >
                          ✕ Delete Event
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>

      {activeEvent && (
        <div
          className="event-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Event details"
          onClick={() => setActiveEvent(null)}
        >
          <div className="event-detail" onClick={(e) => e.stopPropagation()}>
            <button
              className="event-detail-close"
              type="button"
              aria-label="Close event details"
              onClick={() => setActiveEvent(null)}
            >
              &times;
            </button>
            <p className="eyebrow">{activeEvent.type || 'Event'}</p>
            <h2>{activeEvent.title}</h2>
            <p className="event-detail-meta">
              {[
                activeEvent.dateLabel || activeEvent.date.slice(0, 10),
                activeEvent.venue,
                activeEvent.speaker ? `Speaker: ${activeEvent.speaker}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p>{activeEvent.description}</p>

            {activeEvent.objectives && activeEvent.objectives.length > 0 && (
              <>
                <h3>Objectives</h3>
                <ol className="event-objectives">
                  {activeEvent.objectives.map((obj) => (
                    <li key={obj}>{obj}</li>
                  ))}
                </ol>
              </>
            )}

            {activeEvent.outcomes && activeEvent.outcomes.length > 0 && (
              <>
                <h3>Outcomes</h3>
                <div className="event-outcomes">
                  {activeEvent.outcomes.map((item, index) => {
                    const code =
                      typeof item === 'object' && item.code ? item.code : `CO${index + 1}`
                    const text =
                      typeof item === 'object' && item.text
                        ? item.text
                        : String(item).replace(/^CO\d+[:\s-]*/i, '')
                    return (
                      <div className="event-outcome-item" key={code}>
                        <span className="event-outcome-code">{code}</span>
                        <p>{text}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <h3>Attached files</h3>
            {activeEvent.attachments && activeEvent.attachments.length > 0 ? (
              <ul className="attachment-list">
                {activeEvent.attachments.map((file) => (
                  <li key={file.path}>
                    <a
                      className="button button-ghost attachment-link"
                      href={file.path.startsWith('/') ? file.path : `/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.label || file.path} &nearr;
                    </a>
                    <span>{file.type || 'File'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No files are attached to this event yet.</p>
            )}

            {isAdmin && (
              <div className="admin-card-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => handleDeleteEvent(activeEvent)}
                >
                  ✕ Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
