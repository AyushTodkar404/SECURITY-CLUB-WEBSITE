import { useEffect, useState } from 'react'
import { getEvents } from '../../api/client'
import { events as defaultEvents, type EventItem } from '../../data/events'

function eventYear(dateStr?: string) {
  const value = String(dateStr || '').trim()
  const iso = value.match(/^(\d{4})[-/]/)
  const dayFirst = value.match(/^\d{1,2}[-/]\d{1,2}[-/](\d{4})$/)
  return (iso && iso[1]) || (dayFirst && dayFirst[1]) || '2026'
}

export default function EventsPage() {
  const [items, setItems] = useState<EventItem[]>(defaultEvents)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null)

  useEffect(() => {
    let active = true
    getEvents()
      .then((data) => {
        if (!active) return
        if (data && data.length > 0) {
          // Merge API data with default event details like objectives and outcomes if present
          const merged = data.map((apiItem) => {
            const fallback = defaultEvents.find(
              (d) => d.title.toLowerCase() === apiItem.title.toLowerCase()
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
                  key={event.title}
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
          </div>
        </div>
      )}
    </div>
  )
}
