import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false, // <--- AGREGAR ESTO (Oculta "X-Powered-By: Next.js")
  productionBrowserSourceMaps: false, // <--- AGREGAR ESTO (Oculta tu código fuente)

   // 🔥 NUEVO: Elimina TODOS los console.log en producción automáticamente.
  // Así, si se te olvidó un console.log(user_data) en el código, el cliente no lo verá.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error"], // Deja los console.error por si necesitas debugear algo crítico
    } : false,
  },
  
  allowedDevOrigins:[
    "desktop-vaf4ep9-1.taila142d4.ts.net:10000",
    "desktop-vaf4ep9-1.taila142d4.ts.net"
  ],

  // ==============================================================
  // CONFIGURACIÓN BFF (PROXY INVERSO DE NEXT.JS)
  // Oculta la URL del Backend (Spring Boot) del navegador del cliente
  // ==============================================================
  async rewrites() {
    return[
      {
        // Cuando el frontend llame a "/api-proxy/auth/login"...
        source: '/api-proxy/:path*',
        // ...Next.js reenvía la petición al servidor real en secreto
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, 
      },
      {
        // 2. Proxy para las Imágenes (MinIO S3) - ¡NUEVO!
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
            // 🔥 AQUÍ ESTÁ EL CSP ACTUALIZADO Y LIMPIO 🔥
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com https://http2.mlstatic.com https://*.mercadopago.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://s3.miscelaneasdavid.shop https://http2.mlstatic.com; font-src 'self'; connect-src 'self' https://miscelaneasdavid.shop https://cloudflareinsights.com https://*.mercadopago.com https://*.mercadolibre.com; frame-src 'self' https://*.mercadopago.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;