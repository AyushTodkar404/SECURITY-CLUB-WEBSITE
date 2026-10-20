import { Link } from 'react-router-dom'
import DraggableWorkspace from '../components/layout/DraggableWorkspace'
import Button from '../components/ui/Button'

interface NotFoundPageProps {
  requestedPath: string
}

function NotFoundPage({ requestedPath }: NotFoundPageProps) {
  return (
    <DraggableWorkspace pageKey="not-found">
      <section className="auth-page">
        <div className="card auth-card not-found-card" style={{ maxWidth: '540px' }}>
          <p className="eyebrow" style={{ color: '#ef4444' }}>Error 404 · Signal Lost</p>
          <h1 style={{ fontSize: '2.5rem', margin: '0.25rem 0' }}>404 Target Not Found</h1>
          <p className="muted">
            The coordinates <strong>{requestedPath}</strong> do not correspond to any known node on the Security Club network.
          </p>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#10b981',
              margin: '1rem 0',
              textAlign: 'left',
            }}
          >
            <div>[SYS_DIAG] status: 404_ROUTE_UNDEFINED</div>
            <div>[SYS_DIAG] query_path: {requestedPath}</div>
            <div>[SYS_DIAG] action: abort_and_redirect_home</div>
          </div>
          <div className="actions" style={{ marginTop: '1rem' }}>
            <Link to="/">
              <Button>Return to Base</Button>
            </Link>
            <Link to="/events">
              <Button variant="outline">Browse Events</Button>
            </Link>
          </div>
        </div>
      </section>
    </DraggableWorkspace>
  )
}

export default NotFoundPage
