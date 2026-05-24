# 🛡️ Arquitectura DevSecOps y Zero-Trust para E-commerce

Este repositorio contiene la implementación técnica del proyecto de grado: **"Diseño, Implementación y Validación de una Arquitectura DevSecOps focalizada en el modelo de red Zero-Trust para Entornos de Comercio Electrónico en Pymes."**

## 🏗️ Topología de la Arquitectura
El proyecto no expone los servicios tradicionales a internet. Se basa en una arquitectura **Zero-Trust** que utiliza **Tailscale (VPN en malla)** para aislar la administración, y **Cloudflare (WAF)** para la seguridad perimetral.

- **Frontend E-commerce (Next.js):** Renderizado del lado del servidor (SSR) para SEO. Único servicio expuesto vía Cloudflare WAF.
- **Backend API (Spring Boot):** Lógica transaccional protegida, sin exposición pública.
- **Dashboard Admin (Angular):** Acceso exclusivo mediante túnel cifrado (Tailscale).
- **Infraestructura Base:** Servidor VPS Ubuntu, orquestado con **Dokploy** y **Traefik**.

## 🚀 Pipeline CI/CD (GitHub Actions)
El despliegue está completamente automatizado, garantizando entregas inmutables y sin tiempo de inactividad (Zero Downtime).

1. **Construcción:** Se generan imágenes de Docker optimizadas.
2. **Registro:** Las imágenes se almacenan en GitHub Container Registry (GHCR).
3. **Despliegue Seguro:** El runner de GitHub Actions se conecta a la VPN de la infraestructura (Tailscale) de forma efímera para forzar la actualización vía SSH y ejecutar Webhooks de reinicio.

## 📊 Pruebas de Carga y Resiliencia (k6)
La infraestructura fue sometida a rigurosas pruebas de carga utilizando **Grafana k6**, demostrando la eficacia del WAF ante ataques DDoS y validando los límites operativos del servidor.

- Los scripts de prueba y la configuración de los escenarios (Promedio, Pico, Quiebre y Seguridad) se encuentran en el directorio `/k6`.

## 📁 Estructura del Repositorio
- `/Backend` - API RESTful desarrollada en Spring Boot 3.5 y Java 21.
- `/frontend-ecommerce` - Aplicación cliente desarrollada en Next.js 16.
- `/frontend-dashboard` - Panel de administración interno desarrollado en Angular 20.
- `/k6` - Scripts de pruebas de rendimiento y estrés.
- `.github/workflows` - Definición del Pipeline de Despliegue Continuo.
- `infraestructura` - Carpeta donde se almacena el RUNBOOK.md y archivos relacionados.

---
*Desarrollado por **David Gustavo Medina Ardila** como parte integral del proyecto de grado para la Universidad de Pamplona.*