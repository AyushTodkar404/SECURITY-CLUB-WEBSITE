import { useEffect, useState, type FormEvent } from 'react'
import { getTeam, createTeamMember, deleteTeamMember } from '../../api/client'
import { team as defaultTeam, type TeamMember } from '../../data/team'
import { useAdmin } from '../../hooks/useAdmin'
import DeviceImageUploader from '../../components/common/DeviceImageUploader'

function departmentOf(role: string): string {
  const r = String(role || '').toLowerCase()
  if (/president/i.test(r)) return 'leadership'
  if (/technical/i.test(r)) return 'technical'
  if (/research/i.test(r)) return 'research'
  if (/event|publicity/i.test(r)) return 'events'
  if (/editorial|design/i.test(r)) return 'design'
  return 'other'
}

export default function TeamPage() {
  const isAdmin = useAdmin()
  const [members, setMembers] = useState<TeamMember[]>(defaultTeam)
  const [selectedYear, setSelectedYear] = useState('2026-27')
  const [selectedDept, setSelectedDept] = useState('all')

  // Admin add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formDept, setFormDept] = useState('technical')
  const [formTenure, setFormTenure] = useState('2026-27')
  const [formImage, setFormImage] = useState('')
  const [formLinkedin, setFormLinkedin] = useState('')
  const [formBio, setFormBio] = useState('')

  useEffect(() => {
    let active = true
    getTeam()
      .then((data: TeamMember[]) => {
        if (!active) return
        if (data && data.length > 0) {
          const merged = data.map((apiItem: TeamMember) => {
            const fallback = defaultTeam.find(
              (t) => t.name.toLowerCase() === apiItem.name.toLowerCase()
            )
            return {
              ...apiItem,
              department: apiItem.department || fallback?.department || departmentOf(apiItem.role),
              tenure: apiItem.tenure || fallback?.tenure || '2026-27',
              linkedin: apiItem.linkedin || fallback?.linkedin,
              bio: apiItem.description || apiItem.bio || fallback?.bio || fallback?.description,
              image: apiItem.image || fallback?.image || '',
            }
          })
          setMembers(merged)
        }
      })
      .catch(() => {
        // Fallback already set
      })
    return () => {
      active = false
    }
  }, [])

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formRole.trim()) return
    setSubmitting(true)
    setAdminError(null)
    try {
      const created = await createTeamMember({
        name: formName.trim(),
        role: formRole.trim(),
        department: formDept,
        tenure: formTenure,
        image: formImage.trim() || '/assets/team/placeholder.svg',
        linkedin: formLinkedin.trim() || undefined,
        description: formBio.trim() || undefined,
      })
      setMembers((prev) => [
        {
          id: created.id || Date.now(),
          name: created.name || formName.trim(),
          role: created.role || formRole.trim(),
          department: formDept,
          tenure: formTenure,
          image: formImage.trim() || '/assets/team/placeholder.svg',
          linkedin: formLinkedin.trim() || undefined,
          bio: formBio.trim() || undefined,
          description: formBio.trim() || undefined,
        },
        ...prev,
      ])
      setShowAddModal(false)
      setFormName('')
      setFormRole('')
      setFormImage('')
      setFormLinkedin('')
      setFormBio('')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to add team member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMember = async (item: TeamMember) => {
    if (!window.confirm(`Delete ${item.name} from the team roster?`)) return
    try {
      if (item.id) {
        await deleteTeamMember(item.id)
      }
      setMembers((prev) =>
        prev.filter((m) => (m.id && item.id ? m.id !== item.id : m.name !== item.name))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete member')
    }
  }

  const mentors = members.filter(
    (m) =>
      (/faculty|mentor|teacher/i.test(m.role || '') || m.department === 'faculty') &&
      !/alumni/i.test(m.role || '') &&
      m.department !== 'alumni'
  )

  const alumni = members.filter(
    (m) => /alumni/i.test(m.role || '') || m.department === 'alumni'
  )

  const coreTeam = members.filter(
    (m) => !/faculty|mentor|teacher|alumni/i.test(m.role || '')
  )

  const years = Array.from(
    new Set(coreTeam.map((m) => m.tenure || '2026-27'))
  )

  const filteredCoreTeam = coreTeam.filter((m) => {
    const matchesYear = !m.tenure || m.tenure === selectedYear
    const dept = m.department || departmentOf(m.role)
    const matchesDept = selectedDept === 'all' || dept === selectedDept
    return matchesYear && matchesDept
  })

  const renderCard = (item: TeamMember) => {
    const deptCode = item.department
      ? item.department.charAt(0).toUpperCase() + item.department.slice(1).toLowerCase()
      : item.role && /faculty|coordinator|mentor/i.test(item.role)
        ? 'Faculty'
        : item.role && /alumni/i.test(item.role)
          ? 'Alumni'
          : 'Member'
    const tenureTag = item.tenure || (item.role && /alumni/i.test(item.role) ? 'Alumni' : 'Mentor')
    const isLeader = /president/i.test(item.role || '')

    return (
      <article
        key={item.id ? `${item.id}-${item.name}` : item.name}
        className={`card team-card ${isLeader ? 'is-leadership' : ''}`}
      >
        <div className="team-card-header">
          <span className="team-dept-pill">{deptCode}</span>
        </div>

        {item.image ? (
          <a
            className="team-image-link"
            href={item.image}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View full-size photo of ${item.name}`}
          >
            <div className="team-photo-wrapper">
              <img
                src={item.image}
                alt={item.name}
                className="team-photo is-loaded"
                loading="lazy"
              />
              <div className="team-photo-scrim" aria-hidden="true" />
              <span className="team-tenure-badge">{tenureTag}</span>
            </div>
          </a>
        ) : (
          <div className="team-photo-wrapper team-photo-placeholder" aria-hidden="true">
            <div className="team-avatar-fallback">
              {(item.name || 'SC').slice(0, 2).toUpperCase()}
            </div>
            <span className="team-tenure-badge">{tenureTag}</span>
          </div>
        )}

        <div className="card-body team-card-body">
          <p className="team-role-tag">{item.role || 'Member'}</p>
          <h3 className="team-member-name">{item.name}</h3>
          <div className="team-card-divider" aria-hidden="true" />
          {(item.bio || item.description) && (
            <p className="team-member-bio">{item.bio || item.description}</p>
          )}

          {item.linkedin ? (
            <a
              className="team-linkedin-link"
              href={item.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn profile for ${item.name}`}
              title="View LinkedIn Profile"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
                <path
                  fill="currentColor"
                  d="M5.2 3.5a2.2 2.2 0 1 1-.1 4.4 2.2 2.2 0 0 1 .1-4.4ZM3.3 9.5h3.8v11.2H3.3zM9.2 9.5h3.6V11h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.5 4.6 5.7v6h-3.8v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.4H9.2z"
                />
              </svg>
              <span>LinkedIn</span>
              <span className="team-link-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ) : null}

          {isAdmin && (
            <div className="admin-card-actions">
              <button
                type="button"
                className="admin-delete-btn"
                onClick={() => handleDeleteMember(item)}
                title={`Delete ${item.name}`}
              >
                ✕ Delete Member
              </button>
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Meet the club team</p>
          <h1>The people behind the signal.</h1>
          <p className="hero-lede">
            Meet the faculty mentors and student core team who make cybersecurity approachable,
            practical and collaborative.
          </p>
        </div>
      </section>

      {isAdmin && (
        <div className="admin-action-bar">
          <div className="admin-badge-group">
            <span className="admin-badge-tag">Admin Mode</span>
            <p>You have permission to add or delete team members.</p>
          </div>
          <button
            type="button"
            className="admin-btn-add"
            onClick={() => {
              setAdminError(null)
              setShowAddModal(true)
            }}
          >
            + Add Team Member
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add Team Member</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {adminError && <div className="admin-form-error">{adminError}</div>}

            <form onSubmit={handleAddMember} className="admin-form-grid">
              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="team-name">Full Name *</label>
                  <input
                    id="team-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                  />
                </div>
                <div className="admin-field-group">
                  <label htmlFor="team-role">Role Title *</label>
                  <input
                    id="team-role"
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Security Researcher"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field-group">
                  <label htmlFor="team-dept">Department</label>
                  <select
                    id="team-dept"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                  >
                    <option value="leadership">Leadership</option>
                    <option value="technical">Technical</option>
                    <option value="research">Research</option>
                    <option value="events">Events &amp; PR</option>
                    <option value="design">Design &amp; Editorial</option>
                    <option value="faculty">Faculty Guidance</option>
                    <option value="alumni">Alumni</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="admin-field-group">
                  <label htmlFor="team-tenure">Tenure</label>
                  <input
                    id="team-tenure"
                    type="text"
                    value={formTenure}
                    onChange={(e) => setFormTenure(e.target.value)}
                    placeholder="2026-27 or Mentor"
                  />
                </div>
              </div>

              <DeviceImageUploader
                value={formImage}
                onChange={setFormImage}
                label="Profile Photo from Device"
              />

              <div className="admin-field-group">
                <label htmlFor="team-linkedin">LinkedIn URL</label>
                <input
                  id="team-linkedin"
                  type="url"
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="admin-field-group">
                <label htmlFor="team-bio">Bio / Description</label>
                <textarea
                  id="team-bio"
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Focus areas, contributions, or achievements..."
                />
              </div>

              <div className="admin-form-footer">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="team-section" aria-labelledby="team-mentors-heading">
        <div className="team-section-heading">
          <div className="section-heading-meta">
            <span className="section-tag-dot" aria-hidden="true" />
            <p className="eyebrow">Academic Advisory · DBIT</p>
          </div>
          <h2 id="team-mentors-heading">Mentors &amp; Faculty Guidance</h2>
          <p>Faculty coordinators and teachers supporting the club with institutional expertise.</p>
        </div>
        <div className="card-grid team-grid">{mentors.map(renderCard)}</div>
      </section>

      <section className="team-section" aria-labelledby="team-alumni-heading">
        <div className="team-section-heading">
          <div className="section-heading-meta">
            <span className="section-tag-dot" aria-hidden="true" />
            <p className="eyebrow">Our Foundation &amp; Heritage</p>
          </div>
          <h2 id="team-alumni-heading">Alumni Network</h2>
          <p>Former members who built the club and now defend systems across industry.</p>
        </div>
        <div className="card-grid team-grid">{alumni.map(renderCard)}</div>
      </section>

      <section className="team-section" aria-labelledby="team-core-heading">
        <div className="team-section-heading">
          <div className="section-heading-meta">
            <span className="section-tag-dot" aria-hidden="true" />
            <p className="eyebrow">Student Leadership Council</p>
          </div>
          <h2 id="team-core-heading">Core Team</h2>
          <p>The student council and coordinators leading the Security Club initiatives.</p>
        </div>

        <div className="team-controls-bar">
          <div className="team-years" role="group" aria-label="Select Core Team tenure year">
            {years.map((year) => (
              <button
                key={year}
                className={`gallery-year-button team-year-button ${year === selectedYear ? 'is-active' : ''}`}
                type="button"
                aria-pressed={year === selectedYear}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="team-filters" role="group" aria-label="Filter core team by department">
            {[
              { id: 'all', label: 'All' },
              { id: 'leadership', label: 'Leadership' },
              { id: 'technical', label: 'Technical' },
              { id: 'research', label: 'Research' },
              { id: 'events', label: 'Events & PR' },
              { id: 'design', label: 'Design & Editorial' },
            ].map((dept) => (
              <button
                key={dept.id}
                className={`team-filter-button ${selectedDept === dept.id ? 'is-active' : ''}`}
                type="button"
                aria-pressed={selectedDept === dept.id}
                onClick={() => setSelectedDept(dept.id)}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>

        {filteredCoreTeam.length === 0 ? (
          <p className="team-empty">Core team members will be listed here.</p>
        ) : (
          <div className="card-grid team-grid">{filteredCoreTeam.map(renderCard)}</div>
        )}
      </section>
    </div>
  )
}
