import { useEffect, useState, type FormEvent } from 'react'
import { getChallenges, submitChallenge, createChallenge, deleteChallenge } from '../../api/client'
import { challenges as defaultChallenges, type Challenge } from '../../data/ctf'
import { useAdmin } from '../../hooks/useAdmin'

const STORAGE_KEY = 'security-club-ctf-solved-v1'

export default function CTFPage() {
  const isAdmin = useAdmin()
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

  // Admin add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [adminSubmitting, setAdminSubmitting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('web')
  const [formDifficulty, setFormDifficulty] = useState('easy')
  const [formPoints, setFormPoints] = useState('100')
  const [formFlag, setFormFlag] = useState('SC{')
  const [formHint, setFormHint] = useState('')
  const [formDescription, setFormDescription] = useState('')

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

  const handleAddChallenge = async (e: FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formFlag.trim() || !formDescription.trim()) return
    setAdminSubmitting(true)
    setAdminError(null)

    try {
      const pts = Number(formPoints) || 100
      const created = await createChallenge({
        title: formTitle.trim(),
        category: formCategory.toLowerCase(),
        difficulty: formDifficulty.toLowerCase(),
        points: pts,
        flag: formFlag.trim(),
        hint: formHint.trim() || undefined,
        description: formDescription.trim(),
        status: 'published',
      })

      const newChallenge: Challenge = {
        id: created.id || Date.now(),
        title: created.title || formTitle.trim(),
        category: formCategory.toLowerCase(),
        difficulty: formDifficulty.toLowerCase() as any,
        points: pts,
        description: formDescription.trim(),
        hint: formHint.trim() || undefined,
        flag: formFlag.trim(),
      }

      setItems((prev) => [newChallenge, ...prev])
      setShowAddModal(false)
      setFormTitle('')
      setFormFlag('SC{')
      setFormHint('')
      setFormDescription('')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to create challenge')
    } finally {
      setAdminSubmitting(false)
    }
  }

  const handleDeleteChallenge = async (challenge: Challenge) => {
    if (!window.confirm(`Delete challenge "${challenge.title}"?`)) return
    try {
      if (challenge.id) {
        await deleteChallenge(challenge.id)
      }
      setItems((prev) => prev.filter((c) => c.id !== challenge.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete challenge')
    }
  }

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

      {isAdmin && (
        <div className="admin-action-bar">
          <div className="admin-badge-group">
            <span className="admin-badge-tag">Admin Mode</span>
            <p>You have permission to author new challenges and archive existing lab rooms.</p>
          </div>
          <button
            type="button"
            className="admin-btn-add"
            onClick={() => {
              setAdminError(null)
              setShowAddModal(true)
            }}
          >
            + Add Challenge
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Author CTF Challenge</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {adminError && <div className="admin-form-error">{adminError}</div>}

            <form onSubmit={handleAddChallenge} className="admin-form-grid">
              <div className="admin-field-group">
                <label htmlFor="ctf-title">Challenge Title *</label>
                <input
                  id="ctf-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Header Analysis: Token Inspect"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="ctf-category">Category *</label>
                  <select
                    id="ctf-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="recon">Reconnaissance</option>
                    <option value="crypto">Cryptography</option>
                    <option value="web">Web Security</option>
                    <option value="forensics">Forensics</option>
                    <option value="network">Network Inspection</option>
                    <option value="misc">Miscellaneous</option>
                  </select>
                </div>
                <div className="admin-field-group">
                  <label htmlFor="ctf-diff">Difficulty *</label>
                  <select
                    id="ctf-diff"
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="ctf-points">Points *</label>
                  <input
                    id="ctf-points"
                    type="number"
                    required
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    min="10"
                    max="1000"
                    placeholder="100"
                  />
                </div>
                <div className="admin-field-group">
                  <label htmlFor="ctf-flag">Flag Token (SC{`{...}`}) *</label>
                  <input
                    id="ctf-flag"
                    type="text"
                    required
                    value={formFlag}
                    onChange={(e) => setFormFlag(e.target.value)}
                    placeholder="SC{super_secret_flag}"
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label htmlFor="ctf-hint">Hint (Optional)</label>
                <input
                  id="ctf-hint"
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="e.g. Inspect the response headers..."
                />
              </div>

              <div className="admin-field-group">
                <label htmlFor="ctf-desc">Description &amp; Problem Brief *</label>
                <textarea
                  id="ctf-desc"
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide context, mission objectives, and target parameters..."
                />
              </div>

              <div className="admin-form-footer">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={adminSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={adminSubmitting}
                >
                  {adminSubmitting ? 'Publishing...' : 'Publish Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="ctf-browser">
        <div className="ctf-terminal-hud">
          <div className="ctf-hud-stat">
            <span className="hud-label">Environment</span>
            <span className="hud-val hud-online">
              <span className="status-beacon" aria-hidden="true" />
              Active Labs
            </span>
          </div>
          <div className="ctf-hud-stat">
            <span className="hud-label">Challenges</span>
            <span className="hud-val">{items.length} available</span>
          </div>
          <div className="ctf-hud-stat">
            <span className="hud-label">Session score</span>
            <span className="hud-val hud-score">{totalScore} pts</span>
          </div>
          <div className="ctf-hud-stat">
            <span className="hud-label">Flags solved</span>
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
                {cat === 'all' ? 'All challenges' : cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                      {c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                    </span>
                    <span className={`ctf-diff-pill ctf-diff-${c.difficulty.toLowerCase()}`}>
                      {c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)}
                    </span>
                  </div>
                  <span className="ctf-pts-badge">{c.points} pts</span>
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

                  {isAdmin && (
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => handleDeleteChallenge(c)}
                        title={`Delete ${c.title}`}
                      >
                        ✕ Delete Challenge
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
