package com.tudominio.tienda_api.config;

import com.tudominio.tienda_api.entity.Rol;
import com.tudominio.tienda_api.entity.Usuario;
import com.tudominio.tienda_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Crear usuario ADMIN si no existe
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("password")) // ¡Siempre codificar la contraseña!
                    .rol(Rol.ADMIN)
                    .build();
            usuarioRepository.save(admin);
        }

        // Crear usuario USER si no existe
        if (usuarioRepository.findByUsername("user").isEmpty()) {
            Usuario user = Usuario.builder()
                    .username("user")
                    .password(passwordEncoder.encode("password"))
                    .rol(Rol.USER)
                    .build();
            usuarioRepository.save(user);
        }
    }
}