import { useEffect, useState, type FormEvent } from 'react'
import { getGallery, createGalleryPhoto, deleteGalleryPhoto } from '../../api/client'
import { gallery as defaultGallery, type GalleryItem } from '../../data/gallery'
import { useAdmin } from '../../hooks/useAdmin'
import DeviceImageUploader from '../../components/common/DeviceImageUploader'

export default function GalleryPage() {
  const isAdmin = useAdmin()
  const [items, setItems] = useState<GalleryItem[]>(defaultGallery)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null)

  // Admin add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [formImage, setFormImage] = useState('')
  const [formCaption, setFormCaption] = useState('')
  const [formFolder, setFormFolder] = useState('2026/DSCI 2 DAY BOOTCAMP 2026')

  useEffect(() => {
    let active = true
    getGallery()
      .then((data: Array<{ id: number; image_url: string; caption: string }>) => {
        if (!active) return
        if (data && data.length > 0) {
          const merged = data.map((apiItem: { id: number; image_url: string; caption: string }) => {
            const fallback = defaultGallery.find(
              (g) => g.image.endsWith(apiItem.image_url) || apiItem.image_url.endsWith(g.image)
            )
            return {
              id: apiItem.id,
              image: apiItem.image_url || fallback?.image || '',
              alt: apiItem.caption || fallback?.alt || 'Gallery photo',
              caption: apiItem.caption || fallback?.caption || 'Security Club DBIT photo',
              folder: fallback?.folder || '2026/DSCI 2 DAY BOOTCAMP 2026',
              folderLabel: fallback?.folderLabel || 'DSCI BOOTCAMP',
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

  const handleAddPhoto = async (e: FormEvent) => {
    e.preventDefault()
    if (!formImage.trim() || !formCaption.trim()) return
    setSubmitting(true)
    setAdminError(null)

    try {
      const created = await createGalleryPhoto({
        imageUrl: formImage.trim(),
        caption: formCaption.trim(),
      })

      const newPhoto: GalleryItem = {
        id: Number(created.id) || Date.now(),
        image: formImage.trim(),
        caption: formCaption.trim(),
        alt: formCaption.trim(),
        folder: formFolder || '2026/DSCI 2 DAY BOOTCAMP 2026',
        folderLabel: 'DSCI BOOTCAMP',
      }

      setItems((prev) => [newPhoto, ...prev])
      setShowAddModal(false)
      setFormImage('')
      setFormCaption('')
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePhoto = async (item: GalleryItem) => {
    if (!window.confirm('Delete this photo from the community gallery?')) return
    try {
      if (item.id) {
        await deleteGalleryPhoto(item.id)
      }
      setItems((prev) =>
        prev.filter((g) => (g.id && item.id ? g.id !== item.id : g.image !== item.image))
      )
      if (activePhoto?.image === item.image) {
        setActivePhoto(null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete photo')
    }
  }

  const folders = Array.from(new Set(items.map((i) => i.folder))).sort()

  const filteredItems = selectedFolder
    ? items.filter((item) => item.folder === selectedFolder)
    : items

  return (
    <div className="page section-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Moments from our community</p>
          <h1>Captured in the club.</h1>
          <p className="hero-lede">
            Browse the original folder arrangement, then open any photo for a closer look.
          </p>
        </div>
      </section>

      {isAdmin && (
        <div className="admin-action-bar">
          <div className="admin-badge-group">
            <span className="admin-badge-tag">Admin Mode</span>
            <p>You have permission to add new media records or remove photos from the gallery.</p>
          </div>
          <button
            type="button"
            className="admin-btn-add"
            onClick={() => {
              setAdminError(null)
              setShowAddModal(true)
            }}
          >
            + Add Gallery Image
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add Gallery Photo</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            {adminError && <div className="admin-form-error">{adminError}</div>}

            <form onSubmit={handleAddPhoto} className="admin-form-grid">
              <DeviceImageUploader
                value={formImage}
                onChange={setFormImage}
                label="Gallery Photo from Device *"
                required
              />

              <div className="admin-field-group">
                <label htmlFor="gallery-caption">Caption &amp; Alt Description *</label>
                <input
                  id="gallery-caption"
                  type="text"
                  required
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="e.g. Participants analyzing network packets during Lab session 2"
                />
              </div>

              <div className="admin-field-group">
                <label htmlFor="gallery-folder">Folder Category</label>
                <select
                  id="gallery-folder"
                  value={formFolder}
                  onChange={(e) => setFormFolder(e.target.value)}
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="2026/DSCI 2 DAY BOOTCAMP 2026">
                    2026 / DSCI 2 DAY BOOTCAMP 2026
                  </option>
                </select>
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
                  {submitting ? 'Uploading...' : 'Save Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gallery-browser">
        <div className="gallery-level">
          <button
            className={`gallery-all-button ${!selectedFolder ? 'is-active' : ''}`}
            type="button"
            onClick={() => setSelectedFolder(null)}
          >
            All photos
          </button>
        </div>

        <div className="gallery-folders" role="group" aria-label="Gallery folders">
          <div className="gallery-folder-group">
            {folders.map((folder) => {
              const item = items.find((e) => e.folder === folder)
              const label = item?.folderLabel || folder.split('/').slice(1).join(' / ') || folder
              return (
                <button
                  key={folder}
                  className={`gallery-folder-button ${selectedFolder === folder ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => setSelectedFolder(folder)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="gallery-grid">
          {filteredItems.map((item) => (
            <figure
              key={item.id ? `${item.id}-${item.image}` : item.image}
              className="gallery-item"
              data-gallery-item
              data-gallery-folder={item.folder}
            >
              <button
                className="gallery-image-button"
                type="button"
                aria-label="View photo in lightbox"
                onClick={() => setActivePhoto(item)}
              >
                <img
                  src={item.image}
                  alt={item.alt || 'Security Club gallery photo'}
                  className="is-loaded"
                  loading="lazy"
                />
              </button>
              {isAdmin && (
                <div className="gallery-admin-overlay">
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(item)
                    }}
                    title="Delete image"
                  >
                    ✕ Delete
                  </button>
                </div>
              )}
            </figure>
          ))}
        </div>

        {activePhoto && (
          <div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded gallery image"
            onClick={() => setActivePhoto(null)}
          >
            <button
              className="gallery-lightbox-close"
              type="button"
              aria-label="Close image"
              onClick={() => setActivePhoto(null)}
            >
              &times;
            </button>
            <div
              className="gallery-lightbox-dialog"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: 'auto',
              }}
            >
              <img
                src={activePhoto.image}
                alt={activePhoto.alt || activePhoto.caption}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <p
                style={{
                  marginTop: '1rem',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'center',
                }}
              >
                {activePhoto.caption}
              </p>

              {isAdmin && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => handleDeletePhoto(activePhoto)}
                  >
                    ✕ Delete Image from Gallery
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
