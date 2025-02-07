/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig 