const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.dev') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // 로컬 개발 환경에서 백엔드로 프록시
      },
    ];
  },
  env: {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
  },
}

module.exports = nextConfig

