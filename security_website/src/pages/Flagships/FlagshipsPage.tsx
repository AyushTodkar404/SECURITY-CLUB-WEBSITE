import { Link } from 'react-router-dom'
import { flagships } from '../../data/flagships'

export default function FlagshipsPage() {
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
          {flagships.map((item, index) => {
            const numTag = `FLAGSHIP 0${index + 1}`
            const isSiege = item.badge === 'siege' || /siege/i.test(item.title)
            const emblemSvg = isSiege ? (
              <svg viewBox="0 0 48 48" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M24 4 L40 10 V22 C40 32 32 40 24 44 C16 40 8 32 8 22 V10 Z" stroke="var(--cyan)" fill="rgba(0,229,255,0.06)" />
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
              <article className="card flagship-card" key={item.title}>
                <div className="flagship-card-header">
                  <div className="flagship-meta-left">
                    <span className="flagship-num-pill">{numTag}</span>
                    <span className="flagship-status-pill">
                      {item.status || item.cycle || '2026-27 Edition'}
                    </span>
                  </div>
                  <div className="flagship-emblem">{emblemSvg}</div>
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
                          <span className="pillar-bullet" aria-hidden="true">◈</span>
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
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
