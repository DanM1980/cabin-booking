/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // הגדרת basePath לתת-ספרייה
  // שנה את '/cabin' לנתיב הרצוי שלך
  basePath: '/cabin',
  // תמיכה ב-static export אם צריך
  output: 'standalone',
}

module.exports = nextConfig

