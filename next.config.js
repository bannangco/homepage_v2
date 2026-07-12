const announcements = require('./data/announcements.json')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Next 15.5 rejects an exported dynamic route when generateStaticParams()
  // returns no paths. Register the ready detail shell only when real data exists.
  pageExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    ...(announcements.length > 0 ? ['announcement.tsx'] : []),
  ],
  poweredByHeader: false,
  trailingSlash: false,
  distDir: '.next',
  basePath: '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
