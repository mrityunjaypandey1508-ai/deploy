/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['localhost'],
    unoptimized: true
  },

}

module.exports = nextConfig


