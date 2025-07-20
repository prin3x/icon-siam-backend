// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { s3Storage } from '@payloadcms/storage-s3'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { PageBanners } from './collections/PageBanners'
import { Shops } from './collections/Shops'
import { Dinings } from './collections/Dinings'
import { Attractions } from './collections/Attractions'
import { IconCraft } from './collections/IconCraft'
import { IconLuxe } from './collections/IconLuxe'
import { GettingHere } from './collections/GettingHere'
import { Directory } from './collections/Directory'
import { Floors } from './collections/Floors'
import { Homepage } from './collections/Homepage'
import { Categories } from './collections/Categories'
import { GalleryCollections } from './collections/GalleryCollections'
import { Promotions } from './collections/Promotions'
import { Footers } from './collections/Footers'
import { Stickbar } from './collections/Stickbar'
import { NewsPress } from './collections/NewsPress'
import { Stories } from './collections/Stories'
import { ApiSyncLogs } from './collections/ApiSyncLogs'

export const useLocal = process.env.UPLOAD_STRATEGY === 'local'
export const isDev = process.env.NODE_ENV === 'development'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Admin configuration
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'app', '(payload)', 'admin'),
    },
    components: {
      afterLogin: ['@/components/SignInWithAzure'],
    },
  },

  // Server URL for both admin and API
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',

  collections: [
    Homepage,
    PageBanners,
    Events,
    Shops,
    Dinings,
    Attractions,
    IconCraft,
    IconLuxe,
    GettingHere,
    Directory,
    Floors,
    Users,
    Media,
    Categories,
    GalleryCollections,
    Promotions,
    Footers,
    Stickbar,
    NewsPress,
    Stories,
    ApiSyncLogs,
  ],

  // CORS configuration for frontend access
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_DOMAIN,
    process.env.ADMIN_DOMAIN,
  ].filter((url): url is string => Boolean(url)),

  // CSRF protection
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_DOMAIN,
    process.env.ADMIN_DOMAIN,
  ].filter((url): url is string => Boolean(url)),

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      host: process.env.DATABASE_URL,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DB_PASS,
      // ssl: process.env.DATABASE_SSL_MODE === 'true' ? { rejectUnauthorized: false } : undefined,
    },
  }),
  sharp,

  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
          generateFileURL: ({ filename }) => {
            const cloudFrontDomain =
              process.env.CLOUDFRONT_DOMAIN || 'https://your-cloudfront-domain.cloudfront.net'
            return `${cloudFrontDomain}/media/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
      },
    }),
  ],

  localization: {
    locales: [
      { code: 'th', label: 'Thai' },
      { code: 'en', label: 'English' },
      { code: 'zh', label: 'Chinese' },
    ],
    defaultLocale: 'en',
    fallback: false,
  },
})
