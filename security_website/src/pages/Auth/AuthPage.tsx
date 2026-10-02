import { Link } from 'react-router-dom'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import { LoginForm } from './LoginPage'

function AuthPage() {
  return (
    <DraggableWorkspace pageKey="auth">
      <section className="auth-page auth-toggle-page">
        <div className="card auth-card">
          <p className="eyebrow">Member access</p>
          <h1>Welcome back.</h1>
          <p className="muted">Membership applications are reviewed by an administrator. Approved applicants can sign in with their existing password or a temporary password provided by the club.</p>
          <LoginForm />
          <p className="muted">New to Security Club? <Link className="auth-text-link" to="/membership">Apply for membership</Link></p>
        </div>
      </section>
    </DraggableWorkspace>
  )
}

export default AuthPage
