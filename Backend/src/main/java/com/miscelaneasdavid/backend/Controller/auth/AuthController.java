package com.miscelaneasdavid.backend.Controller.auth;

import com.miscelaneasdavid.backend.dto.AuthResponseDTO;
import com.miscelaneasdavid.backend.dto.LoginRequestDTO;
import com.miscelaneasdavid.backend.dto.RegisterRequestDTO;
import com.miscelaneasdavid.backend.entity.Rol;
import com.miscelaneasdavid.backend.entity.Usuario;
import com.miscelaneasdavid.backend.repository.UsuarioRepository;
import com.miscelaneasdavid.backend.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // Inyectamos el encriptador

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        // (El código de tu login queda exactamente igual)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String token = jwtService.generateToken(userDetails);

        ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(AuthResponseDTO.builder()
                        .email(userDetails.getUsername())
                        .nombre(((Usuario) userDetails).getNombre())
                        .rol(((Usuario) userDetails).getRol().name())
                        .build());
    }

    // --- NUEVO: ENDPOINT DE REGISTRO ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        // 1. Verificar si el correo ya existe
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El correo ya está registrado."));
        }

        // 2. Crear nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setEmail(request.getEmail());
        // El encriptador agregará automáticamente el {bcrypt} por debajo
        nuevoUsuario.setPassword(passwordEncoder.encode(request.getPassword())); 
        nuevoUsuario.setTipoUsuario("CLIENTE");
        nuevoUsuario.setRol(Rol.USER);

        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "Usuario registrado con éxito"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true).secure(true).path("/").maxAge(0).sameSite("None").build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }
}