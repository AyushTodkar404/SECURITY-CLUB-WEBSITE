import { useEffect, useState } from 'react'
import { getGallery } from '../../api/client'
import { gallery as defaultGallery, type GalleryItem } from '../../data/gallery'

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(defaultGallery)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null)

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
              key={item.id + item.image}
              className="gallery-item"
              data-gallery-item
              data-gallery-folder={item.folder}
            >
              <button
                className="gallery-image-button"
                type="button"
                aria-label={`Open ${item.alt || item.caption}`}
                onClick={() => setActivePhoto(item)}
              >
                <img
                  src={item.image}
                  alt={item.alt || item.caption}
                  className="is-loaded"
                  loading="lazy"
                />
              </button>
              <figcaption>{item.caption}</figcaption>
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
