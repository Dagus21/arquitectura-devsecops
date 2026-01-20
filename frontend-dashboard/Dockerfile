# ========================================================================
# ETAPA 1: BUILDER - El Taller de Construcción
# ========================================================================
FROM oven/bun:1 AS builder

# 1. Recibimos la URL de la API como argumento desde Dokploy
ARG API_URL

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# 2. CORRECCIÓN: Apuntamos a la nueva ruta en 'core/config'
# Reemplaza __API_URL__ por la variable de entorno real
RUN sed -i "s|__API_URL__|${API_URL}|g" src/app/core/config/api.config.ts

# 3. Construimos la aplicación
RUN bun run build --base-href /

# ========================================================================
# ETAPA 2: RUNNER - El Servidor Final con Caddy
# ========================================================================
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile

# Asegúrate de que el nombre 'frontend-dashboard' coincida con el de tu angular.json
COPY --from=builder /app/dist/frontend-dashboard/browser /usr/share/caddy

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]