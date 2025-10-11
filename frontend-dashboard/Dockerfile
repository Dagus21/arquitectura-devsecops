# ========================================================================
# ETAPA 1: BUILDER - El Taller de Construcción
# ========================================================================
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Ejecutamos el script de build de Angular con Bun.
# Por defecto, Angular compila los archivos de producción en:
# /app/dist/frontend-dashboard/browser
RUN bun run build


# ========================================================================
# ETAPA 2: RUNNER - El Servidor Final con Caddy
# ========================================================================
FROM caddy:2-alpine

# Copiamos nuestro Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# ¡LA LÍNEA CLAVE! Copiamos los archivos compilados desde la ruta
# de salida específica de Angular a la carpeta raíz de Caddy.
COPY --from=builder /app/dist/frontend-dashboard/browser /usr/share/caddy

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos el servidor Caddy