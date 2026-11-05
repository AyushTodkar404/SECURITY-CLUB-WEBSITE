import { Link } from 'react-router-dom'
import { LoginForm } from './LoginPage'

export default function AuthPage() {
  return (
    <div className="page section-shell">
      <section className="auth-page auth-toggle-page">
        <div className="card auth-card" style={{ maxWidth: '480px', margin: '2rem auto' }}>
          <p className="eyebrow">Member access</p>
          <h1>Welcome back.</h1>
          <p className="muted" style={{ margin: '0.5rem 0 1.5rem', color: 'var(--muted)' }}>
            Membership applications are reviewed by an administrator. Approved applicants can sign
            in with their account credentials or a temporary password provided by the club.
          </p>
          <LoginForm />
          <p className="muted" style={{ marginTop: '1.5rem', color: 'var(--muted)', textAlign: 'center' }}>
            New to Security Club?{' '}
            <Link className="auth-text-link" to="/membership" style={{ color: 'var(--cyan)' }}>
              Apply for membership &rarr;
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
