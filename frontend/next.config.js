/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  env: {
    NEXT_NODE_PUBLIC_BASE_API_URL: process.env.NEXT_NODE_PUBLIC_BASE_API_URL
  }
}

module.exports = nextConfig;