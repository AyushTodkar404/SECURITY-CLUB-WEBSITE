import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthSession, logout } from '../../api/client'
import type { AuthSession } from '../../types'

interface ProfilePageProps {
  session?: AuthSession
  onSessionChange?: (session: AuthSession) => void
}

export default function ProfilePage({ session, onSessionChange }: ProfilePageProps) {
  const navigate = useNavigate()
  const [loadedSession, setLoadedSession] = useState<AuthSession | null>(session ?? null)

  useEffect(() => {
    if (session) return
    getAuthSession().then(setLoadedSession).catch(() => navigate('/'))
  }, [session, navigate])

  const currentSession = session ?? loadedSession
  if (!currentSession) {
    return (
      <div className="page section-shell">
        <section className="page-hero">
          <p className="muted">Loading profile…</p>
        </section>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      onSessionChange?.({
        authenticated: false,
        role: 'visitor',
        user: null,
        permissions: [],
        positions: [],
      })
      navigate('/')
    }
  }

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile</h1>
          <p className="hero-lede">Manage your club identity, access, and membership status.</p>
        </div>
      </section>

      <div className="card profile-card" style={{ margin: '2rem 0', padding: '1.5rem' }}>
        <div className="profile-header-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div
            className="profile-avatar"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--surface-elevated)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              color: 'var(--cyan)',
            }}
          >
            {currentSession.user?.displayName?.charAt(0)?.toUpperCase() ?? 'S'}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{currentSession.user?.displayName ?? 'Security Club Member'}</h3>
            <p className="muted" style={{ margin: 0, color: 'var(--muted)' }}>
              {currentSession.user?.email ?? 'No email available'}
            </p>
          </div>
        </div>

        <div
          className="profile-meta-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <div className="card info-block" style={{ padding: '1rem' }}>
            <span className="eyebrow subtle">Role</span>
            <strong style={{ display: 'block', marginTop: '0.3rem' }}>{currentSession.role.toUpperCase()}</strong>
          </div>
          <div className="card info-block" style={{ padding: '1rem' }}>
            <span className="eyebrow subtle">Permissions</span>
            <strong style={{ display: 'block', marginTop: '0.3rem' }}>{currentSession.permissions.length}</strong>
          </div>
          <div className="card info-block" style={{ padding: '1rem' }}>
            <span className="eyebrow subtle">Positions</span>
            <strong style={{ display: 'block', marginTop: '0.3rem' }}>{currentSession.positions.length}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => navigate('/dashboard')}
        >
          Open Dashboard →
        </button>
        <button
          type="button"
          className="button button-ghost"
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </div>
  )
}
