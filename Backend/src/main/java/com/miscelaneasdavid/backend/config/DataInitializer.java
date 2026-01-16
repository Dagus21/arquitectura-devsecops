package com.miscelaneasdavid.backend.config;

import com.miscelaneasdavid.backend.entity.Rol;
import com.miscelaneasdavid.backend.entity.Usuario;
import com.miscelaneasdavid.backend.repository.UsuarioRepository;
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
        if (usuarioRepository.findByEmail("admin@tienda.com").isEmpty()) {
            Usuario admin = Usuario.builder()
                    .email("admin@tienda.com")
                    .nombre("Administrador Principal")
                    .password(passwordEncoder.encode("password"))
                    .rol(Rol.ADMIN)
                    .tipoUsuario("ADMINISTRADOR") // <--- ¡FALTABA ESTO!
                    .build();
            usuarioRepository.save(admin);
            System.out.println("✅ Usuario ADMIN creado: admin@tienda.com / password");
        }

        // Crear usuario USER si no existe
        if (usuarioRepository.findByEmail("user@tienda.com").isEmpty()) {
            Usuario user = Usuario.builder()
                    .email("user@tienda.com")
                    .nombre("Cliente de Prueba")
                    .password(passwordEncoder.encode("password"))
                    .rol(Rol.USER)
                    .tipoUsuario("CLIENTE") // <--- ¡FALTABA ESTO!
                    .build();
            usuarioRepository.save(user);
            System.out.println("✅ Usuario USER creado: user@tienda.com / password");
        }
    }
}