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
  // Cache selected option labels so chips render titles immediately
  const selectedCacheRef = useRef<Record<string, RelatedRecord>>({})

  // Small constants and helpers
  const MIN_SEARCH_LEN = 2

  const normalizePair = (item: any): { collection: string; id: string } | null => {
    if (!item) return null
    if (typeof item === 'string' || typeof item === 'number') {
      const firstCollection = Array.isArray(field.relationTo)
        ? field.relationTo[0]
        : (field.relationTo as string)
      return { collection: firstCollection, id: String(item) }
    }
    if (typeof item === 'object' && 'value' in item && 'relationTo' in item) {
      return { collection: (item as any).relationTo, id: String((item as any).value) }
    }
    if (typeof item === 'object' && 'id' in item) {
      return {
        collection:
          (item as any).collection ||
          (Array.isArray(field.relationTo) ? field.relationTo[0] : (field.relationTo as string)),
        id: String((item as any).id),
      }
    }
    return null
  }

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
      if (!debouncedTerm || debouncedTerm.length < MIN_SEARCH_LEN || collections.length === 0) {
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

  const toKey = (item: any): string => {
    if (!item) return ''
    const collection = (() => {
      if (typeof item === 'object' && 'relationTo' in item) return String((item as any).relationTo)
      return Array.isArray(field.relationTo)
        ? String(field.relationTo[0])
        : String(field.relationTo || '')
    })()
    const id = (() => {
      if (typeof item === 'string' || typeof item === 'number') return String(item)
      if (typeof item === 'object' && 'value' in item) return String((item as any).value)
      if (typeof item === 'object' && 'id' in item) return String((item as any).id)
      return ''
    })()
    return `${collection}:${id}`
  }

  const handleChange = (selectedValue: string) => {
    if (!selectedValue) return

    const [collection, id] = selectedValue.split(':')
    const recordToToggle = { relationTo: collection, value: id }

    if (field.hasMany) {
      const currentValues = Array.isArray(value) ? value : []
      const selectedKey = `${collection}:${id}`
      const isSelected = currentValues.some((item) => toKey(item) === selectedKey)

      const newValues = isSelected
        ? currentValues.filter((item) => toKey(item) !== selectedKey)
        : [...currentValues, recordToToggle]
      onChange(newValues)
    } else {
      onChange(recordToToggle)
    }
  }

  const selectedRecords = useMemo(() => {
    if (!value) return []
    const selectedItemsRaw = field.hasMany ? (Array.isArray(value) ? value : []) : [value]

    // Normalize possible shapes: id string, populated doc, or { relationTo, value }
    const normalizeItem = (
      item: any,
    ): {
      collection: string
      id: string
      displayTitle: string
      title: string
      name: string
    } | null => {
      if (!item) return null
      if (typeof item === 'string' || typeof item === 'number') {
        // single-collection relation; infer collection when listing - we'll search in options only by id
        const firstCollection = Array.isArray(field.relationTo)
          ? field.relationTo[0]
          : (field.relationTo as string)
        const doc = options.find(
          (o: any) => o.id === String(item) && o.collection === firstCollection,
        )

        return {
          collection: firstCollection,
          id: String(item),
          displayTitle: String(doc?.displayTitle || item),
          title: String(doc?.title || item),
          name: String(doc?.name || item),
        }
      }
      if (typeof item === 'object' && 'value' in item && 'relationTo' in item) {
        return {
          collection: (item as any).relationTo,
          id: String((item as any).value),
          displayTitle: String((item as any).value || (item as any).name || (item as any).id),
          title: String((item as any).value || (item as any).name || (item as any).id),
          name: String((item as any).value || (item as any).name || (item as any).id),
        }
      }
      if (typeof item === 'object' && 'id' in item) {
        return {
          collection:
            (item as any).collection ||
            (Array.isArray(field.relationTo) ? field.relationTo[0] : (field.relationTo as string)),
          id: String((item as any).id),
          displayTitle: String((item as any).value || (item as any).name || (item as any).id),
          title: String((item as any).value || (item as any).name || (item as any).id),
          name: String((item as any).value || (item as any).name || (item as any).id),
        }
      }
      return null
    }

    const selectedItems = selectedItemsRaw.map(normalizeItem).filter(Boolean) as Array<{
      collection: string
      id: string
      displayTitle: string
      title: string
      name: string
    }>

    const fallback = (norm: {
      collection: string
      id: string
      displayTitle: string
      title: string
      name: string
    }): RelatedRecord =>
      ({
        id: norm.id,
        title: String(norm.title),
        name: String(norm.name),
        collection: norm.collection,
        displayTitle: String(norm.displayTitle),
      }) as any

    return selectedItems
      .map((norm) => {
        const key = `${norm.collection}:${norm.id}`
        const cached = selectedCacheRef.current[key]
        const found = options.find(
          (o: any) => String(o.id) === String(norm.id) && o.collection === norm.collection,
        )
        return (cached as any) || (found as any) || fallback(norm)
      })
      .filter(Boolean) as RelatedRecord[]
  }, [value, options, field.hasMany, field.relationTo])

  // Ensure labels for already-selected items by fetching their documents
  useEffect(() => {
    if (!Array.isArray(collections) || collections.length === 0) return
    const controller = new AbortController()
    const signal = controller.signal

    const selectedItemsRaw = field.hasMany
      ? Array.isArray(value)
        ? value
        : []
      : value
        ? [value]
        : []
    if (selectedItemsRaw.length === 0) return

    const normalize = (
      item: any,
    ): {
      collection: string
      id: string
      displayTitle: string
      title: string
      name: string
    } | null => {
      if (!item) return null
      if (typeof item === 'string' || typeof item === 'number') {
        const firstCollection = Array.isArray(field.relationTo)
          ? field.relationTo[0]
          : (field.relationTo as string)
        const doc = options.find(
          (o: any) => o.id === String(item) && o.collection === firstCollection,
        )
        return {
          collection: firstCollection,
          id: String(item),
          displayTitle: String(doc?.displayTitle || doc?.title || doc?.name),
          title: String(doc?.title || item),
          name: String(doc?.name || item),
        }
      }
      if (typeof item === 'object' && 'value' in item && 'relationTo' in item) {
        return {
          collection: (item as any).relationTo,
          id: String((item as any).value),
          displayTitle: String(item.value || item.name || item.id),
          title: String(item.value || item.name || item.id),
          name: String(item.value || item.name || item.id),
        }
      }
      if (typeof item === 'object' && 'id' in item) {
        return {
          collection:
            (item as any).collection ||
            (Array.isArray(field.relationTo) ? field.relationTo[0] : (field.relationTo as string)),
          id: String((item as any).id),
          displayTitle: String(item.value || item.name || item.id),
          title: String(item.value || item.name || item.id),
          name: String(item.value || item.name || item.id),
        }
      }
      return null
    }

    const normalized = (field.hasMany ? selectedItemsRaw : [selectedItemsRaw])
      .map(normalize)
      .filter(Boolean) as Array<{
      collection: string
      id: string
      displayTitle: string
      title: string
      name: string
    }>

    // Determine which selected items are missing from options
    const missingByCollection = new Map<string, Set<string>>()
    normalized.forEach(({ collection, id }) => {
      const exists = options.some(
        (o: any) => String(o.id) === String(id) && (o as any).collection === collection,
      )
      if (!exists) {
        if (!missingByCollection.has(collection)) missingByCollection.set(collection, new Set())
        missingByCollection.get(collection)!.add(id)
      }
    })

    if (missingByCollection.size === 0) return
    ;(async () => {
      try {
        const requests: Promise<RelatedRecord[]>[] = []
        missingByCollection.forEach((ids, collection) => {
          const params = new URLSearchParams()
          params.set('limit', String(ids.size))
          if (locale) params.set('locale', locale)
          params.set(`where[id][in]`, Array.from(ids).join(','))
          requests.push(
            fetch(`/api/custom-admin/${collection}?${params.toString()}`, { signal })
              .then((r) => (r.ok ? r.json() : null))
              .then(
                (json) =>
                  (json?.docs || []).map((record: any) => ({
                    ...record,
                    collection,
                    displayTitle: record.title || record.name || `Record ${record.id}`,
                  })) as RelatedRecord[],
              ) as any,
          )
        })
        const results = (await Promise.all(requests)).flat()
        if (!signal.aborted && results.length > 0) {
          setOptions((prev) => {
            const seen = new Set(prev.map((p: any) => `${(p as any).collection}:${p.id}`))
            const merged = [...prev]
            results.forEach((r: any) => {
              const key = `${(r as any).collection}:${r.id}`
              if (!seen.has(key)) {
                seen.add(key)
                merged.push(r)
              }
            })
            return merged
          })
        }
      } catch (_) {
        // ignore fetch errors
      }
    })()

    return () => controller.abort()
  }, [value, field.hasMany, field.relationTo, collectionsKey, locale, options])

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
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '9999px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#1e40af' }}>
                  {record.displayTitle ||
                    (record as any).title ||
                    (record as any).name ||
                    String(record.id)}
                </span>
                <button
                  type="button"
                  onClick={() => handleChange(`${record.collection}:${record.id}`)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0 2px',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1d4ed8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#2563eb'
                  }}
                  aria-label={`Remove ${record.displayTitle || (record as any).title || (record as any).name || String(record.id)}`}
                  title="Remove"
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
            {!loading && (!debouncedTerm || debouncedTerm.length < MIN_SEARCH_LEN) && (
              <div style={{ padding: 8, fontSize: 12, color: '#6b7280' }}>
                Type at least {MIN_SEARCH_LEN} characters to search
              </div>
            )}
            {!loading && debouncedTerm.length >= MIN_SEARCH_LEN && options.length === 0 && (
              <div style={{ padding: 8, fontSize: 12, color: '#6b7280' }}>No results</div>
            )}
            {!loading &&
              // Hide options already selected
              options
                .filter((option) => {
                  const key = `${(option as any).collection}:${String(option.id)}`
                  const current = field.hasMany ? (Array.isArray(value) ? value : []) : [value]
                  return !current.some((item) => toKey(item) === key)
                })
                .map((option, index) => (
                  <button
                    key={`${(option as any).collection}:${option.id}:${index}`}
                    type="button"
                    onClick={() => {
                      // Cache selected option label to show chip immediately
                      selectedCacheRef.current[
                        `${(option as any).collection}:${String(option.id)}`
                      ] = option as any
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
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {(option as any).collection}
                    </div>
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
