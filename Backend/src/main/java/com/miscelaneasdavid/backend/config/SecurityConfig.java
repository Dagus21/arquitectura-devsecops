package com.miscelaneasdavid.backend.config;

import com.miscelaneasdavid.backend.config.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * =================================================================================
 * ARQUITECTURA DE SEGURIDAD (SECURITY CONFIG)
 * =================================================================================
 * Esta clase actúa como el "Portero Digital" de la aplicación.
 * Utiliza Spring Security 6+ con una configuración basada en componentes (Beans)
 * y expresiones Lambda (DSL) para definir las reglas de autenticación y autorización.
 *
 * ESTRATEGIA: Stateless (Sin estado) con Tokens JWT transportados en Cookies HttpOnly.
 */
@Configuration // Indica a Spring que esta clase contiene definiciones de Beans.
@EnableWebSecurity // Habilita la seguridad web y permite personalizar el filtro de peticiones HTTP.
@RequiredArgsConstructor // Lombok: Inyecta automáticamente los campos 'final' (Dependency Injection).
public class SecurityConfig {

    // Inyectamos nuestro filtro personalizado que valida si la petición trae una Cookie/Token válido.
    private final JwtAuthFilter jwtAuthFilter;

    /**
     * CADENA DE FILTROS DE SEGURIDAD (Security Filter Chain)
     * Define el orden y las reglas que debe atravesar CADA petición HTTP que llega al servidor.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. GESTIÓN DE CORS (Cross-Origin Resource Sharing)
            // Permite que dominios externos (Angular, Next.js) consuman esta API.
            // Busca automáticamente el Bean 'corsConfigurationSource' definido más abajo.
            .cors(Customizer.withDefaults())

            // 2. DESACTIVACIÓN DE CSRF (Cross-Site Request Forgery)
            // En arquitecturas REST Stateless modernas, el manejo de CSRF tradicional
            // suele desactivarse, ya que la validación se delega al manejo estricto de CORS
            // y al uso de Cookies SameSite.
            .csrf(csrf -> csrf.disable())

            // 3. CABECERAS DE SEGURIDAD (OWASP Security Headers)
            // Hardening del servidor para proteger al cliente contra ataques comunes.
            .headers(headers -> headers
                // Anti-Clickjacking: Prohíbe cargar la web en un <iframe> ajeno.
                .frameOptions(frame -> frame.deny())
                
                // Protección XSS: Desactivamos el filtro legacy del navegador para
                // confiar plenamente en la Política de Seguridad de Contenido (CSP).
                .xssProtection(xss -> xss.disable())
                
                // CSP (Content Security Policy): Lista blanca de orígenes.
                // Define qué scripts, imágenes o estilos pueden ejecutarse en el navegador.
                // Aquí autorizamos explícitamente a nuestro Bucket S3 (MinIO) para las imágenes.
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; img-src 'self' https://s3.miscelaneasdavid.shop data:; object-src 'none'")
                )
                
                // HSTS (HTTP Strict Transport Security):
                // Fuerza al navegador a usar HTTPS durante 1 año, evitando ataques "Man-in-the-Middle".
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
            )

            // 4. REGLAS DE AUTORIZACIÓN (El Semáforo)
            // Define qué endpoints son públicos y cuáles requieren permisos específicos.
            .authorizeHttpRequests(authorize -> authorize
                // A. ZONA PÚBLICA (Sin Autenticación)
                .requestMatchers(
                    "/api/auth/login",  // Inicio de sesión
                    "/api/auth/logout", // Cierre de sesión
                    "/api/auth/register",
                    // Documentación de la API (Swagger/OpenAPI)
                    "/api/api-docs/**",
                    "/api/swagger-ui/**",
                    "/api/swagger-ui.html",
                    "/swagger-ui/**", 
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()

                 // PERMITIR WEBHOOKS SIN AUTENTICACIÓN
                .requestMatchers(HttpMethod.POST, "/api/pagos/webhook").permitAll()
                
                // B. ZONA MIXTA (Catálogo Público) - AHORA ULTRA SEGURO
                .requestMatchers(HttpMethod.GET, "/api/productos/publicos").permitAll()


                // C. ZONA RESTRINGIDA (Administradores)
                // Operaciones críticas: Subir archivos y Gestión de Inventario (CRUD).
                .requestMatchers("/api/media/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/productos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,"/api/ventas/**").hasRole("ADMIN")
                 // (Más abajo, en la zona C de Admin, asegúrate de que diga):
                .requestMatchers("/api/productos/**").hasRole("ADMIN")
                // D. CANDADO FINAL
                // Cualquier otra ruta no listada arriba requiere estar autenticado.
                .anyRequest().authenticated()
            )

            // 5. GESTIÓN DE SESIÓN -> STATELESS
            // Fundamental para APIs REST. No se crea una "HttpSession" en el servidor.
            // Cada petición es independiente y debe validarse por sí misma (vía Cookie/Token).
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 6. INYECCIÓN DEL FILTRO JWT
            // Insertamos nuestro 'jwtAuthFilter' ANTES del filtro estándar de autenticación de Spring.
            // Esto permite interceptar la Cookie, validar el token y autenticar al usuario
            // antes de que Spring Security decida si rechazar o aceptar la petición.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

         return http.build();
    }

    /**
     * BEAN: AUTHENTICATION MANAGER
     * Es el "Jefe" de la autenticación. Recibe las credenciales y coordina con
     * el Proveedor de Autenticación para verificar si son válidas.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BEAN: PASSWORD ENCODER
     * Define el algoritmo de hash para las contraseñas.
     * Usamos BCrypt (estándar de industria), lo que significa que las contraseñas
     * nunca se guardan en texto plano en la base de datos.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /**
     * BEAN: CONFIGURACIÓN CORS (Lista Blanca de Accesos)
     * Define estrictamente qué dominios externos pueden interactuar con el Backend.
     * CRÍTICO para el funcionamiento de Cookies HttpOnly.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. ORÍGENES PERMITIDOS
        // Lista explícita de dominios confiables. NO se permite '*' cuando se usan cookies.
        configuration.setAllowedOrigins(Arrays.asList(
            "https://miscelaneasdavid.shop",      // Producción (Tienda)
            "https://www.miscelaneasdavid.shop",  // Producción (Tienda con www)
            "https://vmi2897387.taila142d4.ts.net:4200", // Acceso seguro vía VPN (Tailscale)
           // --- NUEVOS DOMINIOS TAILSCALE (LOCAL) ---
            "https://desktop-vaf4ep9-1.taila142d4.ts.net",         // Dashboard - desarrollo
            "https://desktop-vaf4ep9-1.taila142d4.ts.net:8443",    // API - desarrollo
            "https://desktop-vaf4ep9-1.taila142d4.ts.net:10000"    // E-commerce - desarrollo
        ));
        
        // 2. MÉTODOS HTTP PERMITIDOS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 3. CABECERAS PERMITIDAS
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 4. PERMITIR CREDENCIALES (COOKIES)
        // Esta línea es OBLIGATORIA para que el navegador envíe la Cookie HttpOnly.
        // Sin esto, el sistema de autenticación seguro fallaría.
        configuration.setAllowCredentials(true); 

        // Aplica esta configuración a TODAS las rutas (/**) de la API.
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}