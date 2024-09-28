const locales = require('../config/data/locales.config.json');


const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
  env: {
    cloudname: process.env.CLOUD_NAME,
    cloudkey: process.env.CLOUD_API_KEY,
    cloudsecret: process.env.CLOUD_API_SECRET,
    serversecret: process.env.SERVER_SECRET,
    serverhost: process.env.SERVER_HOST,
    meta_pixel: process.env.META_PIXEL
  },
  i18n: {
    locales: locales.locales.map(locale => locale.ext),
    defaultLocale: locales.defaultLocale,
    localeDetection: true
  },
  distDir: "../.next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
    dangerouslyAllowSVG: true,
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig