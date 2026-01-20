import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.miscelaneasdavid.shop', // Tu MinIO real en la nube
        port: '',
        pathname: '/productos-imagenes/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // --- CONFIGURACIÓN CSP FINAL ---
            // connect-src: Agregamos http://localhost:8080 para que puedas trabajar en local.
            // img-src: Solo permitimos tu dominio S3 real.
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://s3.miscelaneasdavid.shop; font-src 'self'; connect-src 'self' https://miscelaneasdavid.shop https://cloudflareinsights.com http://localhost:8080;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;