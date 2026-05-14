# ========================================================================
# ETAPA 1: EL "TALLER DE CONSTRUCCIÓN" (BUILDER)
# Usamos una imagen completa del JDK para compilar nuestro proyecto.
# ========================================================================
FROM eclipse-temurin:21-jdk-jammy AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el wrapper de Maven y el pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Descargamos las dependencias de Maven (este paso se cachea si el pom.xml no cambia)
RUN ./mvnw dependency:go-offline

# Copiamos el resto del código fuente de la aplicación
COPY src ./src

# Compilamos la aplicación y la empaquetamos en un .jar, saltando las pruebas
RUN ./mvnw package -DskipTests

# ========================================================================
# ETAPA 2: LA "CAJA DE ENVÍO" FINAL (RUNNER)
# Usamos una imagen mucho más pequeña, solo con el entorno de ejecución de Java (JRE).
# ========================================================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copiamos ÚNICAMENTE el archivo .jar compilado desde la etapa 'builder'
COPY --from=builder /app/target/*.jar app.jar

# ========================================================================
# HARDENING DE SEGURIDAD: PRINCIPIO DE MENOR PRIVILEGIO (No-Root)
# ========================================================================
# Por defecto, Docker ejecuta los procesos como 'root' (administrador total).
# Si un atacante logra inyectar código (RCE) en Java, tomaría control del contenedor.
# Para evitarlo, creamos un usuario fantasma de sistema llamado 'spring' sin privilegios.
RUN addgroup --system spring && adduser --system --ingroup spring spring

# Le transferimos la propiedad del archivo ejecutable al nuevo usuario 'spring'
RUN chown spring:spring app.jar

# Instruimos al motor de Docker a que cambie de 'root' a 'spring' a partir de esta línea
USER spring:spring
# ========================================================================

# Exponemos el puerto 8080 para que el contenedor pueda recibir tráfico
EXPOSE 8080

# El comando final que se ejecutará cuando el contenedor arranque (ahora de forma segura)
CMD ["java", "-jar", "app.jar"]