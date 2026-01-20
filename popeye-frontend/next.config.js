const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ▼ 빌드 시 ESLint 및 타입스크립트 에러 무시 설정 추가
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://db:8080/api/:path*', // 로컬 개발 환경에서 백엔드로 프록시
      },
    ];
  },
  env: {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
  },
}

module.exports = nextConfig

