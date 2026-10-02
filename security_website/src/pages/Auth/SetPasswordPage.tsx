import { useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import { changeTemporaryPassword } from '../../api/client'

function SetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [complete, setComplete] = useState(false)
    const [saving, setSaving] = useState(false)

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (password !== confirmation) {
            setError('Passwords do not match.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            await changeTemporaryPassword(password)
            setComplete(true)
        } catch (changeError) {
            setError(changeError instanceof Error ? changeError.message : 'Unable to update password')
        } finally {
            setSaving(false)
        }
    }

    return (
        <DraggableWorkspace pageKey="set-password">
            <section className="auth-page">
                <div className="card auth-card">
                    <h2>Choose a new password</h2>
                    {complete ? (
                        <>
                            <p>Your password has been changed. Your account is ready to use.</p>
                            <Button type="button" onClick={() => window.location.assign('/')}>Continue</Button>
                        </>
                    ) : (
                        <form className="form" onSubmit={submit}>
                            <label htmlFor="new-password">New password</label>
                            <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete="new-password" />
                            <label htmlFor="confirm-new-password">Confirm new password</label>
                            <input id="confirm-new-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required autoComplete="new-password" />
                            {error ? <p role="alert">{error}</p> : null}
                            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Set password'}</Button>
                        </form>
                    )}
                </div>
            </section>
        </DraggableWorkspace>
    )
}

export default SetPasswordPage