import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CAMBIO CRÍTICO: 'standalone' es necesario para SSR con Docker optimizado
  output: 'standalone', 
  
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
};

export default nextConfig;