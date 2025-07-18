import React, { useState, useRef } from 'react'

interface ImageUploadProps {
  value?: any
  onChange: (value: any) => void
  placeholder?: string
  readOnly?: boolean
}

interface MediaFile {
  id: string
  filename: string
  url: string
  alt?: string
  width?: number
  height?: number
}

export function ImageUpload({ value, onChange, placeholder, readOnly = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse the value - could be a single image or array of images
  const currentImages: MediaFile[] = React.useMemo(() => {
    if (!value) return []

    if (Array.isArray(value)) {
      return value.map((item: any) => ({
        id: item.id || item,
        filename: item.filename || 'Unknown',
        url: item.url || item,
        alt: item.alt || '',
        width: item.width,
        height: item.height,
      }))
    }

    // Single image
    return [
      {
        id: value.id || value,
        filename: value.filename || 'Unknown',
        url: value.url || value,
        alt: value.alt || '',
        width: value.width,
        height: value.height,
      },
    ]
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i])
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const uploadedFiles = await response.json()

      // Update the value based on whether it's single or multiple
      if (Array.isArray(value)) {
        // Multiple images
        onChange([...currentImages, ...uploadedFiles])
      } else {
        // Single image - replace
        onChange(uploadedFiles[0] || uploadedFiles)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Upload failed')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (imageId: string) => {
    if (Array.isArray(value)) {
      // Remove from array
      onChange(currentImages.filter((img) => img.id !== imageId))
    } else {
      // Clear single image
      onChange(null)
    }
  }

  const handleClickUpload = () => {
    if (!readOnly && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={Array.isArray(value)}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Current Images Display */}
      {currentImages.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}
          >
            Current Images ({currentImages.length})
          </div>
          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            }}
          >
            {currentImages.map((image) => (
              <div
                key={image.id}
                style={{
                  position: 'relative',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f9fafb',
                }}
              >
                <img
                  src={image.url}
                  alt={image.alt || image.filename}
                  style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    padding: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  {image.filename}
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      border: 'none',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {!readOnly && (
        <div>
          <button
            type="button"
            onClick={handleClickUpload}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#6b7280',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: uploading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.color = '#3b82f6'
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading) {
                e.currentTarget.style.borderColor = '#d1d5db'
                e.currentTarget.style.color = '#6b7280'
              }
            }}
          >
            {uploading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #3b82f6',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Uploading...
              </>
            ) : (
              <>📷 {placeholder || 'Click to upload image'}</>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {/* Help Text */}
      <div
        style={{
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '8px',
          fontStyle: 'italic',
        }}
      >
        Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB per image.
      </div>
    </div>
  )
}
