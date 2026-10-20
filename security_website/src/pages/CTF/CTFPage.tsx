import { useEffect, useState, type FormEvent } from 'react'
import ChallengeCard from '../../components/cards/ChallengeCard'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
import { getChallenges, submitChallenge } from '../../api/client'
import { challenges as defaultChallenges } from '../../data/ctf'
import type { Challenge } from '../../types'

function CTFPage() {
  const [challengeList, setChallengeList] = useState<Challenge[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [flag, setFlag] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getChallenges()
      .then((items) => {
        if (!active) return
        const list = items && items.length > 0 ? items : defaultChallenges
        setChallengeList(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(() => {
        if (active) {
          setChallengeList(defaultChallenges)
          if (defaultChallenges.length > 0) setSelectedId(defaultChallenges[0].id)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedId) return
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      const result = await submitChallenge(selectedId, flag)
      if (result.correct) {
        setMessage(`Success! Flag accepted. Awarded ${result.points} points.`)
        setChallengeList((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, solved: true } : c))
        )
        setFlag('')
      } else {
        setError('Incorrect flag. Inspect the challenge carefully and try again.')
      }
    } catch (submitErr) {
      setError(submitErr instanceof Error ? submitErr.message : 'Unable to submit flag')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DraggableWorkspace pageKey="ctf">
      <SectionHeader
        eyebrow="CTF Arena"
        title="Capture The Flag"
        subtitle="Choose a challenge, submit your flag, and climb the leaderboard."
      />

      {loading ? (
        <p className="muted" style={{ padding: '1rem 0' }}>Loading challenge arena...</p>
      ) : challengeList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No Active Challenges</h3>
          <p className="muted">The competition arena is currently offline. Check back soon for the next CTF event.</p>
        </div>
      ) : (
        <div className="grid three">
          {challengeList.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {challengeList.length > 0 && (
        <form className="card form" onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <h3>Flag Submission</h3>
          <label htmlFor="challenge">Challenge</label>
          <select
            id="challenge"
            name="challenge"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            required
          >
            {challengeList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.points} pts) {c.solved ? '— [SOLVED]' : ''}
              </option>
            ))}
          </select>

          <label htmlFor="flag">Flag</label>
          <input
            id="flag"
            name="flag"
            placeholder="flag{...}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            required
          />

          {message && <p className="form-success" role="status">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}

          <Button type="submit" disabled={submitting || !flag.trim()}>
            {submitting ? 'Verifying flag...' : 'Submit Flag'}
          </Button>
        </form>
      )}
    </DraggableWorkspace>
  )
}

export default CTFPage
