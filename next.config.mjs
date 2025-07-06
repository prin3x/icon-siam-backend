import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      }),
    )
    return config
  },
  // Your Next.js config here
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  // Enable detailed error messages in development
  onError: (err) => {
    console.error('Next.js build error:', err)
  },
  // Show detailed error messages
  reactStrictMode: true,
  // Disable error message obfuscation
  productionBrowserSourceMaps: true,
  // Add headers for video streaming
  async headers() {
    return [
      {
        source: '/api/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Accept-Ranges', value: 'bytes' },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Range',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=60, s-maxage=300' }],
      },
      {
        source: '/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
