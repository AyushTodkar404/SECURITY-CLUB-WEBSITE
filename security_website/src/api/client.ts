import type {
  AuthSession,
  EventInput,
  EventItem,
  EventRegistrationResponse,
  Flagship,
  GalleryFolder,
  GalleryPhoto,
  MembershipApplicationInput,
  MembershipApplicationResponse,
  TeamMember,
  UserRole,
  CorePosition,
} from '../types'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/api'

export type { UserRole } from '../types'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })
  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? body.error
      : `Request failed: ${response.status}`
    throw new ApiError(message, response.status)
  }
  return body as T
}

function jsonBody(value: unknown): RequestInit {
  return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) }
}

export async function getAuthSession(): Promise<AuthSession> {
  const session = await request<AuthSession & { positions?: CorePosition[] }>('/auth/me')
  return { ...session, positions: session.positions ?? [] }
}

export async function getCurrentRole(): Promise<UserRole> {
  const session = await getAuthSession()
  return session.role
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthRegistration extends AuthCredentials {
  displayName: string
}

export async function login(credentials: AuthCredentials): Promise<AuthSession> {
  await request('/auth/login', { method: 'POST', ...jsonBody(credentials) })
  return getAuthSession()
}

export async function changeTemporaryPassword(password: string): Promise<void> {
  await request('/auth/change-password', { method: 'POST', ...jsonBody({ password }) })
}

export async function register(credentials: AuthRegistration): Promise<AuthSession> {
  await request('/auth/register', { method: 'POST', ...jsonBody(credentials) })
  return getAuthSession()
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' })
}

export async function activateAccount(token: string, password: string): Promise<void> {
  await request('/auth/activate', { method: 'POST', ...jsonBody({ token, password }) })
}

export async function submitMembershipApplication(
  application: MembershipApplicationInput,
): Promise<MembershipApplicationResponse> {
  return request<MembershipApplicationResponse>('/membership-applications', {
    method: 'POST',
    ...jsonBody(application),
  })
}

export async function sendContactMessage(input: { name: string; email: string; message: string }): Promise<{ id: number; status: string }> {
  return request<{ id: number; status: string }>('/contact-messages', {
    method: 'POST',
    ...jsonBody(input),
  })
}

export async function getEvents(): Promise<EventItem[]> {
  return request<EventItem[]>('/events')
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return request<TeamMember[]>('/team')
}

interface GalleryWorkspaceResponse {
  folders: { id: number; name: string; parent_id: number | null }[]
  photos: { id: number; folder_id: number | null; image_url: string; caption: string | null; taken_at: string | null }[]
}

export async function getGalleryWorkspace(): Promise<GalleryFolder[]> {
  const workspace = await request<GalleryWorkspaceResponse>('/gallery/workspace')
  const folders = workspace.folders.map((folder) => ({
    id: String(folder.id),
    name: folder.name,
    children: [] as GalleryFolder[],
    photos: [] as GalleryPhoto[],
  }))
  const byId = new Map(folders.map((folder) => [folder.id, folder]))
  workspace.folders.forEach((record) => {
    if (record.parent_id !== null) byId.get(String(record.parent_id))?.children.push(byId.get(String(record.id))!)
  })
  workspace.photos.forEach((record) => {
    const folder = record.folder_id === null ? null : byId.get(String(record.folder_id))
    if (!folder) return
    folder.photos.push({
      id: String(record.id),
      imageUrl: record.image_url,
      name: record.caption ?? 'Gallery photo',
      caption: 'Gallery photo',
      event: '',
      date: record.taken_at ?? '',
    })
  })
  return workspace.folders.filter((folder) => folder.parent_id === null).map((folder) => byId.get(String(folder.id))!)
}

export async function createGalleryFolder(name: string, parentId: number | null): Promise<GalleryFolder> {
  const created = await request<{ id: number; name: string }>('/gallery/folders', {
    method: 'POST',
    ...jsonBody({ name, parentId }),
  })
  return { id: String(created.id), name: created.name, children: [], photos: [] }
}

export async function deleteGalleryFolder(folderId: number): Promise<void> {
  await request(`/gallery/folders/${folderId}`, { method: 'DELETE' })
}

export async function createGalleryPhoto(folderId: number, imageUrl: string, caption: string): Promise<GalleryPhoto> {
  const created = await request<{ id: number; image_url: string; caption: string | null; taken_at: string | null }>(
    '/gallery',
    { method: 'POST', ...jsonBody({ folderId, imageUrl, caption }) },
  )
  return {
    id: String(created.id),
    imageUrl: created.image_url,
    name: created.caption ?? caption,
    caption: created.caption ?? caption,
    event: '',
    date: created.taken_at ?? '',
  }
}

export async function deleteGalleryPhoto(photoId: number): Promise<void> {
  await request(`/gallery/${photoId}`, { method: 'DELETE' })
}

export async function createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  return request<TeamMember>('/team', {
    method: 'POST',
    ...jsonBody({
      nameOverride: member.name,
      roleTitle: member.role,
      imageUrl: member.image,
      description: member.description,
    }),
  })
}

export async function archiveTeamMember(id: number): Promise<void> {
  await request(`/team/${id}`, { method: 'DELETE' })
}

export async function getManagedEvents(): Promise<EventItem[]> {
  return request<EventItem[]>('/events/manage')
}

export async function createEvent(input: EventInput): Promise<EventItem> {
  return request<EventItem>('/events', { method: 'POST', ...jsonBody(input) })
}

export async function updateEvent(id: number, input: Partial<EventInput>): Promise<EventItem> {
  return request<EventItem>(`/events/${id}`, { method: 'PATCH', ...jsonBody(input) })
}

export async function publishEvent(id: number): Promise<EventItem> {
  return request<EventItem>(`/events/${id}/publish`, { method: 'POST' })
}

export async function cancelEvent(id: number): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/events/${id}`, { method: 'DELETE' })
}

export async function registerForEvent(id: number): Promise<EventRegistrationResponse> {
  return request<EventRegistrationResponse>(`/events/${id}/registrations`, { method: 'POST' })
}

export async function cancelEventRegistration(id: number): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/events/${id}/registrations`, { method: 'DELETE' })
}

interface DatabaseFlagship {
  id: number
  title: string
  description: string
  image_url: string | null
  year: number | null
}

function mapFlagship(flagship: DatabaseFlagship): Flagship {
  return { id: flagship.id, title: flagship.title, description: flagship.description, image: flagship.image_url ?? '', year: String(flagship.year ?? '') }
}

export async function getFlagships(): Promise<Flagship[]> {
  const flagships = await request<DatabaseFlagship[]>('/flagships')
  return flagships.map(mapFlagship)
}

export async function createFlagship(flagship: Omit<Flagship, 'id'>): Promise<Flagship> {
  const created = await request<DatabaseFlagship>('/flagships', {
    method: 'POST',
    ...jsonBody({ title: flagship.title, description: flagship.description, imageUrl: flagship.image || undefined, year: Number(flagship.year) }),
  })
  return mapFlagship(created)
}

export async function archiveFlagship(id: number): Promise<void> {
  await request(`/flagships/${id}`, { method: 'DELETE' })
}

export interface ArchitecturePermission {
  id: number
  key: string
  description: string
  enabled: boolean
}

export interface ArchitectureRole {
  id: number
  key: string
  name: string
  description: string
  hierarchy_level: number
  permissions: ArchitecturePermission[]
}

export interface CorePositionAssignment {
  id: number
  key: string
  name: string
  description: string
  display_order: number
  user_id: number | null
  display_name: string | null
  email: string | null
}

export interface AdminUser {
  id: number
  email: string
  display_name: string
  status: string
  role: UserRole
  position_keys: string[]
}

export interface AdminMembershipApplication {
  id: number
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  interest_area: string
  motivation: string | null
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  profile_id: number
  full_name: string
  student_id: string
  branch: string
  academic_year: number
  roll_number: string
  college_email: string
  personal_email: string | null
  phone: string | null
  graduation_year: number | null
  account_id: number | null
  account_status: string | null
  has_password: number
  must_change_password: number
}

export interface MembershipApprovalResult {
  userId: number
  membershipId: number
  applicationId: number
  role: 'member' | 'admin'
  temporaryPassword: string | null
}

export interface CommentItem {
  id: number
  entity_type: string
  entity_id: number
  body: string
  created_at: string
  updated_at: string
  author_id: number
  author_name: string
}

export async function getAdminArchitecture(): Promise<{ roles: ArchitectureRole[]; positions: CorePositionAssignment[]; users: AdminUser[] }> {
  return request('/admin/architecture')
}

export async function getAdminMembershipApplications(): Promise<AdminMembershipApplication[]> {
  return request('/admin/membership-applications')
}

export async function approveMembershipApplication(
  applicationId: number,
  role: 'member' | 'admin',
): Promise<MembershipApprovalResult> {
  return request<MembershipApprovalResult>(`/admin/membership-applications/${applicationId}/approve`, {
    method: 'POST',
    ...jsonBody({ role }),
  })
}

export async function issueMembershipTemporaryPassword(applicationId: number): Promise<{ temporaryPassword: string }> {
  return request<{ temporaryPassword: string }>(`/admin/membership-applications/${applicationId}/temporary-password`, {
    method: 'POST',
    ...jsonBody({}),
  })
}

export async function rejectMembershipApplication(applicationId: number, reason?: string): Promise<void> {
  await request(`/admin/membership-applications/${applicationId}/reject`, {
    method: 'POST',
    ...jsonBody({ reason }),
  })
}

export async function setRolePermission(roleKey: string, permissionKey: string, enabled: boolean): Promise<void> {
  await request(`/admin/roles/${encodeURIComponent(roleKey)}/permissions/${encodeURIComponent(permissionKey)}`, {
    method: 'PATCH',
    ...jsonBody({ enabled }),
  })
}

export async function assignCorePosition(userId: number, positionKey: string): Promise<void> {
  await request(`/admin/users/${userId}/positions`, {
    method: 'POST',
    ...jsonBody({ positionKey }),
  })
}

export async function removeCorePosition(userId: number, positionKey: string): Promise<void> {
  await request(`/admin/users/${userId}/positions/${encodeURIComponent(positionKey)}`, { method: 'DELETE' })
}

export async function setUserRole(userId: number, role: 'member' | 'admin'): Promise<void> {
  await request(`/admin/users/${userId}/role`, { method: 'PATCH', ...jsonBody({ role }) })
}

export async function removeAdminUser(userId: number): Promise<void> {
  await request(`/admin/users/${userId}`, { method: 'DELETE' })
}

export async function getComments(entityType: string, entityId: number): Promise<CommentItem[]> {
  return request<CommentItem[]>(`/comments/${encodeURIComponent(entityType)}/${entityId}`)
}

export async function addComment(entityType: string, entityId: number, body: string): Promise<{ id: number; status: 'created' }> {
  return request<{ id: number; status: 'created' }>(`/comments/${encodeURIComponent(entityType)}/${entityId}`, {
    method: 'POST',
    ...jsonBody({ body }),
  })
}

export type { CorePosition }
