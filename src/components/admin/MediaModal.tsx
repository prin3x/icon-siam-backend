import React, { useState, useEffect } from 'react'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { ImageUpload } from './ImageUpload'

type MediaObject = { id: string; url: string; filename?: string }

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

export function MediaModal({ onClose, onSelect }: MediaModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('select')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

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
                      alt={item.filename || ''}
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
                      {item.filename || 'No Name'}
                    </div>
                  </div>
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
                After uploading, the image will be automatically selected.
              </p>
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
