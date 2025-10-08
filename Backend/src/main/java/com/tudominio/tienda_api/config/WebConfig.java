package com.tudominio.tienda_api.config;

// --- EXPLICACIÓN DE LAS LIBRERÍAS (IMPORTS) ---
// La anotación @Bean declara que un método produce un bean gestionado por Spring.
import org.springframework.context.annotation.Bean;
// La anotación @Configuration indica que esta clase es una fuente de configuración para beans.
import org.springframework.context.annotation.Configuration;
// Permite el registro de reglas de CORS para rutas específicas.
import org.springframework.web.servlet.config.annotation.CorsRegistry;
// Interfaz que permite personalizar la configuración de Spring MVC (Model-View-Controller).
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/*
 * ========================================================================
 *              CLASE DE CONFIGURACIÓN WEB GLOBAL
 * ========================================================================
 */

@Configuration
public class WebConfig {

    /**
     * Define un Bean de tipo WebMvcConfigurer para configurar CORS de forma global.
     * Esta es la forma recomendada y más limpia de manejar CORS en Spring Boot.
     * @return Una nueva instancia de WebMvcConfigurer con las reglas CORS.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        // Devolvemos una implementación anónima de la interfaz WebMvcConfigurer.
        return new WebMvcConfigurer() {
            /**
             * Este método nos permite añadir y configurar las reglas de CORS.
             * @param registry El registro donde se configuran las políticas de CORS.
             */
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // --- Configuración de las Reglas CORS ---

                // `addMapping("/api/**")`: Aplica estas reglas a TODAS las rutas que comiencen con "/api/".
                // Esto asegura que solo nuestra API sea accesible y no otras partes internas de Spring.
                registry.addMapping("/api/**")

                        // `allowedOrigins(...)`: Especifica qué orígenes (frontends) tienen permiso
                        // para llamar a nuestra API. Es una lista blanca de dominios.
                        // Para desarrollo, permitimos los servidores locales de Next.js (puerto 3000) y Angular (puerto 4200).
                        // ¡IMPORTANTE! Para producción, debes cambiar esto a los dominios reales
                        // de tus frontends, ej: "https://mitienda.com", "https://dashboard.mitienda.com".
                        .allowedOrigins("http://localhost:3000", "http://localhost:4200","https://tienda.localhost","https://dashboard.localhost")

                        // `allowedMethods(...)`: Especifica qué métodos HTTP están permitidos
                        // desde los orígenes permitidos.
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")

                        // `allowedHeaders("*")`: Permite que el frontend envíe cualquier encabezado en la petición.
                        // Esto es crucial para que pueda enviar el encabezado "Authorization" con el token JWT.
                        .allowedHeaders("*")

                        // `allowCredentials(true)`: Permite que las peticiones incluyan credenciales
                        // (como cookies, encabezados de autorización, etc.). Necesario para la autenticación.
                        .allowCredentials(true);
            }
        };
    }
}