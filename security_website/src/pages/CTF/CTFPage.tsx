import { useEffect, useState, type FormEvent } from 'react'
import { getChallenges, submitChallenge } from '../../api/client'
import { challenges as defaultChallenges, type Challenge } from '../../data/ctf'

const STORAGE_KEY = 'security-club-ctf-solved-v1'

export default function CTFPage() {
  const [items, setItems] = useState<Challenge[]>(defaultChallenges)
  const [selectedCat, setSelectedCat] = useState('all')
  const [solvedIds, setSolvedIds] = useState<number[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({})
  const [feedback, setFeedback] = useState<Record<number, { success: boolean; message: string }>>({})
  const [flagInputs, setFlagInputs] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let active = true
    getChallenges()
      .then((data) => {
        if (!active) return
        if (data && data.length > 0) {
          const merged = data.map((apiItem) => {
            const fallback = defaultChallenges.find(
              (c) => c.title.toLowerCase() === apiItem.title.toLowerCase() || c.id === apiItem.id
            )
            return {
              ...apiItem,
              hint: apiItem.hint || fallback?.hint,
              flag: fallback?.flag,
            }
          })
          setItems(merged)
        }
      })
      .catch(() => {
        // Fallback already set
      })
    return () => {
      active = false
    }
  }, [])

  const categories = ['all', ...Array.from(new Set(items.map((c) => c.category)))]

  const filteredItems = selectedCat === 'all'
    ? items
    : items.filter((c) => c.category === selectedCat)

  const toggleHint = (id: number) => {
    setExpandedHints((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleFlagSubmit = async (e: FormEvent, challenge: Challenge) => {
    e.preventDefault()
    const entered = (flagInputs[challenge.id] || '').trim()
    if (!entered) return

    setSubmitting((prev) => ({ ...prev, [challenge.id]: true }))

    let correct = false

    // Check client-side against static flag if available
    if (challenge.flag && entered.toLowerCase() === challenge.flag.toLowerCase()) {
      correct = true
    }

    // Also attempt backend verification
    try {
      const res = await submitChallenge(challenge.id, entered)
      if (res.correct) correct = true
    } catch {
      // Backend unavailable or user not logged in, client-side check suffices
    }

    setSubmitting((prev) => ({ ...prev, [challenge.id]: false }))

    if (correct) {
      if (!solvedIds.includes(challenge.id)) {
        const nextSolved = [...solvedIds, challenge.id]
        setSolvedIds(nextSolved)
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSolved))
        } catch {
          // ignore
        }
      }
      setFeedback((prev) => ({
        ...prev,
        [challenge.id]: {
          success: true,
          message: `[+] Solved: Flag token captured. +${challenge.points} PTS`,
        },
      }))
    } else {
      setFeedback((prev) => ({
        ...prev,
        [challenge.id]: {
          success: false,
          message:
            '[-] Incorrect: Flag mismatch. Ensure standard format SC{...} and re-verify.',
        },
      }))
    }
  }

  const totalScore = items
    .filter((c) => solvedIds.includes(c.id))
    .reduce((sum, c) => sum + (c.points || 0), 0)

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Capture the flag</p>
          <h1>Think sideways. Solve carefully. Learn constantly.</h1>
          <p className="hero-lede">
            Hands-on introductory cybersecurity lab challenges for DBIT students. Enter the sandbox
            to practice discovery, cryptanalysis, and protocol inspection.
          </p>
        </div>
      </section>

      <div className="ctf-browser">
        <div className="ctf-terminal-hud">
          <div className="ctf-hud-stat">
            <span className="hud-label">ENVIRONMENT</span>
            <span className="hud-val hud-online">
              <span className="status-beacon" aria-hidden="true" />
              Active Labs
            </span>
          </div>
          <div className="ctf-hud-stat">
            <span className="hud-label">CHALLENGES</span>
            <span className="hud-val">{items.length} Available</span>
          </div>
          <div className="ctf-hud-stat">
            <span className="hud-label">SESSION SCORE</span>
            <span className="hud-val hud-score">{totalScore} PTS</span>
          </div>
          <div className="ctf-hud-stat">
            <span className="hud-label">FLAGS SOLVED</span>
            <span className="hud-val">
              {solvedIds.length} / {items.length}
            </span>
          </div>
        </div>

        <div className="team-controls-bar ctf-controls-bar">
          <div className="team-filters ctf-filters" role="group" aria-label="Filter CTF challenges by category">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`team-filter-button ctf-filter-btn ${selectedCat === cat ? 'is-active' : ''}`}
                type="button"
                aria-pressed={selectedCat === cat}
                onClick={() => setSelectedCat(cat)}
              >
                {cat === 'all' ? 'All Challenges' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card-grid ctf-grid">
          {filteredItems.map((c) => {
            const isSolved = solvedIds.includes(c.id)
            const isHintOpen = Boolean(expandedHints[c.id])
            const fb = feedback[c.id]

            return (
              <article
                key={c.id}
                className={`card ctf-card ${isSolved ? 'is-solved' : ''}`}
                data-ctf-id={c.id}
              >
                <div className="ctf-card-header">
                  <div className="ctf-category-group">
                    <span className={`ctf-cat-pill ctf-cat-${c.category.toLowerCase()}`}>
                      {c.category.toUpperCase()}
                    </span>
                    <span className={`ctf-diff-pill ctf-diff-${c.difficulty.toLowerCase()}`}>
                      {c.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <span className="ctf-pts-badge">{c.points} PTS</span>
                </div>

                <div className="card-body ctf-card-body">
                  <h3 className="ctf-card-title">{c.title}</h3>
                  <div className="ctf-card-divider" aria-hidden="true" />
                  <p className="ctf-card-desc">{c.description}</p>

                  {c.hint && (
                    <>
                      <button
                        type="button"
                        className="ctf-hint-toggle"
                        aria-expanded={isHintOpen}
                        onClick={() => toggleHint(c.id)}
                      >
                        <span className="ctf-hint-icon" aria-hidden="true">
                          {isHintOpen ? '▼' : '▶'}
                        </span>{' '}
                        View Hint
                      </button>
                      <div className="ctf-hint-box" hidden={!isHintOpen}>
                        <p className="ctf-hint-body">{c.hint}</p>
                      </div>
                    </>
                  )}

                  <form
                    className="ctf-flag-form"
                    onSubmit={(e) => handleFlagSubmit(e, c)}
                  >
                    <div className="ctf-input-group">
                      <input
                        type="text"
                        className="ctf-flag-input"
                        placeholder="SC{flag_token}"
                        required
                        disabled={isSolved}
                        value={isSolved ? c.flag || 'SC{...}' : flagInputs[c.id] || ''}
                        onChange={(e) =>
                          setFlagInputs((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="submit"
                        className="button button-primary button-sm ctf-submit-btn"
                        disabled={isSolved || submitting[c.id]}
                      >
                        {isSolved
                          ? 'Captured [OK]'
                          : submitting[c.id]
                            ? 'Verifying...'
                            : 'Submit Flag'}
                      </button>
                    </div>

                    {fb && (
                      <div
                        className={`ctf-feedback ${fb.success ? 'is-success' : 'is-error'}`}
                        aria-live="polite"
                      >
                        {fb.message}
                      </div>
                    )}
                  </form>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
