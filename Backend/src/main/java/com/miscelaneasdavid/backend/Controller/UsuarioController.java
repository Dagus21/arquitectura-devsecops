package com.miscelaneasdavid.backend.Controller;

import com.miscelaneasdavid.backend.entity.Rol;
import com.miscelaneasdavid.backend.entity.Usuario;
import com.miscelaneasdavid.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // <-- INYECTAMOS EL ENCRIPTADOR

    @GetMapping("/clientes")
    public ResponseEntity<List<Map<String, String>>> obtenerClientes() {
        // ... (Tu código actual de obtenerClientes queda igual)
        List<Map<String, String>> clientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == Rol.USER)
                .map(u -> Map.<String, String>of(
                        "email", u.getEmail() != null ? u.getEmail() : "",
                        "nombre", u.getNombre() != null ? u.getNombre() : "",
                        "telefono", u.getTelefono() != null ? u.getTelefono() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientes);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> obtenerTodosLosUsuarios() {
        // ... (Tu código actual de obtenerTodosLosUsuarios queda igual)
        List<Map<String, String>> usuarios = usuarioRepository.findAll().stream()
                .map(u -> Map.<String, String>of(
                        "id", String.valueOf(u.getIdUsuario()),
                        "email", u.getEmail() != null ? u.getEmail() : "",
                        "nombre", u.getNombre() != null ? u.getNombre() : "",
                        "telefono", u.getTelefono() != null ? u.getTelefono() : "",
                        "rol", u.getRol().name(),
                        "tipoUsuario", u.getTipoUsuario() != null ? u.getTipoUsuario() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuarios);
    }

    // --- NUEVO: CREAR USUARIO DESDE DASHBOARD ---
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, String> payload) {
        if (usuarioRepository.findByEmail(payload.get("email")).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo ya está registrado."));
        }

        Usuario nuevo = new Usuario();
        nuevo.setNombre(payload.get("nombre"));
        nuevo.setEmail(payload.get("email"));
        nuevo.setTelefono(payload.get("telefono"));
        nuevo.setPassword(passwordEncoder.encode(payload.get("password"))); // Encriptado seguro
        
        Rol rol = Rol.valueOf(payload.getOrDefault("rol", "USER"));
        nuevo.setRol(rol);
        nuevo.setTipoUsuario(rol == Rol.ADMIN ? "ADMINISTRADOR" : "CLIENTE");

        usuarioRepository.save(nuevo);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario creado con éxito"));
    }

    // --- NUEVO: EDITAR USUARIO DESDE DASHBOARD ---
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();

        // Validar que si cambia el email, no exista ya en otro usuario
        String nuevoEmail = payload.get("email");
        if (!usuario.getEmail().equals(nuevoEmail) && usuarioRepository.findByEmail(nuevoEmail).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo ya está en uso por otro usuario."));
        }

        usuario.setNombre(payload.get("nombre"));
        usuario.setEmail(nuevoEmail);
        usuario.setTelefono(payload.get("telefono"));
        
        // Solo actualiza la contraseña si se envió una nueva
        if (payload.get("password") != null && !payload.get("password").isBlank()) {
            usuario.setPassword(passwordEncoder.encode(payload.get("password")));
        }

        Rol rol = Rol.valueOf(payload.get("rol"));
        usuario.setRol(rol);
        usuario.setTipoUsuario(rol == Rol.ADMIN ? "ADMINISTRADOR" : "CLIENTE");

        usuarioRepository.save(usuario);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario actualizado con éxito"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        Usuario u = usuarioRepository.findById(id).orElseThrow();
        if (u.getRol() == Rol.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminar a un Administrador."));
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado."));
    }
}