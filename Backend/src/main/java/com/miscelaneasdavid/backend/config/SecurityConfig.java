package com.miscelaneasdavid.backend.config;

import com.miscelaneasdavid.backend.config.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * CLASE MAESTRA DE SEGURIDAD (SecurityConfig)
 * ----------------------------------------------------------------
 * Esta clase es el "Portero" de la aplicación. Configura Spring Security 6+
 * para manejar autenticación (quién eres) y autorización (qué puedes hacer).
 * Implementa seguridad Stateless (sin sesiones) basada en Tokens JWT.
 */
@Configuration // Marca la clase como fuente de beans para el contexto de Spring.
@EnableWebSecurity // Habilita la seguridad web y permite personalizar la cadena de filtros.
@RequiredArgsConstructor // Lombok: Genera constructor para inyectar campos 'final' automáticamente.
public class SecurityConfig {

    // Inyectamos nuestro filtro personalizado que valida el Token JWT.
    private final JwtAuthFilter jwtAuthFilter;
    // Inyectamos el servicio que busca usuarios en nuestra base de datos PostgreSQL.
    private final UserDetailsService userDetailsService;

    /**
     * CADENA DE FILTROS DE SEGURIDAD (Security Filter Chain)
     * Define el orden y las reglas que debe atravesar cada petición HTTP.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS (Cross-Origin Resource Sharing)
            // Permite que navegadores en otros dominios (ej: tu frontend Angular o Next.js)
            // consuman esta API. Busca automáticamente el bean 'corsConfigurationSource'.
            .cors(Customizer.withDefaults())

            // 2. CSRF (Cross-Site Request Forgery) -> DESACTIVADO
            // En APIs REST que usan JWT (Stateless), no hay riesgo de CSRF porque no
            // usamos cookies de sesión para autenticar. Por eso se deshabilita.
            .csrf(csrf -> csrf.disable())

            // 3. CABECERAS DE SEGURIDAD (Security Headers - OWASP)
            // Configuraciones para proteger al usuario final en su navegador.
            .headers(headers -> headers
                // Anti-Clickjacking: Prohíbe que esta API se cargue dentro de un <iframe>
                // en otro sitio web malicioso.
                .frameOptions(frame -> frame.deny())
                
                // Protección XSS: Desactiva el filtro obsoleto del navegador para delegar
                // la seguridad en la Content Security Policy (CSP).
                .xssProtection(xss -> xss.disable())
                
                // Content Security Policy (CSP):
                // Define una "Lista Blanca" de fuentes de contenido confiables.
                // 'default-src self': Solo permite scripts/estilos del mismo dominio.
                // 'img-src ...': Permite cargar imágenes desde el propio dominio y desde tu Bucket S3.
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; img-src 'self' https://s3.miscelaneasdavid.shop data:; object-src 'none'")
                )
                
                // HSTS (HTTP Strict Transport Security):
                // Le dice al navegador: "Durante el próximo año (31536000s), NUNCA intentes
                // conectar por HTTP inseguro. Usa siempre HTTPS".
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
            )

            // 4. REGLAS DE AUTORIZACIÓN (El Semáforo)
            // Define qué endpoints son públicos y cuáles requieren permisos.
            .authorizeHttpRequests(authorize -> authorize
                // A. PÚBLICO: Login y Documentación (Swagger/OpenAPI)
                .requestMatchers("/api/auth/login", "/api/api-docs/**", "/api/swagger-ui/**", "/api/swagger-ui.html").permitAll()
                
                // B. PÚBLICO: Catálogo de Productos (Cualquiera puede ver qué vendemos)
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()

                // C. PRIVADO (ADMIN): Subida de archivos multimedia a MinIO
                .requestMatchers("/api/media/**").hasRole("ADMIN")

                // D. PRIVADO (ADMIN): Gestión del inventario (Crear, Editar, Borrar)
                .requestMatchers(HttpMethod.POST, "/api/productos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
                
                // E. CANDADO FINAL: Cualquier otra ruta no especificada arriba requiere
                // al menos estar autenticado (tener un Token válido).
                .anyRequest().authenticated()
            )

            // 5. GESTIÓN DE SESIÓN -> STATELESS
            // No creamos HttpSession en el servidor (no hay JSESSIONID).
            // Cada petición es independiente y debe traer su propia credencial (JWT).
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 6. PROVEEDOR DE AUTENTICACIÓN
            // Vincula la lógica de base de datos con Spring Security.
            .authenticationProvider(authenticationProvider())

            // 7. FILTRO JWT
            // Insertamos nuestro filtro personalizado ANTES del filtro estándar de usuario/pass.
            // Si el JWT es válido, el usuario entra directo sin verificar contraseña de nuevo.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

         return http.build();
    }

    /**
     * BEAN: AUTHENTICATION MANAGER
     * Es el componente que orquesta el proceso de login. Lo usamos en AuthController.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BEAN: AUTHENTICATION PROVIDER
     * Enseña a Spring Security CÓMO verificar la identidad:
     * 1. Usando 'userDetailsService' para buscar el usuario en BD.
     * 2. Usando 'passwordEncoder' para comparar el hash de la contraseña.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * BEAN: PASSWORD ENCODER
     * Algoritmo de encriptación. Usamos BCrypt, que es el estándar actual de la industria.
     * Nunca guardamos contraseñas en texto plano.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    /**
     * BEAN: CONFIGURACIÓN CORS (Lista Blanca)
     * Define qué dominios externos tienen permiso para hablar con el Backend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. ORÍGENES PERMITIDOS
        // Solo aceptamos peticiones que vengan de estas direcciones exactas.
        // Esto previene que sitios maliciosos consuman tu API desde el navegador del usuario.
        configuration.setAllowedOrigins(Arrays.asList(
            // Entorno de Desarrollo Local
            "http://localhost:3000", // Frontend E-commerce
            "http://localhost:4200", // Frontend Dashboard
            
            // Entorno de Producción (Público)
            "https://miscelaneasdavid.shop",      // Tienda oficial
            "https://www.miscelaneasdavid.shop",  // Tienda con www
            
            // Entorno de Producción (Privado / VPN)
            // Necesario para que tú puedas administrar la tienda desde Tailscale.
            "https://vmi2897387.taila142d4.ts.net:4200"
        ));
        
        // 2. MÉTODOS HTTP PERMITIDOS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 3. CABECERAS PERMITIDAS
        // Authorization: Para enviar el Token Bearer.
        // Content-Type: Para enviar JSON.
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        
        // 4. CREDENCIALES
        // Permite envío de cookies si fuera necesario en el futuro.
        configuration.setAllowCredentials(true);

        // Aplica esta configuración a TODAS las rutas (/**) de la API.
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}