import { useEffect, useState, type FormEvent } from 'react'
import FlagshipCard from '../../components/cards/FlagshipCard'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
import { archiveFlagship, createFlagship, getAuthSession, getFlagships } from '../../api/client'
import type { Flagship } from '../../types'

function FlagshipsPage() {
  const [flagships, setFlagships] = useState<Flagship[]>([])
  const [canManage, setCanManage] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getFlagships(), getAuthSession()])
      .then(([databaseFlagships, session]) => {
        if (!active) return
        setFlagships(databaseFlagships)
        setCanManage(session.authenticated && session.permissions.includes('flagships.manage'))
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load flagships from the database')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const addFlagship = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError(null)
    try {
      const created = await createFlagship({
        title: String(form.get('title')),
        description: String(form.get('description')),
        image: String(form.get('image')),
        year: String(form.get('year')),
      })
      setFlagships((current) => [created, ...current])
      event.currentTarget.reset()
      setShowForm(false)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to save flagship')
    } finally {
      setSaving(false)
    }
  }

  const removeFlagship = async (flagship: Flagship) => {
    if (!window.confirm(`Remove "${flagship.title}" from the public Flagships page?`)) return
    try {
      await archiveFlagship(flagship.id)
      setFlagships((current) => current.filter((item) => item.id !== flagship.id))
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive flagship')
    }
  }

  return (
    <DraggableWorkspace pageKey="flagships">
      <SectionHeader
        eyebrow="Flagships"
        title="Club Signature Programs"
        subtitle="High-impact annual experiences that define our competitive and educational culture."
      />

      {canManage ? <div className="events-admin-toolbar"><Button type="button" onClick={() => setShowForm((visible) => !visible)}>+ Add flagship</Button></div> : null}
      {canManage && showForm ? (
        <form className="card form event-admin-form" onSubmit={addFlagship}>
          <h3>Add flagship program</h3>
          <label htmlFor="flagship-title">Title</label>
          <input id="flagship-title" name="title" required maxLength={200} />
          <label htmlFor="flagship-year">Year</label>
          <input id="flagship-year" name="year" type="number" min="2000" max="2200" required defaultValue={new Date().getFullYear()} />
          <label htmlFor="flagship-image">Image URL <span className="muted">(optional)</span></label>
          <input id="flagship-image" name="image" type="url" />
          <label htmlFor="flagship-description">Description</label>
          <textarea id="flagship-description" name="description" rows={4} required maxLength={5000} />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add flagship'}</Button>
        </form>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="grid two">
        {flagships.map((flagship) => (
          <div className="flagship-list-item" key={flagship.id}>
            <FlagshipCard flagship={flagship} />
            {canManage ? <button className="gallery-delete" type="button" onClick={() => removeFlagship(flagship)}>Remove flagship</button> : null}
          </div>
        ))}
      </div>
      {loading ? <p className="muted">Loading flagships...</p> : null}
      {!loading && !flagships.length ? <p className="muted">No flagship programs are published.</p> : null}
    </DraggableWorkspace>
  )
}

export default FlagshipsPage
