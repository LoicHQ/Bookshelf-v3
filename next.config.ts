import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration des images externes (couvertures de livres)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'covers.librarything.com',
      },
      {
        protocol: 'https',
        hostname: 'images.isbndb.com',
      },
    ],
  },
};

export default nextConfig;
