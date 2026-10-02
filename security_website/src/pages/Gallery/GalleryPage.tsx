import { useEffect, useMemo, useRef, useState } from 'react'
import SectionHeader from '../../components/common/SectionHeader'
import DraggableWorkspace from '../../components/layout/DraggableWorkspace'
import Button from '../../components/ui/Button'
import {
  createGalleryFolder,
  createGalleryPhoto,
  deleteGalleryFolder,
  deleteGalleryPhoto,
  getAuthSession,
  getGalleryWorkspace,
} from '../../api/client'
import type { GalleryFolder, GalleryPhoto } from '../../types'

const legacyStorageKey = 'security-club-gallery-folders'
const legacyMigrationKey = 'security-club-gallery-database-imported-v1'

interface LegacyGalleryPhoto {
  id: string
  imageUrl: string
  name?: string
  caption?: string
}

interface LegacyGalleryFolder {
  id: string
  name: string
  children: LegacyGalleryFolder[]
  photos: LegacyGalleryPhoto[]
}

function findFolder(folders: GalleryFolder[], id: string): GalleryFolder | null {
  for (const folder of folders) {
    if (folder.id === id) return folder
    const found = findFolder(folder.children, id)
    if (found) return found
  }
  return null
}

function findPath(folders: GalleryFolder[], id: string, path: GalleryFolder[] = []): GalleryFolder[] {
  for (const folder of folders) {
    const nextPath = [...path, folder]
    if (folder.id === id) return nextPath
    const found = findPath(folder.children, id, nextPath)
    if (found.length) return found
  }
  return []
}

function addFolder(folders: GalleryFolder[], parentId: string | null, folder: GalleryFolder): GalleryFolder[] {
  if (parentId === null) return [...folders, folder]
  return folders.map((current) => current.id === parentId
    ? { ...current, children: [...current.children, folder] }
    : { ...current, children: addFolder(current.children, parentId, folder) })
}

function addPhotos(folders: GalleryFolder[], folderId: string, photos: GalleryPhoto[]): GalleryFolder[] {
  return folders.map((current) => current.id === folderId
    ? { ...current, photos: [...current.photos, ...photos] }
    : { ...current, children: addPhotos(current.children, folderId, photos) })
}

function removeFolder(folders: GalleryFolder[], folderId: string): GalleryFolder[] {
  return folders
    .filter((folder) => folder.id !== folderId)
    .map((folder) => ({ ...folder, children: removeFolder(folder.children, folderId) }))
}

function removePhoto(folders: GalleryFolder[], folderId: string, photoId: string): GalleryFolder[] {
  return folders.map((folder) => folder.id === folderId
    ? { ...folder, photos: folder.photos.filter((photo) => photo.id !== photoId) }
    : { ...folder, children: removePhoto(folder.children, folderId, photoId) })
}

async function readPhoto(file: File): Promise<{ imageUrl: string; name: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Unable to prepare this photo')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error(`Unable to prepare ${file.name}`))
      const reader = new FileReader()
      reader.onload = () => resolve({ imageUrl: String(reader.result), name: file.name })
      reader.onerror = () => reject(new Error(`Unable to read ${file.name}`))
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.72)
  })
}

