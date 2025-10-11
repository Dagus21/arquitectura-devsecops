# ========================================================================
# ETAPA 1: BUILDER - El Taller de Construcción
# Usamos la imagen oficial de Bun para compilar nuestro proyecto
# ========================================================================
FROM oven/bun:1 AS builder
# ¡AQUÍ! ¡ESTE ES EL LUGAR CORRECTO!
# 1. Declara que vamos a recibir un argumento de construcción
ARG NEXT_PUBLIC_API_URL
# 2. Conviértelo en una variable de entorno para que el build la pueda usar
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar el cache de Docker
COPY package.json bun.lock ./

# Instalamos las dependencias usando Bun (¡mucho más rápido que npm!)
RUN bun install

# Copiamos el resto del código fuente
COPY . .

# Ejecutamos el script de build usando Bun
# Esto creará la carpeta /app/out con nuestro sitio estático
RUN bun run build


# ========================================================================
# ETAPA 2: RUNNER - El Servidor Final
# Usamos una imagen súper ligera de Caddy para servir los archivos
# ========================================================================
FROM caddy:2-alpine

# Copiamos nuestro Caddyfile al lugar donde Caddy lo espera
COPY Caddyfile /etc/caddy/Caddyfile

# Copiamos los archivos compilados desde la etapa 'builder' a la carpeta
# que definimos como raíz en nuestro Caddyfile.
COPY --from=builder /app/out /usr/share/caddy

# Exponemos el puerto 80, que es donde Caddy escucha
EXPOSE 80

# Comando para iniciar el servidor Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
