import { useEffect, useMemo, useState, type FormEvent } from 'react'
import EventCard from '../../components/cards/EventCard'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
import { cancelEvent, createEvent, getAuthSession, getEvents } from '../../api/client'
import type { EventInput, EventItem, EventType } from '../../types'

function EventsPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all')
  const [events, setEvents] = useState<EventItem[]>([])
  const [canManage, setCanManage] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getEvents(), getAuthSession()])
      .then(([databaseEvents, session]) => {
        if (!active) return
        setEvents(databaseEvents)
        setCanManage(session.authenticated && session.permissions.includes('events.create'))
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load events from the database')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filteredEvents = useMemo(() => events.filter((event) => typeFilter === 'all' || event.type === typeFilter), [events, typeFilter])

  const addEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: EventInput = {
      title: String(form.get('title')),
      type: String(form.get('type')) as EventType,
      starts_at: new Date(String(form.get('startsAt'))).toISOString(),
      summary: String(form.get('summary')),
      description: String(form.get('description')),
      venue: String(form.get('venue')) || undefined,
      tags: [],
      status: 'published',
    }
    setSaving(true)
    setError(null)
    try {
      const created = await createEvent(input)
      setEvents((current) => [...current, created].sort((first, second) => first.date.localeCompare(second.date)))
      event.currentTarget.reset()
      setShowForm(false)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to save event')
    } finally {
      setSaving(false)
    }
  }

  const removeEvent = async (item: EventItem) => {
    if (!window.confirm(`Cancel "${item.title}"?`)) return
    try {
      await cancelEvent(item.id)
      setEvents((current) => current.filter((eventItem) => eventItem.id !== item.id))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to cancel event')
    }
  }

  return (
    <DraggableWorkspace pageKey="events">
      <section className="events-main-section">
        <SectionHeader
          eyebrow="Events"
          title="Workshops, CTFs, and Seminars"
          subtitle="Discover sessions that sharpen both offensive and defensive security thinking."
        />

        {canManage ? <div className="events-admin-toolbar"><Button type="button" onClick={() => setShowForm((visible) => !visible)}>+ Add event</Button></div> : null}
        {canManage && showForm ? (
          <form className="card form event-admin-form" onSubmit={addEvent}>
            <h3>Create event</h3>
            <label htmlFor="new-event-title">Title</label>
            <input id="new-event-title" name="title" required maxLength={160} />
            <label htmlFor="new-event-type">Type</label>
            <select id="new-event-type" name="type" defaultValue="workshop">
              <option value="workshop">Workshop</option>
              <option value="ctf">CTF</option>
              <option value="seminar">Seminar</option>
            </select>
            <label htmlFor="new-event-start">Start date and time</label>
            <input id="new-event-start" name="startsAt" type="datetime-local" required />
            <label htmlFor="new-event-venue">Venue</label>
            <input id="new-event-venue" name="venue" />
            <label htmlFor="new-event-summary">Summary</label>
            <input id="new-event-summary" name="summary" required maxLength={500} />
            <label htmlFor="new-event-description">Description</label>
            <textarea id="new-event-description" name="description" rows={4} required />
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Publish event'}</Button>
          </form>
        ) : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <div className="filter-row">
          <label htmlFor="type">Filter by type:</label>
          <select id="type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | EventType)}>
            <option value="all">All</option>
            <option value="inauguration">Inauguration</option>
            <option value="workshop">Workshop</option>
            <option value="ctf">CTF</option>
            <option value="seminar">Seminar</option>
            <option value="bootcamp">Bootcamp</option>
          </select>
        </div>

        <div className="grid three">
          {filteredEvents.map((event) => (
            <div className="event-list-item" key={event.id}>
              <EventCard event={event} />
              {canManage ? <button className="gallery-delete" type="button" onClick={() => removeEvent(event)}>Cancel event</button> : null}
            </div>
          ))}
        </div>
        {loading ? <p className="muted">Loading events...</p> : null}
        {!loading && !filteredEvents.length ? <p className="muted">No events to show.</p> : null}
      </section>
    </DraggableWorkspace>
  )
}

export default EventsPage
