'use client'
import React, { useState, useRef } from 'react'
import { MediaModal } from './MediaModal'
import { getApiHeaders } from '@/utilities/apiKeyUtils'

interface ImageUploadProps {
  value: string | null | { id: string; url: string }
  onChange: (value: string) => void
  uploadOnly?: boolean
}

export function ImageUpload({ value, onChange, uploadOnly = false }: ImageUploadProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    console.log('value', value)
    if (uploadOnly || !value) {
      setPreviewUrl('')
      return
    }

    if (typeof value === 'string') {
      console.log('value is a string', value)
      // It's an ID, fetch the media object for the URL
      fetch(`/api/media/${value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) setPreviewUrl(data.url)
          else setPreviewUrl('')
        })
        .catch(() => setPreviewUrl(''))
    } else if (typeof value === 'object' && value.url) {
      console.log('value is an object', value)
      // It's a populated object, just use the URL
      setPreviewUrl(value.url)
    } else {
      setPreviewUrl('')
    }
  }, [value, uploadOnly])

  const handleSelectMedia = (media: { id: string; url: string }) => {
    onChange(media.id)
    setPreviewUrl(media.url)
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
        headers: getApiHeaders(true, true), // Use utility to get headers
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      onChange(data.doc.id)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  if (uploadOnly) {
    return (
      <div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        {uploading && <p>Uploading...</p>}
      </div>
    )
  }

  return (
    <div>
      <button type="button" onClick={() => setIsMediaModalOpen(true)}>
        Select Image
      </button>
      {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px' }} />}
      {isMediaModalOpen && (
        <MediaModal onClose={() => setIsMediaModalOpen(false)} onSelect={handleSelectMedia} />
      )}
    </div>
  )
}
