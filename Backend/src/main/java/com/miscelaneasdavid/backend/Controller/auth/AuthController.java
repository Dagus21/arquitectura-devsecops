package com.miscelaneasdavid.backend.Controller.auth;

import com.miscelaneasdavid.backend.dto.AuthResponseDTO;
import com.miscelaneasdavid.backend.dto.LoginRequestDTO;
import com.miscelaneasdavid.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        // 1. Autenticar
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. Generar Token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String token = jwtService.generateToken(userDetails);

        // 3. CREAR LA COOKIE HTTP-ONLY (BLINDAJE)
        ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)       // <--- ¡LA CLAVE! JS no puede leerla
                .secure(true)         // Solo viaja por HTTPS (tienes SSL activo)
                .path("/")            // Disponible para toda la API
                .maxAge(24 * 60 * 60) // Expira en 1 día
                .sameSite("None")     // Necesario si API y Front están en dominios/puertos distintos
                // .domain("miscelaneasdavid.shop") // Opcional: para compartir entre subdominios
                .build();

        // 4. Enviar respuesta con la Cookie en la cabecera
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(AuthResponseDTO.builder().token("Token protegido en cookie").build());
    }
    
    // Endpoint opcional para Logout (Borrar cookie)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Caduca inmediatamente
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}