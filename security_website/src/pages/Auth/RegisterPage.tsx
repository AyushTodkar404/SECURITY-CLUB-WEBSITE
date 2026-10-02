import { useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import { register } from '../../api/client'

interface RegisterFormProps {
  onLogin?: () => void
}

export function RegisterForm({ onLogin }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await register({ displayName, email, password })
      window.location.assign('/')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to register')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <label htmlFor="register-name">Display name</label>
        <input id="register-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
        <label htmlFor="register-email">Email</label>
        <input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="register-password">Password</label>
        <input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
        {error ? <p role="alert">{error}</p> : null}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Register'}</Button>
      </form>
      {onLogin ? <p className="muted">Already registered? <button type="button" className="auth-text-button" onClick={onLogin}>Log in</button></p> : null}
    </>
  )
}

function RegisterPage() {
  return (
    <DraggableWorkspace pageKey="register">
      <section className="auth-page">
        <div className="card auth-card">
          <h2>Create account</h2>
          <p className="muted">New accounts start with visitor access. Apply for membership to be reviewed for Member or Administrator access.</p>
          <RegisterForm />
        </div>
      </section>
    </DraggableWorkspace>
  )
}

export default RegisterPage
