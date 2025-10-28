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
  basePath: '/beeri',
  // Static export ל-GitHub Pages
  output: 'export',
  images: {
    unoptimized: true, // נדרש ל-static export
  },
}

module.exports = nextConfig

