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
  ],

  // CORS configuration for frontend access
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.FRONTEND_DOMAIN || 'onesiam.com',
    process.env.ADMIN_DOMAIN || 'admin.onesiam.com',
  ],

  // CSRF protection
  csrf: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.FRONTEND_DOMAIN || 'onesiam.com',
    process.env.ADMIN_DOMAIN || 'admin.onesiam.com',
  ],

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      ssl:
        process.env.DATABASE_SSL_MODE === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    },
  }),

  sharp,

  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
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
    defaultLocale: 'th',
    fallback: false,
  },
})
