# ========================================================================
# ETAPA 1: BUILDER - Construcción
# ========================================================================
FROM oven/bun:1 AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# IMPORTANTE: Esto requiere que en next.config.ts tengas output: 'standalone'
RUN bun run build

# ========================================================================
# ETAPA 2: RUNNER - Servidor Dinámico (SSR)
# Usamos Bun para ejecutar el servidor de Next.js
# ========================================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Requerido para que el servidor sepa dónde está la API en tiempo de ejecución
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copiamos solo lo necesario para ejecutar (Standalone mode)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# ========================================================================
# HARDENING DE SEGURIDAD: PRINCIPIO DE MENOR PRIVILEGIO (No-Root)
# ========================================================================
# La imagen base de Bun en Alpine ya trae un usuario seguro llamado 'bun'.
# Next.js en producción necesita permisos de escritura en la carpeta '/app' 
# (específicamente en .next/cache) para optimizar imágenes y rutas.
# Por lo tanto, le damos la propiedad de toda la carpeta a este usuario seguro.
RUN chown -R bun:bun /app

# Instruimos a Docker que abandone el modo 'root' y use el usuario limitado
USER bun
# ========================================================================

# Next.js en modo standalone escucha en el 3000 por defecto
EXPOSE 3000

# Arrancamos el servidor (ahora de forma segura)
CMD ["bun", "run", "server.js"]