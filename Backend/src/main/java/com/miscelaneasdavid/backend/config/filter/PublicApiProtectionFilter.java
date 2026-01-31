package com.miscelaneasdavid.backend.config.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class PublicApiProtectionFilter extends OncePerRequestFilter {

    // Dominios permitidos (Tu Frontend E-commerce y Dashboard)
    private static final List<String> ALLOWED_ORIGINS = List.of(
            "https://miscelaneasdavid.shop",
            "https://www.miscelaneasdavid.shop",
            "https://vmi2897387.taila142d4.ts.net:4200", // Dashboard VPN
            "http://localhost:3000",
            "http://localhost:4200"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Solo aplicamos protección a los GET públicos de productos
        // Si es POST/PUT/DELETE, ya lo protege el JWT, así que lo ignoramos aquí
        if (path.startsWith("/api/productos") && "GET".equals(method)) {

            String origin = request.getHeader("Origin");
            String referer = request.getHeader("Referer");

            // Si intenta entrar directo desde el navegador (sin Origin ni Referer)
            if (origin == null && referer == null) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Acceso directo no permitido. Usa la tienda oficial.");
                return; // Bloqueamos
            }

            // Validación extra (Opcional): Verificar que venga de tus dominios
            boolean isAllowed = false;
            String incomingSource = (origin != null) ? origin : referer;
            
            for (String allowed : ALLOWED_ORIGINS) {
                if (incomingSource != null && incomingSource.startsWith(allowed)) {
                    isAllowed = true;
                    break;
                }
            }

            if (!isAllowed) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}