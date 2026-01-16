package com.miscelaneasdavid.backend.Controller.auth;

import com.miscelaneasdavid.backend.dto.AuthResponseDTO;
import com.miscelaneasdavid.backend.dto.LoginRequestDTO;
import com.miscelaneasdavid.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// @RequiredArgsConstructor es una anotación de Lombok que genera un constructor
// con todos los campos finales (final), evitando que tengamos que escribirlo nosotros.
// Es la forma moderna de hacer inyección por constructor.
@RequiredArgsConstructor
public class AuthController {

    // Dependencias que serán inyectadas por Spring gracias a @RequiredArgsConstructor.
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    /**
     * Endpoint para el inicio de sesión. Recibe credenciales y devuelve un token JWT.
     * @param request DTO con el username y la password.
     * @return ResponseEntity con un DTO que contiene el token.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        // 1. AUTENTICAR
        // `authenticationManager` es el gestor principal de autenticación de Spring Security.
        // Al llamarlo, se usa internamente nuestro `userDetailsService` y `passwordEncoder`
        // para verificar si el usuario y la contraseña son correctos.
        // Si no lo son, lanzará una excepción y el proceso se detendrá aquí con un error 401/403.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. OBTENER DETALLES DEL USUARIO
        // Si la autenticación fue exitosa, cargamos los detalles del usuario para tener sus datos (roles, etc.).
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 3. GENERAR EL TOKEN
        // Usamos nuestro servicio de JWT para crear el token.
        final String token = jwtService.generateToken(userDetails);

        // 4. DEVOLVER LA RESPUESTA
        // Devolvemos una respuesta 200 OK con el DTO que contiene el token.
        return ResponseEntity.ok(AuthResponseDTO.builder().token(token).build());
    }
}