async function importLegacyGallery(folders: GalleryFolder[]): Promise<GalleryFolder[]> {
  if (window.localStorage.getItem(legacyMigrationKey)) return folders
  const legacyContent = window.localStorage.getItem(legacyStorageKey)
  if (!legacyContent) {
    window.localStorage.setItem(legacyMigrationKey, 'complete')
    return folders
  }

  const legacyFolders = JSON.parse(legacyContent) as LegacyGalleryFolder[]
  const importFolders = async (
    sourceFolders: LegacyGalleryFolder[],
    targetFolders: GalleryFolder[],
    parentId: string | null,
  ): Promise<void> => {
    for (const source of sourceFolders) {
      let target = targetFolders.find((folder) => folder.name === source.name)
      if (!target) {
        target = await createGalleryFolder(source.name, parentId === null ? null : Number(parentId))
        targetFolders.push(target)
      }

      for (const photo of source.photos ?? []) {
        if (!photo.imageUrl.startsWith('data:image/')) continue
        const importCaption = `legacy-import:${photo.id}`
        if (target.photos.some((existing) => existing.name === importCaption)) continue
        const image = await fetch(photo.imageUrl).then((response) => response.blob())
        const compressed = await readPhoto(new File([image], photo.name ?? photo.caption ?? 'gallery-photo', { type: image.type }))
        const imported = await createGalleryPhoto(Number(target.id), compressed.imageUrl, importCaption)
        target.photos.push(imported)
      }

      await importFolders(source.children ?? [], target.children, target.id)
    }
  }

  await importFolders(legacyFolders, folders, null)
  window.localStorage.setItem(legacyMigrationKey, 'complete')
  return folders
}

