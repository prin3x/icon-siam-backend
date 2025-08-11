import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from './LocaleContext'

interface RelationshipFieldProps {
  value: any
  onChange: (value: any) => void
  field: {
    name: string
    label: string
    relationTo?: string | string[]
    hasMany?: boolean
    filterOptions?: Record<string, any>
  }
  placeholder?: string
}

interface RelatedRecord {
  id: string
  title?: string
  name?: string
  [key: string]: any
}

export function RelationshipField({ value, onChange, field, placeholder }: RelationshipFieldProps) {
  const [options, setOptions] = useState<RelatedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const { locale } = useLocale()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const schemaCacheRef = useRef<Record<string, { useAsTitle?: string; fieldNames: Set<string> }>>(
    {},
  )

  // Convert relationTo to array if it's a string
  const collections = field.relationTo
    ? Array.isArray(field.relationTo)
      ? field.relationTo
      : [field.relationTo]
    : []

  const collectionsKey = JSON.stringify(collections)

  // Debounce search term
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 350)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Search on demand instead of fetching large lists
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchSearch = async () => {
      if (!debouncedTerm || debouncedTerm.length < 2 || collections.length === 0) {
        // Provide default suggestions with empty search: first 5 per collection
        if (collections.length === 0) {
          setOptions([])
          return
        }
        try {
          setLoading(true)
          const fo = field.filterOptions || {}
          const supportedOps = [
            'equals',
            'not_equals',
            'in',
            'not_in',
            'like',
            'greater_than',
            'less_than',
            'exists',
          ] as const
          const requests = collections.map(async (collection) => {
            const params = new URLSearchParams()
            params.set('limit', '5')
            if (locale) params.set('locale', locale)
            Object.entries(fo).forEach(([key, cond]) => {
              if (cond && typeof cond === 'object') {
                for (const op of supportedOps) {
                  if (op in cond) {
                    const value: any = (cond as any)[op]
                    const v = Array.isArray(value) ? value.join(',') : String(value)
                    params.set(`where[${key}][${op}]`, v)
                  }
                }
              } else if (cond !== undefined) {
                params.set(`where[${key}][equals]`, String(cond))
              }
            })
            const res = await fetch(`/api/custom-admin/${collection}?${params.toString()}`, {
              signal,
            })
            if (!res.ok) return []
            const data = await res.json()
            return (data?.docs || []).map((record: any) => ({
              ...record,
              collection,
              displayTitle: record.title || record.name || `Record ${record.id}`,
            })) as RelatedRecord[]
          })
          const results = await Promise.all(requests)
          if (!signal.aborted) setOptions(results.flat())
        } catch (_) {
          if (!signal.aborted) setOptions([])
        } finally {
          if (!signal.aborted) setLoading(false)
        }
        return
      }
      setLoading(true)
      setError('')
      try {
        const fo = field.filterOptions || {}
        const supportedOps = [
          'equals',
          'not_equals',
          'in',
          'not_in',
          'like',
          'greater_than',
          'less_than',
          'exists',
        ] as const

        const requests = collections.map(async (collection) => {
          // discover proper search keys using schema (with cache)
          let cache = schemaCacheRef.current[collection]
          if (!cache) {
            try {
              const schemaRes = await fetch(
                `/api/admin/${collection}?schema=true&locale=${locale}`,
                {
                  signal,
                },
              )
              if (schemaRes.ok) {
                const schemaJson = await schemaRes.json()
                const fieldNames = new Set<string>(
                  (schemaJson?.fields || []).map((f: any) => f.name),
                )
                cache = {
                  useAsTitle: schemaJson?.admin?.useAsTitle,
                  fieldNames,
                }
                schemaCacheRef.current[collection] = cache
              }
            } catch (_) {
              // ignore, will fallback below
            }
          }
          const valid = cache?.fieldNames || new Set<string>()
          let searchKeys: string[] = []
          if (cache?.useAsTitle && valid.has(String(cache.useAsTitle))) {
            searchKeys.push(String(cache.useAsTitle))
          }
          // add common fallbacks only if present in schema
          ;['title', 'name', 'display_name', 'slug'].forEach(
            (k) => valid.has(k) && searchKeys.push(k),
          )
          // include any text/textarea fields (from valid set we don't know type here; we approximate by presence)
          // since we don't have types in cache, rely on fieldNames from schema; that's okay
          // The earlier step already included all field names; limit to top 8 to avoid huge OR
          searchKeys = Array.from(new Set(searchKeys)).slice(0, 8)

          const params = new URLSearchParams()
          params.set('limit', '10')
          if (locale) params.set('locale', locale)
          // text search across resolved keys
          let idx = 0
          for (const key of searchKeys) {
            params.set(`where[or][${idx++}][${key}][like]`, debouncedTerm)
          }
          if (idx === 0) {
            // no valid searchable keys; skip querying this collection
            return []
          }
          // apply filters
          Object.entries(fo).forEach(([key, cond]) => {
            if (cond && typeof cond === 'object') {
              for (const op of supportedOps) {
                if (op in cond) {
                  const value: any = (cond as any)[op]
                  const v = Array.isArray(value) ? value.join(',') : String(value)
                  params.set(`where[${key}][${op}]`, v)
                }
              }
            } else if (cond !== undefined) {
              params.set(`where[${key}][equals]`, String(cond))
            }
          })
          const res = await fetch(`/api/custom-admin/${collection}?${params.toString()}`, {
            signal,
          })
          if (!res.ok) return []
          const data = await res.json()
          const records = (data?.docs || []).map((record: any) => ({
            ...record,
            collection,
            displayTitle: record.title || record.name || `Record ${record.id}`,
          }))
          return records as RelatedRecord[]
        })

        const results = await Promise.all(requests)
        if (!signal.aborted) setOptions(results.flat())
      } catch (_) {
        if (!signal.aborted) setOptions([])
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    fetchSearch()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm, collectionsKey])

  // Close typeahead on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (containerRef.current && !containerRef.current.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const handleChange = (selectedValue: string) => {
    if (!selectedValue) return

    const [collection, id] = selectedValue.split(':')
    const recordToToggle = { relationTo: collection, value: id }

    if (field.hasMany) {
      const currentValues = Array.isArray(value) ? value : []
      const isSelected = currentValues.some(
        (item) => item.relationTo === collection && item.value === id,
      )

      const newValues = isSelected
        ? currentValues.filter((item) => !(item.relationTo === collection && item.value === id))
        : [...currentValues, recordToToggle]
      onChange(newValues)
    } else {
      onChange(recordToToggle)
    }
  }

  const selectedRecords = useMemo(() => {
    if (!value) return []
    const selectedItems = field.hasMany ? (Array.isArray(value) ? value : []) : [value]
    const fallback = (item: any): RelatedRecord => ({
      id: item.value,
      title: String(item.value),
      name: String(item.value),
      collection: item.relationTo,
    })
    return selectedItems
      .map((item) => {
        if (!item || !item.value) return null
        const found = options.find(
          (o: any) => o.id === item.value && o.collection === item.relationTo,
        )
        return found || fallback(item)
      })
      .filter(Boolean) as RelatedRecord[]
  }, [value, options, field.hasMany])

  if (!field.relationTo || collections.length === 0) {
    return (
      <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
        Relationship field: {field.name} (no related collections configured)
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ color: '#dc2626', fontSize: '14px' }}>
        Error loading {field.label.toLowerCase()}: {error}
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Display selected records */}
      {selectedRecords.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            Selected {field.label.toLowerCase()}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {selectedRecords.map((record, index) => (
              <div
                key={`${record.collection}:${record.id}:${index}`}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{record.displayTitle}</span>
                <button
                  type="button"
                  onClick={() => handleChange(`${record.collection}:${record.id}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0',
                    marginLeft: '4px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Searchable selector */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={placeholder || `Search ${field.label.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: '#ffffff',
          }}
        />
        {open && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              marginTop: 6,
              maxHeight: 260,
              overflowY: 'auto',
              zIndex: 30,
              padding: 6,
            }}
          >
            {loading && (
              <div style={{ padding: 8, fontSize: 12, color: '#6b7280' }}>Searching...</div>
            )}
            {!loading && (!debouncedTerm || debouncedTerm.length < 2) && (
              <div style={{ padding: 8, fontSize: 12, color: '#6b7280' }}>
                Type at least 2 characters to search
              </div>
            )}
            {!loading && debouncedTerm.length >= 2 && options.length === 0 && (
              <div style={{ padding: 8, fontSize: 12, color: '#6b7280' }}>No results</div>
            )}
            {!loading &&
              options.map((option, index) => (
                <button
                  key={`${(option as any).collection}:${option.id}:${index}`}
                  type="button"
                  onClick={() => {
                    handleChange(`${(option as any).collection}:${option.id}`)
                    setOpen(false)
                    setSearchTerm('')
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                >
                  <div style={{ fontSize: 14, color: '#111827' }}>
                    {(option as any).displayTitle || option.title || option.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{(option as any).collection}</div>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Collection info */}
      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        Related to: {collections.join(', ')}
        {field.hasMany && ' (multiple selection allowed)'}
      </div>
    </div>
  )
}
