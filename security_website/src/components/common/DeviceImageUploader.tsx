import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { uploadImage } from '../../api/client'

interface DeviceImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  required?: boolean
  helpText?: string
}

export default function DeviceImageUploader({
  value,
  onChange,
  label = 'Image / Media Asset',
  required = false,
  helpText = 'Upload an image from your device (PNG, JPG, WebP, GIF, SVG up to 10MB)',
}: DeviceImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProcessFile = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP, GIF, SVG).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const result = await uploadImage(file)
      onChange(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleClear = () => {
    onChange('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="admin-field-group device-uploader-group">
      <div className="uploader-header-row">
        <label className="uploader-label">
          {label} {required && '*'}
        </label>
        <button
          type="button"
          className="uploader-toggle-link"
          onClick={() => setShowManualInput((prev) => !prev)}
        >
          {showManualInput ? '« Pick from device' : 'Or enter URL directly »'}
        </button>
      </div>

      {showManualInput ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/... or https://..."
          required={required}
        />
      ) : (
        <div
          className={`uploader-dropzone ${isDragging ? 'is-dragging' : ''} ${value ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Upload image from device"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {value ? (
            <div className="uploader-preview-wrap" onClick={(e) => e.stopPropagation()}>
              <img src={value} alt="Upload preview" className="uploader-preview-img" />
              <div className="uploader-preview-details">
                <span className="uploader-badge-ok">✓ Image Loaded</span>
                <p className="uploader-preview-path" title={value}>{value}</p>
                <div className="uploader-actions-bar">
                  <button
                    type="button"
                    className="button button-ghost button-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={handleClear}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="uploader-prompt">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="uploader-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div className="uploader-prompt-text">
                <span className="uploader-cta">
                  {uploading ? 'Processing & uploading...' : 'Click or drag image from device'}
                </span>
                <span className="uploader-subtext">{helpText}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="admin-form-error uploader-error">{error}</div>}
    </div>
  )
}