function GalleryPage() {
  const [folders, setFolders] = useState<GalleryFolder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [zoom, setZoom] = useState(1)
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    Promise.all([getGalleryWorkspace(), getAuthSession()])
      .then(async ([workspace, session]) => {
        if (!active) return
        const hasGalleryPermission = session.authenticated && session.permissions.includes('gallery.manage')
        setCanManage(hasGalleryPermission)
        try {
          setFolders(hasGalleryPermission ? await importLegacyGallery(workspace) : workspace)
        } catch (migrationError) {
          if (active) {
            setFolders(workspace)
            setError(migrationError instanceof Error ? migrationError.message : 'Unable to import existing Gallery photos')
          }
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load Gallery from the database')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const currentFolder = currentFolderId ? findFolder(folders, currentFolderId) : null
  const breadcrumb = useMemo(() => currentFolder ? findPath(folders, currentFolder.id) : [], [folders, currentFolder])
  const visibleFolders = currentFolder ? currentFolder.children : folders

  const createFolder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = newFolderName.trim()
    if (!name || !canManage) return
    try {
      setError(null)
      const folder = await createGalleryFolder(name, currentFolder ? Number(currentFolder.id) : null)
      setFolders((current) => addFolder(current, currentFolder?.id ?? null, folder))
      setNewFolderName('')
      setShowFolderForm(false)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create folder in the database')
    }
  }

  const uploadPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))
    if (!canManage || !currentFolder || !files.length) return
    const savedPhotos: GalleryPhoto[] = []
    try {
      setError(null)
      for (const file of files) {
        const photo = await readPhoto(file)
        savedPhotos.push(await createGalleryPhoto(Number(currentFolder.id), photo.imageUrl, photo.name))
        setFolders((current) => addPhotos(current, currentFolder.id, [savedPhotos[savedPhotos.length - 1]]))
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload photos')
    } finally {
      event.target.value = ''
    }
  }

  const deletePhoto = async (photo: GalleryPhoto) => {
    if (!canManage || !currentFolder || !window.confirm('Delete this photo?')) return
    try {
      await deleteGalleryPhoto(Number(photo.id))
      setFolders((current) => removePhoto(current, currentFolder.id, photo.id))
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete photo')
    }
  }

  const deleteFolder = async (folder: GalleryFolder) => {
    if (!canManage) return
    if (!window.confirm(`Delete the folder "${folder.name}" and everything inside it?`)) return
    const path = findPath(folders, folder.id)
    const parentId = path.length > 1 ? path[path.length - 2].id : null
    try {
      await deleteGalleryFolder(Number(folder.id))
      const remainingFolders = removeFolder(folders, folder.id)
      setFolders(remainingFolders)
      if (currentFolderId === folder.id) setCurrentFolderId(parentId ?? remainingFolders[0]?.id ?? null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete folder')
    }
  }

  return (
    <DraggableWorkspace pageKey="gallery">
      <SectionHeader
        eyebrow="Gallery"
        title="Snapshots from Sessions"
        subtitle="Organize club memories into folders, then open any photo for a closer look."
      />

      <div className="gallery-toolbar">
        <div className="gallery-breadcrumbs" aria-label="Gallery folders">
          <button type="button" onClick={() => setCurrentFolderId(null)}>Gallery</button>
          {breadcrumb.map((folder, index) => (
            <span key={folder.id}>
              <span aria-hidden="true">/</span>
              <button type="button" onClick={() => setCurrentFolderId(index === breadcrumb.length - 1 ? folder.id : folder.id)}>{folder.name}</button>
            </span>
          ))}
        </div>
        {canManage ? (
          <div className="gallery-actions">
            <Button type="button" variant="secondary" onClick={() => setShowFolderForm((visible) => !visible)}>
              + New folder
            </Button>
            <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={!currentFolder}>
              + Upload photos
            </Button>
            <input ref={fileInputRef} className="gallery-file-input" type="file" accept="image/*" multiple onChange={uploadPhotos} />
          </div>
        ) : null}
      </div>

      {canManage && showFolderForm && (
        <form className="gallery-folder-form" onSubmit={createFolder}>
          <label htmlFor="new-gallery-folder">Folder name</label>
          <input id="new-gallery-folder" value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} placeholder="e.g. Workshop Day 1" autoFocus required />
          <Button type="submit">Create folder</Button>
        </form>
      )}

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {loading ? <p className="gallery-empty">Loading Gallery...</p> : null}

      <div className="gallery-folder-grid">
        {visibleFolders.map((folder) => (
          <article key={folder.id} className="gallery-folder">
            <button type="button" className="gallery-folder-open" onClick={() => setCurrentFolderId(folder.id)}>
              <span className="gallery-folder-icon" aria-hidden="true">[ ]</span>
              <strong>{folder.name}</strong>
              <small>{folder.photos.length} photos · {folder.children.length} folders</small>
            </button>
            {canManage ? <button type="button" className="gallery-delete" onClick={() => deleteFolder(folder)} aria-label={`Delete ${folder.name}`}>Delete folder</button> : null}
          </article>
        ))}
      </div>

      <div className="gallery-grid">
        {currentFolder?.photos.map((photo) => (
          <article key={photo.id} className="gallery-card">
            <button type="button" className="gallery-photo-open" onClick={() => { setSelectedPhoto(photo); setZoom(1) }}>
              <img src={photo.imageUrl} alt={photo.caption} />
            </button>
            {canManage ? <button type="button" className="gallery-delete" onClick={() => deletePhoto(photo)} aria-label="Delete photo">Delete photo</button> : null}
          </article>
        ))}
      </div>

      {currentFolder && !currentFolder.children.length && !currentFolder.photos.length ? (
        <p className="gallery-empty">This folder is empty. Upload photos or create a new folder here.</p>
      ) : null}
      {!currentFolder && !visibleFolders.length ? (
        <p className="gallery-empty">No folders yet. Create your first folder to start organizing gallery photos.</p>
      ) : null}

      {selectedPhoto && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selectedPhoto.name} onClick={() => setSelectedPhoto(null)}>
          <div className="gallery-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-lightbox-toolbar">
              <strong>Photo viewer</strong>
              <div>
                <button type="button" onClick={() => setZoom((value) => Math.max(.5, value - .25))} aria-label="Zoom out">-</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((value) => Math.min(3, value + .25))} aria-label="Zoom in">+</button>
                <button type="button" onClick={() => setSelectedPhoto(null)} aria-label="Close photo viewer">x</button>
              </div>
            </div>
            <div className="gallery-lightbox-image-wrap">
              <img src={selectedPhoto.imageUrl} alt={selectedPhoto.caption} style={{ transform: `scale(${zoom})` }} />
            </div>
          </div>
        </div>
      )}
    </DraggableWorkspace>
  )
}

export default GalleryPage
