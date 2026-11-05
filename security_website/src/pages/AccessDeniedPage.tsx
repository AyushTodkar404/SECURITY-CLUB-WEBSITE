import { Link } from 'react-router-dom'

interface AccessDeniedPageProps {
  requestedPath?: string
}

export default function AccessDeniedPage({ requestedPath }: AccessDeniedPageProps) {
  const path = requestedPath || (typeof window !== 'undefined' ? window.location.pathname : '')

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow" style={{ color: '#ef4444' }}>Access Restriction</p>
          <h1>Access denied</h1>
          <p className="hero-lede">
            You do not have permission to view <code>{path}</code>. This area requires member login or elevated administrative permissions.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Link className="button button-primary" to="/auth">
              Sign in with credentials →
            </Link>
            <Link className="button button-ghost" to="/">
              Return home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
