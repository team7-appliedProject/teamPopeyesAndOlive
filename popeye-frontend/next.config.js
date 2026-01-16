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
}

module.exports = nextConfig

