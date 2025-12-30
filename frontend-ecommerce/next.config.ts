import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Recuerda mantener tu config de SSR
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.miscelaneasdavid.shop',
        port: '',
        pathname: '/productos-imagenes/**',
      },
    ],
  },

  // === AQUÍ AGREGAMOS LA SEGURIDAD ===
  async headers() {
    return [
      {
        // Aplica estas reglas a TODAS las rutas del sitio
        source: '/(.*)',
        headers: [
          {
            // HSTS: Obliga a usar HTTPS por 2 años (63072000 seg)
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Evita que te metan en un iframe (Clickjacking)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Evita que el navegador ejecute archivos disfrazados
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Protege la privacidad al salir de tu web
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Bloquea el uso de cámara/microfono si no los usas (Privacidad)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ];
  },
};

export default nextConfig;