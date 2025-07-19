import React, { useState, useEffect } from 'react'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { ImageUpload } from './ImageUpload'

interface Media {
  id: string
  url: string
  filename: string
}

interface MediaModalProps {
  onClose: () => void
  onSelect: (media: Media) => void
}

export function MediaModal({ onClose, onSelect }: MediaModalProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('select')

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('/api/authenticated/media?limit=100', {
          headers: getApiHeaders(!isInternalRequest()),
        })
        if (!response.ok) {
          throw new Error('Failed to fetch media')
        }
        const data = await response.json()
        setMediaItems(data.docs || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'select') {
      fetchMedia()
    }
  }, [activeTab])

  const handleUploadComplete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/authenticated/media/${mediaId}`, {
        headers: getApiHeaders(!isInternalRequest()),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch media details')
      }
      const media = await response.json()
      onSelect(media)
    } catch (err: any) {
      setError(err.message)
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
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    style={{ cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    <img
                      src={item.url}
                      alt={item.filename}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '4px 4px 0 0',
                      }}
                    />
                    <div
                      style={{
                        padding: '8px',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.filename}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === 'upload' && (
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <ImageUpload value={null} onChange={handleUploadComplete} />
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                After uploading, the image will be automatically selected.
              </p>
            </div>
          )}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button
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
