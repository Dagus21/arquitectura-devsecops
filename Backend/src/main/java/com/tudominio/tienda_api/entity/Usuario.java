package com.tudominio.tienda_api.entity;
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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios") // Es buena práctica nombrar las tablas en plural
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    private Rol rol;

// Métodos de la interfaz UserDetails

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Le añadimos el prefijo "ROLE_" al nombre del rol.
        // Ahora, en lugar de "ADMIN", la autoridad será "ROLE_ADMIN".
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    // Dejamos estos métodos como true por simplicidad.
// En un sistema real, podrías usarlos para deshabilitar cuentas.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}