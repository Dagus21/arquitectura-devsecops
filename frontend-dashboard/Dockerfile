# ========================================================================
# ETAPA 1: BUILDER - El Taller de Construcción
# ========================================================================
FROM oven/bun:1 AS builder

# 1. Recibimos la URL de la API como un argumento de construcción
ARG API_URL

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# 2. Reemplazamos el marcador de posición con la URL real
RUN sed -i "s|__API_URL__|${API_URL}|g" src/app/api-config.ts

# 3. Construimos la aplicación con la URL ya inyectada
RUN bun run build --base-href /


# ========================================================================
# ETAPA 2: RUNNER - El Servidor Final con Caddy
# ========================================================================
FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist/frontend-dashboard/browser /usr/share/caddy

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
