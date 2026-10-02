import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import TeamCard from '../../components/cards/TeamCard'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
import { archiveTeamMember, createTeamMember, getAuthSession, getTeamMembers } from '../../api/client'
import { team } from '../../data/team'
import type { TeamMember } from '../../types'

async function compressPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to prepare this photo')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}

function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(team)
  const [canManage, setCanManage] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAccessNotice, setShowAccessNotice] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    getTeamMembers()
      .then((databaseMembers) => {
        if (active) setMembers(databaseMembers)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load team members from the database')
      })
    getAuthSession()
      .then((session) => {
        if (active) setCanManage(session.authenticated && session.permissions.includes('team.manage'))
      })
      .catch(() => {
        if (active) setCanManage(false)
      })
    return () => { active = false }
  }, [])

  const selectPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setError(null)
      setPhoto(await compressPhoto(file))
    } catch {
      setError('Unable to load this photo. Please choose another image.')
    }
    event.target.value = ''
  }

  const addMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!photo) {
      setError('Choose a member photo before adding the profile.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const savedMember = await createTeamMember({
        name: name.trim(),
        role: role.trim(),
        image: photo,
        ...(description.trim() ? { description: description.trim() } : {}),
      })
      setMembers((current) => [...current, savedMember])
      setName('')
      setRole('')
      setDescription('')
      setPhoto(null)
      setShowForm(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save team member to the database')
    } finally {
      setSaving(false)
    }
  }

  const removeMember = async (member: TeamMember) => {
    if (!canManage || !window.confirm(`Remove ${member.name} from the public Team page?`)) return
    try {
      await archiveTeamMember(member.id)
      setMembers((current) => current.filter((item) => item.id !== member.id))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove team member')
    }
  }

  return (
    <DraggableWorkspace pageKey="team">
      <SectionHeader
        eyebrow="Team"
        title="Meet the Builders"
        subtitle="Mentors, organizers, and competitive participants behind club initiatives."
      />

      <div className="team-toolbar">
        <Button type="button" onClick={() => {
          if (canManage) {
            setShowAccessNotice(false)
            setShowForm((visible) => !visible)
          } else {
            setShowAccessNotice(true)
          }
        }}>
          + Add member
        </Button>
      </div>

      {showAccessNotice && !canManage && (
        <p className="team-access-note" role="status">
          Adding members requires a signed-in admin or a user with the President position. <a href="/login">Log in</a>
        </p>
      )}

      {canManage && showForm && (
        <form className="team-add-form" onSubmit={addMember}>
          <div className="team-form-fields">
            <label>
              Photo
              <input ref={fileInputRef} type="file" accept="image/*" onChange={selectPhoto} required={!photo} />
            </label>
            {photo && <img className="team-photo-preview" src={photo} alt="Selected team member preview" />}
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required />
            </label>
            <label>
              Position
              <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Club position" required />
            </label>
            <label className="team-description-field">
              Description <span>(optional)</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short introduction" rows={3} />
            </label>
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="team-form-actions">
            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setError(null) }} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add team member'}</Button>
          </div>
        </form>
      )}

      <div className="grid three">
        {members.map((member) => (
          <div className="team-member-item" key={member.id}>
            <TeamCard member={member} />
            {canManage ? <button className="gallery-delete" type="button" onClick={() => removeMember(member)}>Remove member</button> : null}
          </div>
        ))}
      </div>
    </DraggableWorkspace>
  )
}

export default TeamPage
