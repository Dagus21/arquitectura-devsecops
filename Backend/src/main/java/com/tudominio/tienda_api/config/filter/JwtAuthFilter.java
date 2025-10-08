package com.tudominio.tienda_api.config.filter;

import com.tudominio.tienda_api.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// @Component: Marca esta clase como un Bean de Spring para que pueda ser inyectado en nuestra SecurityConfig.
@Component
@RequiredArgsConstructor
// OncePerRequestFilter: Asegura que nuestro filtro se ejecute solo UNA VEZ por cada petición.
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain // Es la cadena de filtros. Debemos llamarla para que la petición continúe.
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Si la petición no tiene el encabezado Authorization o no empieza con "Bearer ",
        // la dejamos pasar al siguiente filtro.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);

        // Si tenemos un username y el usuario aún no está autenticado en el contexto actual...
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // Si el token es válido...
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Creamos un objeto de autenticación y lo guardamos en el contexto de seguridad.
                // Esto le dice a Spring que el usuario actual está autenticado para esta petición.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Pasamos la petición al siguiente filtro.
        filterChain.doFilter(request, response);
    }
}