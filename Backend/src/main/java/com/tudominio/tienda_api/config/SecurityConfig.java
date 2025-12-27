package com.tudominio.tienda_api.config;

import com.tudominio.tienda_api.config.filter.JwtAuthFilter;
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

import java.util.Arrays; // Importante para listas
import java.util.List;

@Configuration // Indica que esta clase contiene configuración de Spring (Beans)
@EnableWebSecurity // Activa la seguridad web de Spring Security en el proyecto
@RequiredArgsConstructor // Inyecta automáticamente las dependencias 'final' (jwtAuthFilter, userDetailsService)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * EL GUARDIÁN DE LA PUERTA (SecurityFilterChain)
     * Este método define las reglas de juego: quién pasa, quién no, y cómo.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS: Activamos el soporte de CORS.
            // Al poner 'Customizer.withDefaults()', Spring buscará automáticamente un Bean llamado 'corsConfigurationSource' (definido abajo).
            .cors(Customizer.withDefaults())

            // 2. CSRF (Cross-Site Request Forgery): Lo desactivamos.
            // ¿Por qué? CSRF es necesario si usas sesiones de servidor (Cookies).
            // Como usas JWT (Tokens), no es necesario y solo estorbaría.
            .csrf(csrf -> csrf.disable())

            // 3. REGLAS DE AUTORIZACIÓN (El semáforo)
            .authorizeHttpRequests(authorize -> authorize
                
                // A. RUTAS PÚBLICAS (Todo el mundo entra)
                // Login, documentación Swagger y recursos estáticos.
                .requestMatchers("/api/auth/login", "/api/api-docs/**", "/api/swagger-ui/**", "/api/swagger-ui.html").permitAll()
                
                // B. RUTAS DE LECTURA PÚBLICA (Catálogo)
                // Cualquiera puede ver productos (GET), pero no tocarlos.
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()

                // C. RUTAS ADMINISTRATIVAS (Solo ADMIN)
                // Subir fotos (Media).
                .requestMatchers("/api/media/**").hasRole("ADMIN")
                
                // Crear, Editar o Borrar productos.
                .requestMatchers(HttpMethod.POST, "/api/productos").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
                
                // D. EL RESTO (Candado final)
                // Cualquier otra ruta no listada arriba, exige estar logueado.
                .anyRequest().authenticated()
            )

            // 4. GESTIÓN DE SESIONES
            // STATELESS: Le decimos a Spring "No guardes memoria del usuario".
            // Cada petición debe traer su Token. Esto hace la API ligera y escalable.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 5. PROVEEDOR DE AUTENTICACIÓN
            // Conectamos nuestro sistema de usuarios (Base de Datos) con la seguridad.
            .authenticationProvider(authenticationProvider())

            // 6. EL FILTRO JWT
            // Colocamos nuestro filtro "JwtAuthFilter" ANTES del filtro estándar de usuario/contraseña.
            // Esto permite que si alguien trae un Token válido, entre directo.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

         return http.build();
    }

    /**
     * GESTOR DE AUTENTICACIÓN
     * Es el componente que orquesta el proceso de verificar credenciales.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * PROVEEDOR DE AUTENTICACIÓN (DAO)
     * Enseña a Spring Security cómo buscar usuarios en TU base de datos y cómo verificar contraseñas.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // Tu servicio para buscar en BD
        authProvider.setPasswordEncoder(passwordEncoder());    // Tu encriptador
        return authProvider;
    }

    /**
     * ENCRIPTADOR DE CONTRASEÑAS
     * BCrypt es el estándar actual. Nunca guardamos contraseñas en texto plano.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    // ========================================================================
    //              CONFIGURACIÓN CORS (Lista Blanca de Accesos)
    // ========================================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. ORÍGENES PERMITIDOS (Lista Blanca)
        // Aquí definimos EXACTAMENTE quién puede llamar a tu API.
        // Si un hacker hace una web falsa 'robatusdatos.com' e intenta llamar a tu API, el navegador lo bloqueará.
        configuration.setAllowedOrigins(Arrays.asList(
            // Desarrollo Local
            "http://localhost:3000", // Next.js Local
            "http://localhost:4200", // Angular Local
            
            // Producción (Público)
            "https://miscelaneasdavid.shop",      // Tu tienda
            "https://www.miscelaneasdavid.shop",  // Tu tienda con www
            
            // Producción (Privado / VPN)
            // Este es tu Dashboard accedido vía Tailscale
            //"https://vmi2897387.taila142d4.ts.net:4200"
        ));
        
        // 2. MÉTODOS PERMITIDOS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 3. CABECERAS PERMITIDAS
        // Permitimos enviar Tokens (Authorization) y tipos de contenido (Content-Type)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        
        // 4. CREDENTIALS
        // Permitir envío de cookies o credenciales si fuera necesario en el futuro
        configuration.setAllowCredentials(true);

        // Registramos esta configuración para TODAS las rutas (/**)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}