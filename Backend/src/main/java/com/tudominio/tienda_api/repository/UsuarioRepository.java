package com.tudominio.tienda_api.repository;

import com.tudominio.tienda_api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Spring Data JPA creará automáticamente la consulta para este método
    Optional<Usuario> findByUsername(String username);
}