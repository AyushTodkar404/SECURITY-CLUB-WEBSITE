import { useEffect, useState } from 'react'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Badge from '../../components/ui/Badge'
import { getLeaderboard } from '../../api/client'
import { leaderboard as defaultLeaderboard } from '../../data/leaderboard'

interface BoardRow {
  rank: number
  name: string
  score: number
  solves?: number
  badges?: string[]
}

function LeaderboardPage() {
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
              badges: item.score >= 500 ? ['Elite Hacker', 'Top 10'] : ['Contender'],
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
    <DraggableWorkspace pageKey="leaderboard">
      <SectionHeader
        eyebrow="Leaderboard"
        title="Top Performers"
        subtitle="Competition ranking based on challenge solves, speed, and consistency."
      />

      {loading ? (
        <p className="muted" style={{ padding: '1rem 0' }}>Loading rankings...</p>
      ) : entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No Leaderboard Records</h3>
          <p className="muted">No competitors have scored points yet. Solve a challenge in the CTF Arena to take the lead!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.rank}>
                  <td>#{entry.rank}</td>
                  <td>{entry.name}</td>
                  <td>{entry.score} pts</td>
                  <td>
                    <div className="badge-row">
                      {(entry.badges ?? ['Participant']).map((badge) => (
                        <Badge key={badge} tone="success">{badge}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DraggableWorkspace>
  )
}

export default LeaderboardPage
