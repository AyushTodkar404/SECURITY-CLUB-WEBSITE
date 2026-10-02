import { useEffect, useState } from 'react'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import SectionHeader from '../../components/common/SectionHeader'
import {
  approveMembershipApplication,
  assignCorePosition,
  getAdminMembershipApplications,
  getAdminArchitecture,
  issueMembershipTemporaryPassword,
  removeCorePosition,
  removeAdminUser,
  rejectMembershipApplication,
  setRolePermission,
  setUserRole,
  type AdminMembershipApplication,
  type AdminUser,
  type CorePositionAssignment,
  type ArchitectureRole,
} from '../../api/client'

function AdminPage() {
  const [roles, setRoles] = useState<ArchitectureRole[]>([])
  const [positions, setPositions] = useState<CorePositionAssignment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [positionKey, setPositionKey] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [applications, setApplications] = useState<AdminMembershipApplication[]>([])
  const [applicationRoles, setApplicationRoles] = useState<Record<number, 'member' | 'admin'>>({})
  const [temporaryAccess, setTemporaryAccess] = useState<{ name: string; email: string; password: string } | null>(null)
  const [reviewMessage, setReviewMessage] = useState<string | null>(null)

  useEffect(() => {
    getAdminArchitecture()
      .then((architecture) => {
        setRoles(architecture.roles)
        setPositions(architecture.positions)
        setUsers(architecture.users)
        setPositionKey((current) => current || architecture.positions[0]?.key || '')
      })
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Unable to load permissions'))
    getAdminMembershipApplications()
      .then(setApplications)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Unable to load membership applications'))
  }, [])

  const toggle = async (roleKey: string, permissionKey: string, enabled: boolean) => {
    const key = `${roleKey}:${permissionKey}`
    setSaving(key)
    setError(null)
    try {
      await setRolePermission(roleKey, permissionKey, enabled)
      setRoles((current) => current.map((role) => role.key !== roleKey ? role : {
        ...role,
        permissions: role.permissions.map((permission) => permission.key !== permissionKey ? permission : { ...permission, enabled }),
      }))
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Unable to update permission')
    } finally {
      setSaving(null)
    }
  }

  const refreshPositions = async () => {
    const architecture = await getAdminArchitecture()
    setPositions(architecture.positions)
    setUsers(architecture.users)
  }

  const changeRole = async (userId: number, role: 'member' | 'admin') => {
    setSaving(`role:${userId}`)
    setError(null)
    try {
      await setUserRole(userId, role)
      await refreshPositions()
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Unable to change role')
    } finally {
      setSaving(null)
    }
  }

  const removeUser = async (user: AdminUser) => {
    if (!window.confirm(`Permanently delete ${user.display_name} (${user.email}) and their account, applications, memberships, payments, sessions, and personal records? Shared site content will remain. This cannot be undone.`)) return
    setSaving(`account:${user.id}`)
    setError(null)
    try {
      await removeAdminUser(user.id)
      await refreshPositions()
      setSelectedUserId((current) => current === String(user.id) ? '' : current)
      setUserId((current) => current === String(user.id) ? '' : current)
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove account')
    } finally {
      setSaving(null)
    }
  }

  const assign = async () => {
    const numericUserId = Number(userId)
    if (!Number.isInteger(numericUserId) || numericUserId < 1 || !positionKey) {
      setError('Enter a valid user ID and choose a position.')
      return
    }
    setSaving(`assign:${positionKey}:${numericUserId}`)
    setError(null)
    try {
      await assignCorePosition(numericUserId, positionKey)
      await refreshPositions()
      setUserId('')
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'Unable to assign position')
    } finally {
      setSaving(null)
    }
  }

  const remove = async (assignment: CorePositionAssignment) => {
    if (!assignment.user_id) return
    setSaving(`remove:${assignment.key}:${assignment.user_id}`)
    setError(null)
    try {
      await removeCorePosition(assignment.user_id, assignment.key)
      await refreshPositions()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove position')
    } finally {
      setSaving(null)
    }
  }

  const approveApplication = async (application: AdminMembershipApplication) => {
    const role = applicationRoles[application.id] ?? 'member'
    setSaving(`application:${application.id}`)
    setError(null)
    setReviewMessage(null)
    setTemporaryAccess(null)
    try {
      const result = await approveMembershipApplication(application.id, role)
      setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: 'approved' } : item))
      if (result.temporaryPassword) {
        setTemporaryAccess({ name: application.full_name, email: application.college_email, password: result.temporaryPassword })
        setReviewMessage(`${application.full_name} was approved as ${role === 'admin' ? 'Administrator' : 'Member'}. Share the temporary login privately; they must change the password at first login.`)
      } else {
        setReviewMessage(`${application.full_name} was approved as ${role === 'admin' ? 'Administrator' : 'Member'}. Their existing login is ready.`)
      }
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : 'Unable to approve membership application')
    } finally {
      setSaving(null)
    }
  }

  const issueTemporaryPassword = async (application: AdminMembershipApplication) => {
    setSaving(`temporary:${application.id}`)
    setError(null)
    setReviewMessage(null)
    setTemporaryAccess(null)
    try {
      const result = await issueMembershipTemporaryPassword(application.id)
      setTemporaryAccess({ name: application.full_name, email: application.college_email, password: result.temporaryPassword })
      setReviewMessage(`A new temporary password was generated for ${application.full_name}. Any earlier temporary password is now invalid.`)
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : 'Unable to generate temporary password')
    } finally {
      setSaving(null)
    }
  }

  const rejectApplication = async (application: AdminMembershipApplication) => {
    if (!window.confirm(`Reject the membership application from ${application.full_name}?`)) return
    setSaving(`application:${application.id}`)
    setError(null)
    setReviewMessage(null)
    setTemporaryAccess(null)
    try {
      await rejectMembershipApplication(application.id)
      setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: 'rejected' } : item))
      setReviewMessage(`${application.full_name}'s application was rejected.`)
    } catch (rejectionError) {
      setError(rejectionError instanceof Error ? rejectionError.message : 'Unable to reject membership application')
    } finally {
      setSaving(null)
    }
  }

  return (
    <DraggableWorkspace pageKey="admin">
      <SectionHeader
        eyebrow="Administration"
        title="Role and Permission Control"
        subtitle="Turn individual read, comment, and write capabilities on or off for each role."
      />
      {error ? <p role="alert">{error}</p> : null}
      <section className="admin-applications">
        <div className="workspace-card-heading">
          <h2>Membership applications</h2>
          <span className="badge">{applications.filter((application) => ['submitted', 'under_review'].includes(application.status)).length} awaiting review</span>
        </div>
        <p className="muted">Review applicant details and approve them as a Member or Administrator.</p>
        {reviewMessage ? <p className="form-success" role="status">{reviewMessage}</p> : null}
        {temporaryAccess ? (
          <div className="application-activation">
            <strong>One-time login for {temporaryAccess.name}</strong>
            <p>{temporaryAccess.email}</p>
            <code>{temporaryAccess.password}</code>
            <button className="btn outline" type="button" onClick={() => navigator.clipboard.writeText(temporaryAccess.password)}>Copy temporary password</button>
            <small>Share this privately. The applicant must choose a new password after their first login. This password will not be shown again.</small>
          </div>
        ) : null}
        <div className="application-list">
          {applications.map((application) => {
            const pending = ['submitted', 'under_review'].includes(application.status)
            return (
              <article className="application-review-card" key={application.id}>
                <div className="workspace-card-heading">
                  <div>
                    <h3>{application.full_name}</h3>
                    <p className="muted">Application #{application.id} · {application.status.replace('_', ' ')}</p>
                  </div>
                  <span className="badge">{application.interest_area}</span>
                </div>
                <dl className="application-details">
                  <div><dt>Student ID</dt><dd>{application.student_id}</dd></div>
                  <div><dt>Branch / Year</dt><dd>{application.branch} · Year {application.academic_year}</dd></div>
                  <div><dt>Roll number</dt><dd>{application.roll_number}</dd></div>
                  <div><dt>College email</dt><dd>{application.college_email}</dd></div>
                  {application.personal_email ? <div><dt>Personal email</dt><dd>{application.personal_email}</dd></div> : null}
                  {application.phone ? <div><dt>Phone</dt><dd>{application.phone}</dd></div> : null}
                  {application.graduation_year ? <div><dt>Graduation</dt><dd>{application.graduation_year}</dd></div> : null}
                  <div><dt>Submitted</dt><dd>{new Date(application.submitted_at).toLocaleString()}</dd></div>
                </dl>
                {application.motivation ? <p className="application-motivation">{application.motivation}</p> : null}
                {application.rejection_reason ? <p className="form-error">Reason: {application.rejection_reason}</p> : null}
                {pending ? (
                  <div className="application-actions">
                    <label>
                      Assign role
                      <select value={applicationRoles[application.id] ?? 'member'} onChange={(event) => setApplicationRoles((current) => ({ ...current, [application.id]: event.target.value as 'member' | 'admin' }))}>
                        <option value="member">Member</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </label>
                    <button className="btn primary" type="button" onClick={() => approveApplication(application)} disabled={saving === `application:${application.id}`}>
                      {saving === `application:${application.id}` ? 'Saving...' : 'Approve'}
                    </button>
                    <button className="btn outline" type="button" onClick={() => rejectApplication(application)} disabled={saving === `application:${application.id}`}>
                      Reject
                    </button>
                  </div>
                ) : null}
                {!pending && application.status === 'approved' && application.account_id !== null && (!application.has_password || application.must_change_password) ? (
                  <div className="application-actions">
                    <button className="btn outline" type="button" onClick={() => issueTemporaryPassword(application)} disabled={saving === `temporary:${application.id}`}>
                      {saving === `temporary:${application.id}` ? 'Generating...' : 'Generate temporary password'}
                    </button>
                    <small>This account hasn’t completed its first password setup.</small>
                  </div>
                ) : null}
              </article>
            )
          })}
          {!applications.length ? <p className="muted">No membership applications have been submitted.</p> : null}
        </div>
      </section>
      <div className="admin-role-grid">
        {roles.map((role) => (
          <article className="card" key={role.key}>
            <h3>{role.name}</h3>
            <p className="muted">{role.description}</p>
            <div className="permission-list">
              {role.permissions.map((permission) => {
                const toggleKey = `${role.key}:${permission.key}`
                return (
                  <label className="permission-row" key={permission.key}>
                    <span>
                      <strong>{permission.key}</strong>
                      <small>{permission.description}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={permission.enabled}
                      disabled={saving === toggleKey || (role.key === 'admin' && permission.key === 'permissions.manage')}
                      onChange={(event) => toggle(role.key, permission.key, event.target.checked)}
                    />
                  </label>
                )
              })}
            </div>
          </article>
        ))}
      </div>
      <article className="card admin-position-manager">
        <div className="workspace-card-heading">
          <h3>Core position assignments</h3>
          <span className="badge">Current assignments</span>
        </div>
        <p className="muted">Assign Member or Administrator access, then add a core position when needed.</p>
        <div className="position-assignment-form">
          <select aria-label="User" value={selectedUserId} onChange={(event) => { setSelectedUserId(event.target.value); setUserId(event.target.value) }}>
            <option value="">Select user</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.display_name} · {user.email} · {user.role}</option>)}
          </select>
          <select aria-label="Core position" value={positionKey} onChange={(event) => setPositionKey(event.target.value)}>
            <option value="" disabled>Select position</option>
            {[...new Map(positions.map((position) => [position.key, position])).values()].map((position) => <option key={position.key} value={position.key}>{position.name}</option>)}
          </select>
          <button className="btn primary" type="button" onClick={assign} disabled={saving?.startsWith('assign:')}>Assign position</button>
        </div>
        <div className="position-assignment-form">
          {users.map((user) => (
            <div className="position-assignment-row" key={user.id}>
              <span><strong>#{user.id} {user.display_name}</strong><small>{user.email} · {user.role}</small></span>
              <div className="admin-user-actions">
                {user.role !== 'admin' ? (
                  <select value={user.role === 'member' ? 'member' : 'admin'} onChange={(event) => changeRole(user.id, event.target.value as 'member' | 'admin')} disabled={saving === `role:${user.id}`}>
                    <option value="member">Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                ) : <span className="badge">Admin</span>}
                <button className="btn outline" type="button" onClick={() => removeUser(user)} disabled={saving === `account:${user.id}`}>
                  {saving === `account:${user.id}` ? 'Deleting...' : 'Delete account'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="position-assignment-list">
          {positions.map((assignment) => (
            <div className="position-assignment-row" key={`${assignment.key}:${assignment.user_id ?? 'unassigned'}`}>
              <span><strong>{assignment.name}</strong><small>{assignment.user_id ? `${assignment.display_name ?? 'Unnamed user'} · ${assignment.email ?? `user #${assignment.user_id}`}` : 'Unassigned'}</small></span>
              {assignment.user_id ? <button className="btn outline" type="button" onClick={() => remove(assignment)} disabled={saving === `remove:${assignment.key}:${assignment.user_id}`}>Remove</button> : null}
            </div>
          ))}
        </div>
      </article>
    </DraggableWorkspace>
  )
}

export default AdminPage
