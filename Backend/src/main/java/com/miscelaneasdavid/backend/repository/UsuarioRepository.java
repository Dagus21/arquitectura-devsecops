package com.miscelaneasdavid.backend.repository;

import com.miscelaneasdavid.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // CAMBIO: Ahora buscamos por email, no por username
    Optional<Usuario> findByEmail(String email);
}