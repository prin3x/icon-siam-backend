import React, { useState, useEffect } from 'react'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { ImageUpload } from './ImageUpload'

type MediaObject = { id: string; url: string; filename?: string; mimeType?: string }

interface MediaModalProps {
  onClose: () => void
  onSelect: (media: MediaObject) => void
}

interface Pagination {
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function MediaModal({ onClose, onSelect }: Readonly<MediaModalProps>) {
  const [mediaItems, setMediaItems] = useState<MediaObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('select')
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const isVideoFromMimeOrUrl = (mimeType?: string, url?: string) => {
    if (mimeType?.startsWith('video')) return true
    if (!url) return false
    const lowered = url.toLowerCase().split('?')[0]
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi', '.mkv']
    return videoExts.some((ext) => lowered.endsWith(ext))
  }

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch(
          `/api/custom-admin/media?limit=${pagination.limit}&page=${pagination.page}`,
          {
            headers: getApiHeaders(!isInternalRequest()),
          },
        )
        if (!response.ok) {
          throw new Error('Failed to fetch media')
        }
        const data = await response.json()
        setMediaItems(data.docs || [])
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
        }))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'select') {
      fetchMedia()
    }
  }, [activeTab, pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleUploadComplete = (media: MediaObject | null) => {
    if (media) {
      onSelect(media)
    }
  }

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter an image URL')
      return
    }

    try {
      setUrlLoading(true)
      setUrlError('')

      // Validate URL format
      const url = new URL(urlInput.trim())
      if (!url.protocol.startsWith('http')) {
        throw new Error('URL must start with http:// or https://')
      }

      // Call server to fetch-and-upload the image; returns normal media object
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          ...getApiHeaders(true, false), // includes x-api-key; json
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput.trim(),
          filename: url.pathname.split('/').pop() || 'Image from URL',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to upload image from URL')
      }

      // Select the created media; coerce id to string|number type
      onSelect({ id: data.id, url: data.url, filename: data.filename })
    } catch (err: any) {
      console.log(err, 'err')
      setUrlError(err.message || 'Invalid URL format')
    } finally {
      setUrlLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '800px',
          height: '80%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Select or Upload Media</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: '1',
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('select')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'select' ? '2px solid #3b82f6' : 'none',
              fontWeight: activeTab === 'select' ? '600' : '500',
              color: activeTab === 'select' ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            Select from Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'upload' ? '2px solid #3b82f6' : 'none',
              fontWeight: activeTab === 'upload' ? '600' : '500',
              color: activeTab === 'upload' ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            Upload New
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'url' ? '2px solid #3b82f6' : 'none',
              fontWeight: activeTab === 'url' ? '600' : '500',
              color: activeTab === 'url' ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            URL Upload
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {error && <div style={{ color: '#dc2626' }}>Error: {error}</div>}
          {activeTab === 'select' && (
            <>
              {loading && <div>Loading media...</div>}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '16px',
                }}
              >
                {mediaItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
                    aria-label={`Select ${item.filename || 'media item'}`}
                    style={{
                      cursor: 'pointer',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      background: 'transparent',
                      padding: 0,
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    {isVideoFromMimeOrUrl(item.mimeType, item.url) ? (
                      <video
                        src={item.url}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px 4px 0 0',
                          backgroundColor: '#000',
                        }}
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.filename || ''}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    )}
                    <div
                      style={{
                        padding: '8px',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.filename || 'No Name'}
                    </div>
                  </button>
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </button>
                  <span style={{ margin: '0 16px' }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          {activeTab === 'upload' && (
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <ImageUpload value={null} onChange={handleUploadComplete} uploadOnly />
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                After uploading, the media will be automatically selected.
              </p>
            </div>
          )}
          {activeTab === 'url' && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Add Image from URL
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  Paste an image URL to add it directly to your content. This is useful for
                  replacing image placeholders from legacy content.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="url-input"
                  style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
                >
                  Image URL
                </label>
                <input
                  id="url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
                />
                {urlError && (
                  <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {urlError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleUrlUpload}
                  disabled={urlLoading || !urlInput.trim()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: urlLoading || !urlInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: urlLoading || !urlInput.trim() ? 0.6 : 1,
                  }}
                >
                  {urlLoading ? 'Adding...' : 'Add Image'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('')
                    setUrlError('')
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd',
                }}
              >
                <p style={{ fontSize: '12px', color: '#0369a1', margin: 0 }}>
                  <strong>Tip:</strong> This is perfect for replacing image placeholders like
                  &quot;[Image: Image] - Source: https://...&quot; from your legacy HTML content.
                  Just copy the URL from the placeholder and paste it here.
                </p>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
