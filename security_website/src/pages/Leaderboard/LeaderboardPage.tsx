import { useEffect, useState } from 'react'
import { getLeaderboard } from '../../api/client'
import { leaderboard as defaultLeaderboard } from '../../data/leaderboard'

interface BoardRow {
  rank: number
  name: string
  score: number
  solves?: number
  badges?: string[]
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<BoardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getLeaderboard()
      .then((data) => {
        if (!active) return
        if (data && data.length > 0) {
          setEntries(
            data.map((item, idx) => ({
              rank: idx + 1,
              name: item.name,
              score: item.score,
              solves: item.solves,
              badges: item.score >= 500 ? ['Top Performer'] : ['Member'],
            }))
          )
        } else {
          setEntries(defaultLeaderboard)
        }
      })
      .catch(() => {
        if (active) setEntries(defaultLeaderboard)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h1>Top Performers</h1>
          <p className="hero-lede">
            Competition ranking based on challenge solves, points, and consistency.
          </p>
        </div>
      </section>

      {loading ? (
        <p className="muted" style={{ padding: '2rem 0', color: 'var(--muted)' }}>
          Loading rankings...
        </p>
      ) : entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', margin: '2rem 0' }}>
          <h3>No Leaderboard Records</h3>
          <p className="muted" style={{ color: 'var(--muted)' }}>
            No competitors have scored points yet. Solve a challenge in the CTF Arena to take the lead!
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', margin: '2rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>RANK</th>
                <th style={{ padding: '0.75rem' }}>NAME</th>
                <th style={{ padding: '0.75rem' }}>SCORE</th>
                <th style={{ padding: '0.75rem' }}>SOLVES</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.rank} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                    #{entry.rank}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{entry.name}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {entry.score} pts
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {entry.solves ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
