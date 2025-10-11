# Dockerfile en la carpeta /frontend-dashboard

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

# 2. ¡CAMBIO CLAVE! Apuntamos sed a nuestro nuevo archivo de configuración.
RUN sed -i "s|__API_URL__|${API_URL}|g" src/app/api-config.ts

# 3. Construimos la aplicación con la URL ya inyectada
RUN bun run build --base-href /dashboard/


# ========================================================================
# ETAPA 2: RUNNER - El Servidor Final con Caddy
# ========================================================================
FROM caddy:2-alpine

# Copiamos nuestro Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copiamos los archivos compilados desde la ruta de salida específica de Angular
# a la carpeta raíz de Caddy. Esta parte no cambia.
COPY --from=builder /app/dist/frontend-dashboard/browser /usr/share/caddy

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos el servidor Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
