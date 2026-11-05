import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard, getAuthSession } from '../../api/client'
import type { AuthSession } from '../../types'

interface DashboardData {
  user: { id: number; email: string; displayName: string; role: string }
  membership: { plan_name: string; status: string; starts_at: string; expires_at: string } | null
  solved: Array<{ id: number; title: string; category: string; points: number; solved_at: string }>
  registrations: Array<{ id: number; title: string; slug: string; status: string; registered_at: string }>
}

export default function DashboardPage() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getAuthSession().then(setSession).catch(() => null)
    getDashboard()
      .then((d: unknown) => setData(d as DashboardData))
      .catch(() => null)
  }, [])

  const solvedList = data?.solved || []
  const registrations = data?.registrations || []
  const totalScore = solvedList.reduce((sum, s) => sum + (s.points || 0), 0)

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Member Dashboard</p>
          <h1>Welcome back, {session?.user?.displayName || 'Security Builder'}.</h1>
          <p className="hero-lede">
            Track your challenge solves, registered events, and active club credentials.
          </p>
        </div>
      </section>

      <section className="opportunities" style={{ margin: '2rem 0' }}>
        <div className="stat">
          <strong>{totalScore} PTS</strong>
          <span>CTF Score</span>
        </div>
        <div className="stat">
          <strong>{solvedList.length}</strong>
          <span>Solved Challenges</span>
        </div>
        <div className="stat">
          <strong>{registrations.length}</strong>
          <span>Event Registrations</span>
        </div>
      </section>

      <div className="split-content" style={{ marginTop: '2rem' }}>
        <article className="info-panel">
          <p className="eyebrow">Recent CTF Solves</p>
          <h2>Captured Flags</h2>
          {solvedList.length === 0 ? (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'var(--muted)' }}>No challenges solved yet.</p>
              <Link className="button button-primary button-sm" to="/ctf" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                Launch CTF Arena →
              </Link>
            </div>
          ) : (
            <ul className="mission-list" style={{ marginTop: '1rem' }}>
              {solvedList.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong> ({item.category.toUpperCase()}) &middot;{' '}
                  <span style={{ color: 'var(--cyan)' }}>+{item.points} PTS</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="info-panel">
          <p className="eyebrow">Club Membership</p>
          <h2>Membership Status</h2>
          <div style={{ marginTop: '1rem' }}>
            <p>
              Account Role: <strong>{session?.role?.toUpperCase() || 'MEMBER'}</strong>
            </p>
            <p style={{ marginTop: '0.4rem', color: 'var(--muted)' }}>
              {data?.membership
                ? `Plan: ${data.membership.plan_name} (${data.membership.status.toUpperCase()})`
                : 'Active Student Member · DBIT Campus'}
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link className="button button-ghost button-sm" to="/events">
                Browse Events →
              </Link>
              <Link className="button button-ghost button-sm" to="/ctf">
                CTF Challenges →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
