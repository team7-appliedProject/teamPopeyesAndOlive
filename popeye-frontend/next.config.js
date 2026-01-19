const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.dev') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
  },
}

module.exports = nextConfig

