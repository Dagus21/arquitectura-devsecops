import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false, // Oculta "X-Powered-By: Next.js"
  productionBrowserSourceMaps: false, // Oculta tu código fuente

  // Elimina TODOS los console.log en producción automáticamente.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error"],
    } : false,
  },
  
  allowedDevOrigins:[
    "desktop-vaf4ep9-1.taila142d4.ts.net:10000",
    "desktop-vaf4ep9-1.taila142d4.ts.net"
  ],

  // ==============================================================
  // CONFIGURACIÓN API GATEWAY (BFF - Backend For Frontend)
  // ==============================================================
  async rewrites() {
    return [
      {
        // 1. Proxy interno: Cuando el cliente de Next.js llame a /api-proxy
        source: '/api-proxy/:path*',
        destination: 'http://backend-compose:8080/api/:path*', 
      },
      {
        // 2. ENRUTADOR MÁGICO: Todo lo que el Dashboard (Angular) mande a miscelaneasdavid.shop/api
        // Next.js lo intercepta y se lo pasa directo a Spring Boot por la red interna de Docker.
        source: '/api/:path*',
        destination: 'http://backend-compose:8080/api/:path*',
      },
      {
        // 3. Proxy para las Imágenes (MinIO S3)
        source: '/media-proxy/:path*',
        destination: 'https://s3.miscelaneasdavid.shop/productos-imagenes/:path*',
      }
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers:[
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            // CSP ACTUALIZADO Y LIMPIO
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com https://http2.mlstatic.com https://*.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://s3.miscelaneasdavid.shop https://http2.mlstatic.com; font-src 'self'; connect-src 'self' https://miscelaneasdavid.shop https://cloudflareinsights.com https://*.mercadopago.com https://*.mercadolibre.com; frame-src 'self' https://*.mercadopago.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;