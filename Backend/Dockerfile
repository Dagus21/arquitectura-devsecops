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

# Exponemos el puerto 8080 para que el contenedor pueda recibir tráfico
EXPOSE 8080

# El comando final que se ejecutará cuando el contenedor arranque
CMD ["java", "-jar", "app.jar"]