import { NextRequest, NextResponse } from 'next/server'
import { getPayload, Where } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import qs from 'qs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params
  const { searchParams } = new URL(request.url)
  const query = qs.parse(searchParams.toString(), { depth: 10 })

  try {
    const payload = await getPayload({
      config: configPromise,
    })

    // Authenticate the user
    const { user } = await getMeUser({
      cookieStore: request.cookies,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build a set/map of select-type field names and their allowed options for this collection
    const collectionConfig = payload.config.collections.find((c) => c.slug === collection)
    const selectFieldNames = new Set<string>()
    const selectAllowedValues: Record<string, Set<string>> = {}
    const selectAllowedLabels: Record<string, Set<string>> = {}
    const selectLabelToValue: Record<string, Record<string, string>> = {}
    if (collectionConfig && Array.isArray((collectionConfig as any).fields)) {
      for (const f of (collectionConfig as any).fields) {
        if (f && typeof f === 'object' && f.type === 'select' && typeof f.name === 'string') {
          selectFieldNames.add(f.name)
          const values = new Set<string>()
          const labels = new Set<string>()
          const labelToValue: Record<string, string> = {}
          if (Array.isArray(f.options)) {
            for (const opt of f.options) {
              if (opt && typeof opt === 'object') {
                if (typeof opt.value !== 'undefined') {
                  const v = String(opt.value)
                  values.add(v)
                }
                if (typeof opt.label !== 'undefined') {
                  const l = String(opt.label)
                  labels.add(l.toLowerCase())
                  if (typeof opt.value !== 'undefined') {
                    labelToValue[l.toLowerCase()] = String(opt.value)
                  }
                }
              }
            }
          }
          selectAllowedValues[f.name] = values
          selectAllowedLabels[f.name] = labels
          selectLabelToValue[f.name] = labelToValue
        }
      }
    }

    // Sanitize incoming where to avoid unsupported operators on select fields
    const sanitizeWhere = (input: any): any => {
      if (!input || typeof input !== 'object') return input
      const out: any = Array.isArray(input) ? [] : {}
      if (Array.isArray(input)) {
        for (const child of input) {
          const sanitizedChild = sanitizeWhere(child)
          if (
            sanitizedChild &&
            typeof sanitizedChild === 'object' &&
            Object.keys(sanitizedChild).length > 0
          ) {
            out.push(sanitizedChild)
          }
        }
        return out
      }

      for (const [key, value] of Object.entries(input)) {
        if (key === 'or' || key === 'and') {
          const sanitizedChildren = Array.isArray(value) ? sanitizeWhere(value) : value
          if (Array.isArray(sanitizedChildren) && sanitizedChildren.length > 0) {
            out[key] = sanitizedChildren
          }
          continue
        }
        if (value && typeof value === 'object') {
          const fieldName = key
          const operators: any = {}
          for (const [op, opVal] of Object.entries(value)) {
            if (selectFieldNames.has(fieldName)) {
              const allowedValues = selectAllowedValues[fieldName] ?? new Set<string>()
              const allowedLabels = selectAllowedLabels[fieldName] ?? new Set<string>()
              const labelToValue = selectLabelToValue[fieldName] ?? {}
              if (op === 'like') {
                const term = String(opVal).toLowerCase()
                const matches = new Set<string>()
                // match by value substring
                for (const v of allowedValues) {
                  if (v.toLowerCase().includes(term)) matches.add(v)
                }
                // match by label substring
                for (const [l, v] of Object.entries(labelToValue)) {
                  if (l.includes(term)) matches.add(v)
                }
                if (matches.size > 0) {
                  operators['in'] = Array.from(matches)
                }
                continue
              }
              if (op === 'equals') {
                const valStr = String(opVal)
                if (allowedValues.has(valStr)) {
                  operators['equals'] = valStr
                } else if (allowedLabels.has(valStr.toLowerCase())) {
                  const mapped = labelToValue[valStr.toLowerCase()]
                  if (mapped) operators['equals'] = mapped
                } else {
                  // try partial match -> convert to IN
                  const term = valStr.toLowerCase()
                  const matches = new Set<string>()
                  for (const v of allowedValues) {
                    if (v.toLowerCase().includes(term)) matches.add(v)
                  }
                  for (const [l, v] of Object.entries(labelToValue)) {
                    if (l.includes(term)) matches.add(v)
                  }
                  if (matches.size > 0) {
                    operators['in'] = Array.from(matches)
                  }
                }
                continue
              }
            }
            // Non-select or other operators
            operators[op] = opVal
          }
          if (Object.keys(operators).length > 0) {
            out[fieldName] = operators
          }
        } else {
          out[key] = value
        }
      }
      return out
    }

    const sanitizedWhere = sanitizeWhere((query.where as any) ?? undefined)

    const isEmptyWhere = (w: any): boolean => {
      if (!w) return true
      if (Array.isArray(w)) return w.length === 0
      if (typeof w !== 'object') return false
      const keys = Object.keys(w)
      if (keys.length === 0) return true
      // If all nested values are empty, treat as empty
      return keys.every((k) => isEmptyWhere(w[k]))
    }

    const effectiveWhere = isEmptyWhere(sanitizedWhere) ? undefined : (sanitizedWhere as Where)

    // Find the documents
    const results = await payload.find({
      collection: collection as any,
      where: effectiveWhere,
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      sort: (query.sort as string) || '-createdAt',
      user,
      locale: query.locale as 'en' | 'th' | 'zh' | 'all' | undefined,
    })

    const response = NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })

    return response
  } catch (error: any) {
    console.error(`Error fetching documents from collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch documents: ${error.message}` },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params

  try {
    const payload = await getPayload({
      config: configPromise,
    })

    // Authenticate the user
    const { user } = await getMeUser({
      cookieStore: request.cookies,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    // Create the document
    const newDoc = await payload.create({
      collection: collection as any,
      data: body,
      user,
    })

    const response = NextResponse.json(newDoc, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    return response
  } catch (error: any) {
    console.error(`Error creating document in collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to create document: ${error.message}` },
      { status: 500 },
    )
  }
}
