import { Media } from '@/payload-types'

export const getMediaUrl = (media: number | Media | null | undefined): string => {
  if (!media) return null as unknown as string
  if (typeof media === 'number') return null as unknown as string

  const url = media.url || (null as unknown as string)
  if (!url || url?.trim().length === 0) return null as unknown as string

  // If CloudFront domain is configured, use it instead of the direct S3 URL
  if (process.env.CLOUDFRONT_DOMAIN) {
    const filename = url.split('/').pop()
    return `${process.env.CLOUDFRONT_DOMAIN}/media/${filename}`
  }

  return url
}

export const getMediaAlt = (media: number | Media | null | undefined): string => {
  if (!media) return ''
  if (typeof media === 'number') return ''
  // TODO: Waiting Integrate with multiple language
  return media.alt?.en || ''
}
