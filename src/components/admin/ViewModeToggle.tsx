import React from 'react'

type ViewMode = 'list' | 'grid' | 'table'

interface ViewModeToggleProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '8px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        width: 'fit-content',
      }}
    >
      <button
        onClick={() => setViewMode('list')}
        style={{
          padding: '10px 16px',
          border: viewMode === 'list' ? '2px solid #3b82f6' : '1px solid transparent',
          borderRadius: '8px',
          backgroundColor: viewMode === 'list' ? '#3b82f6' : 'transparent',
          color: viewMode === 'list' ? '#ffffff' : '#64748b',
          cursor: 'pointer',
          fontWeight: viewMode === 'list' ? '600' : '500',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        📋 List
      </button>
      <button
        onClick={() => setViewMode('grid')}
        style={{
          padding: '10px 16px',
          border: viewMode === 'grid' ? '2px solid #3b82f6' : '1px solid transparent',
          borderRadius: '8px',
          backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'transparent',
          color: viewMode === 'grid' ? '#ffffff' : '#64748b',
          cursor: 'pointer',
          fontWeight: viewMode === 'grid' ? '600' : '500',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        🗂️ Grid
      </button>
      <button
        onClick={() => setViewMode('table')}
        style={{
          padding: '10px 16px',
          border: viewMode === 'table' ? '2px solid #3b82f6' : '1px solid transparent',
          borderRadius: '8px',
          backgroundColor: viewMode === 'table' ? '#3b82f6' : 'transparent',
          color: viewMode === 'table' ? '#ffffff' : '#64748b',
          cursor: 'pointer',
          fontWeight: viewMode === 'table' ? '600' : '500',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        📊 Table
      </button>
    </div>
  )
}
