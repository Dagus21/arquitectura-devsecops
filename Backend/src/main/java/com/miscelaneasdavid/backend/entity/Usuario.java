package com.miscelaneasdavid.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder // <--- ¡ASEGÚRATE DE QUE ESTO ESTÉ AQUÍ!
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    // --- AQUÍ ESTÁ LA CLAVE ---
    @Column(unique = true, nullable = false)
    private String email; // <--- ¿TIENES ESTE CAMPO?

    @Column(nullable = false)
    private String nombre;

    private String password;

    @Column(unique = true)
    private String documento;

    @Column(unique = true)
    private String idGoogle;

    private String tipoUsuario;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    // --- MÉTODOS DE USER DETAILS ---

    @Override
    public String getUsername() {
        return email; // Usamos email como usuario
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}