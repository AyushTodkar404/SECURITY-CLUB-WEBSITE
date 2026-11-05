import { useState } from 'react'
import { awareness, type AwarenessItem } from '../../data/awareness'

export default function AwarenessPage() {
  const [selectedYear, setSelectedYear] = useState('2026-27')
  const [selectedCat, setSelectedCat] = useState('all')
  const [activeLightboxItem, setActiveLightboxItem] = useState<AwarenessItem | null>(null)

  const years = Array.from(new Set(awareness.map((a) => a.year || '2026-27')))

  const filteredItems = awareness.filter((item) => {
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
              <article className="card awareness-card" key={item.title}>
                <div className="awareness-card-header">
                  <span className="awareness-cat-pill">{item.category}</span>
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
                <a
                  className="button button-primary button-sm awareness-lightbox-link"
                  href={activeLightboxItem.image}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Original ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

