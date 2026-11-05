import { Link } from 'react-router-dom'

interface NotFoundPageProps {
  requestedPath?: string
}

export default function NotFoundPage({ requestedPath }: NotFoundPageProps) {
  const path = requestedPath || (typeof window !== 'undefined' ? window.location.pathname : '')

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Status · 404</p>
          <h1>Page not found.</h1>
          <p className="hero-lede">
            The route <code>{path}</code> does not match any published node on the Security Club network.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Link className="button button-primary" to="/">
              Return home →
            </Link>
            <Link className="button button-ghost" to="/events">
              Explore events
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
