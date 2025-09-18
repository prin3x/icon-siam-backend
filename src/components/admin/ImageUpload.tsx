'use client'
import React, { useState, useRef } from 'react'
import { MediaModal } from './MediaModal'
import { getApiHeaders } from '@/utilities/apiKeyUtils'

type MediaObject = { id: string; url: string; filename?: string; mimeType?: string }

interface ImageUploadProps {
  readonly value: string | null | MediaObject
  readonly onChange: (value: MediaObject | null) => void
  readonly uploadOnly?: boolean
}

// Shared drag-and-drop upload area component
interface UploadAreaProps {
  readonly isDragOver: boolean
  readonly uploading: boolean
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>
  readonly onDragOver: (e: React.DragEvent) => void
  readonly onDragLeave: () => void
  readonly onDrop: (e: React.DragEvent) => void
  readonly onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly onMediaModalOpen: () => void
  readonly showRecommendation?: boolean
}

function UploadArea({
  isDragOver,
  uploading,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onMediaModalOpen,
  showRecommendation = true,
}: UploadAreaProps) {
  return (
    <button
      type="button"
      style={{
        width: '100%',
        border: '2px dashed #e5e7eb',
        borderRadius: '12px',
        padding: '28px 16px',
        textAlign: 'center',
        backgroundColor: isDragOver ? '#f3f4f6' : 'transparent',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        background: 'transparent',
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <div style={{ color: '#9ca3af', marginBottom: 8 }}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
          <circle cx="8.5" cy="10.5" r="1.5" />
          <path d="M21 15l-4.5-4.5L9 18" />
        </svg>
      </div>
      {uploading ? (
        <div style={{ color: '#6b7280' }}>Uploading...</div>
      ) : (
        <div style={{ color: '#111827' }}>
          <span style={{ color: '#374151' }}>Drag and drop a file or </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              color: '#0ea5e9',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Upload
          </button>
          <span style={{ color: '#374151' }}> or </span>
          <button
            type="button"
            onClick={onMediaModalOpen}
            style={{
              color: '#0ea5e9',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Choose from existing
          </button>
        </div>
      )}

      <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>
        Images (PNG, JPG, WEBP) and Videos (MP4, WEBM, OGG).
        {showRecommendation && <div>Recommended image size: 800×800 px</div>}
      </div>
    </button>
  )
}

export function ImageUpload({ value, onChange, uploadOnly = false }: ImageUploadProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isVideo, setIsVideo] = useState(false)

  const isVideoFromMimeOrUrl = (mimeType?: string, url?: string) => {
    if (mimeType?.startsWith('video')) return true
    if (!url) return false
    const lowered = url.toLowerCase().split('?')[0]
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi', '.mkv']
    return videoExts.some((ext) => lowered.endsWith(ext))
  }

  React.useEffect(() => {
    if (uploadOnly || !value) {
      setPreviewUrl('')
      setFileName('')
      setIsVideo(false)
      return
    }

    if (typeof value === 'string') {
      fetch(`/api/media/${value}`, {
        headers: getApiHeaders(),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.url) {
            setPreviewUrl(data.url)
            setFileName(data.filename)
            setIsVideo(isVideoFromMimeOrUrl(data.mimeType, data.url))
          } else {
            setPreviewUrl('')
            setFileName('')
            setIsVideo(false)
          }
        })
        .catch(() => {
          setPreviewUrl('')
          setFileName('')
          setIsVideo(false)
        })
    } else if (typeof value === 'object' && value.url) {
      setPreviewUrl(value.url)
      setFileName(value.filename || 'Image')
      // Detect whether the selected media is a video
      setIsVideo(isVideoFromMimeOrUrl(value.mimeType, value.url))
    } else {
      setPreviewUrl('')
      setFileName('')
      setIsVideo(false)
    }
  }, [value, uploadOnly])

  const handleSelectMedia = (media: MediaObject) => {
    onChange(media)
    setIsMediaModalOpen(false)
  }

  const uploadFile = async (file: File) => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        headers: getApiHeaders(true, true),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      onChange(data.doc)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    uploadFile(file)
  }

  const handleRemoveImage = () => {
    onChange(null)
    setPreviewUrl('')
    setFileName('')
    setIsVideo(false)
  }

  if (uploadOnly) {
    return (
      <UploadArea
        isDragOver={isDragOver}
        uploading={uploading}
        fileInputRef={fileInputRef}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) uploadFile(file)
        }}
        onFileChange={handleFileChange}
        onMediaModalOpen={() => setIsMediaModalOpen(true)}
        showRecommendation={true}
      />
    )
  }

  return (
    <div>
      {previewUrl ? (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'white',
          }}
        >
          {isVideo ? (
            <video
              src={previewUrl}
              style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
              muted
              playsInline
              controls
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {fileName}
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
            >
              View full size
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            title="Remove image"
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: '1',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            &times;
          </button>
        </div>
      ) : (
        <UploadArea
          isDragOver={isDragOver}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) uploadFile(file)
          }}
          onFileChange={handleFileChange}
          onMediaModalOpen={() => setIsMediaModalOpen(true)}
          showRecommendation={false}
        />
      )}

      {isMediaModalOpen && (
        <MediaModal onClose={() => setIsMediaModalOpen(false)} onSelect={handleSelectMedia} />
      )}
    </div>
  )
}
