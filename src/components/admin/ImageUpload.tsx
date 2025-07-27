'use client'
import React, { useState, useRef } from 'react'
import { MediaModal } from './MediaModal'
import { getApiHeaders } from '@/utilities/apiKeyUtils'

type MediaObject = { id: string; url: string; filename?: string }

interface ImageUploadProps {
  value: string | null | MediaObject
  onChange: (value: MediaObject | null) => void
  uploadOnly?: boolean
}

export function ImageUpload({ value, onChange, uploadOnly = false }: ImageUploadProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (uploadOnly || !value) {
      setPreviewUrl('')
      setFileName('')
      return
    }

    if (typeof value === 'string') {
      fetch(`/api/media/${value}`, {
        headers: getApiHeaders(),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.url) {
            setPreviewUrl(data.url)
            setFileName(data.filename)
          } else {
            setPreviewUrl('')
            setFileName('')
          }
        })
        .catch(() => {
          setPreviewUrl('')
          setFileName('')
        })
    } else if (typeof value === 'object' && value.url) {
      setPreviewUrl(value.url)
      setFileName(value.filename || 'Image')
    } else {
      setPreviewUrl('')
      setFileName('')
    }
  }, [value, uploadOnly])

  const handleSelectMedia = (media: MediaObject) => {
    onChange(media)
    setIsMediaModalOpen(false)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
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

  const handleRemoveImage = () => {
    onChange(null)
  }

  if (uploadOnly) {
    return (
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f9fafb',
          transition: 'all 0.2s ease',
        }}
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          <p style={{ margin: 0, color: '#6b7280' }}>Click or drag file to upload</p>
        )}
      </div>
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
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
          />
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
        <button
          type="button"
          onClick={() => setIsMediaModalOpen(true)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
          }}
        >
          Select Image
        </button>
      )}

      {isMediaModalOpen && (
        <MediaModal onClose={() => setIsMediaModalOpen(false)} onSelect={handleSelectMedia} />
      )}
    </div>
  )
}
