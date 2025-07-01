# API Key Authentication for Frontend Read Access

This document explains how to use API key authentication to read data from your PayloadCMS backend in your frontend application using environment variables.

## Overview

The API key authentication system allows your frontend application to securely read data from your PayloadCMS backend using a simple environment variable. No database setup required!

## Setup

### 1. Set Environment Variables

Add these environment variables to your PayloadCMS backend:

```bash
# .env.local or .env
API_KEY=your-secret-api-key-here
API_ALLOWED_COLLECTIONS=events,shops,attractions,promotions,homepage,media
```

**Environment Variables:**

- `API_KEY`: Your secret API key (can be any string you choose)
- `API_ALLOWED_COLLECTIONS`: Comma-separated list of collections to allow access to (use `*` for all collections)

### 2. API Key Format

You can use any string as your API key. For security, use a long, random string:

Example: `my-super-secret-api-key-2024` or `pk_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## Usage

### Authentication Methods

You can authenticate using either of these methods:

#### Method 1: Bearer Token (Recommended)

```http
Authorization: Bearer your-secret-api-key-here
```

#### Method 2: X-API-Key Header

```http
X-API-Key: your-secret-api-key-here
```

### API Endpoints

All read-only endpoints are available under `/api/authenticated/`:

- **GET** `/api/authenticated/events` - Get all events
- **GET** `/api/authenticated/events/[id]` - Get specific event
- **GET** `/api/authenticated/shops` - Get all shops
- **GET** `/api/authenticated/shops/[id]` - Get specific shop
- **GET** `/api/authenticated/attractions` - Get all attractions
- **GET** `/api/authenticated/promotions` - Get all promotions
- **GET** `/api/authenticated/media/[id]` - Get media file data

### Available Collections

- `events` - Events collection
- `shops` - Shops collection
- `dinings` - Dining collection
- `attractions` - Attractions collection
- `categories` - Categories collection
- `promotions` - Promotions collection
- `homepage` - Homepage collection
- `page-banners` - Page Banners collection
- `media` - Media collection

## Examples

### JavaScript/React

```javascript
// Using fetch with Bearer token
const fetchEvents = async () => {
  const response = await fetch('https://your-domain.com/api/authenticated/events', {
    headers: {
      Authorization: 'Bearer your-secret-api-key-here',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }

  return response.json()
}

// Usage in React component
const EventsList = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents(data.docs || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching events:', error)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  )
}
```

```javascript
// Using fetch with X-API-Key header
const fetchShops = async () => {
  const response = await fetch('https://your-domain.com/api/authenticated/shops', {
    headers: {
      'X-API-Key': 'your-secret-api-key-here',
      'Content-Type': 'application/json',
    },
  })

  return response.json()
}
```

### Environment Variables

Store your API key securely in environment variables:

```javascript
// .env.local
NEXT_PUBLIC_API_KEY=your-secret-api-key-here
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=https://your-cloudfront-domain.cloudfront.net

// Usage in your app
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const API_URL = process.env.NEXT_PUBLIC_API_URL

const fetchData = async (collection) => {
  const response = await fetch(`${API_URL}/api/authenticated/${collection}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  return response.json()
}
```

### Media Handling

For images and media files, use the media utilities:

```javascript
import { getImageUrl, getImageAlt, MediaImage } from '@/utilities/media'

// Get image URL (backend already returns CloudFront URLs)
const imageUrl = getImageUrl(mediaObject, 'en')

// Get alt text
const altText = getImageAlt(mediaObject, 'en')

// Use the MediaImage component (automatically handles CORS)
<MediaImage
  media={mediaObject}
  locale="en"
  className="w-full h-64 object-cover"
  alt="Event image"
/>
```

**Note:** The backend automatically returns CloudFront URLs when `CLOUDFRONT_DOMAIN` is configured, so no manual conversion is needed.

### cURL

```bash
# Get all events
curl -H "Authorization: Bearer your-secret-api-key-here" \
     https://your-domain.com/api/authenticated/events

# Get specific event
curl -H "Authorization: Bearer your-secret-api-key-here" \
     https://your-domain.com/api/authenticated/events/event-id-here

# Get media file data
curl -H "Authorization: Bearer your-secret-api-key-here" \
     https://your-domain.com/api/authenticated/media/media-id-here
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Invalid or missing API key"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied to this collection"
}
```

### 500 Internal Server Error

```json
{
  "error": "Authentication failed"
}
```

## Security Best Practices

1. **Use a strong API key**: Choose a long, random string
2. **Keep API keys secure**: Never expose API keys in client-side code or public repositories
3. **Use environment variables**: Store API keys in environment variables
4. **Limit collections**: Only grant access to collections your frontend needs
5. **Rotate keys regularly**: Change your API key periodically

## Frontend Integration Tips

### React Hook Example

```javascript
// hooks/useApiData.js
import { useState, useEffect } from 'react'

export const useApiData = (collection, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/authenticated/${collection}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collection])

  return { data, loading, error }
}

// Usage
const { data: events, loading, error } = useApiData('events')
```

### Next.js API Route (Optional)

If you want to proxy the requests through your Next.js app for additional security:

```javascript
// pages/api/cms/[collection].js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { collection } = req.query

  try {
    const response = await fetch(`${process.env.CMS_API_URL}/api/authenticated/${collection}`, {
      headers: {
        Authorization: `Bearer ${process.env.CMS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that your API key matches the environment variable
2. **403 Forbidden**: Verify that the collection is included in `API_ALLOWED_COLLECTIONS`
3. **404 Not Found**: Ensure you're using the correct collection name in the URL
4. **CORS Errors**: Make sure your frontend domain is allowed in the CORS configuration

### Debugging

Enable debug logging by setting the environment variable:

```bash
DEBUG=payload:*
```

## Support

For issues with API key authentication, check:

1. Environment variable configuration
2. Collection access settings in `API_ALLOWED_COLLECTIONS`
3. Network connectivity and CORS configuration
4. Server logs for detailed error messages
