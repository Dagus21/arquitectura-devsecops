package com.miscelaneasdavid.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVenta;

    // Se llena automáticamente con la fecha actual al crear el objeto
    private LocalDateTime fecha = LocalDateTime.now(); 
    
    private BigDecimal totalVenta;
    private String canal;       // Ej: ONLINE, TIENDA_FISICA
    private String estado;      // Ej: PAGADO, PENDIENTE
    private String metodoPago;  // Ej: MERCADO_PAGO

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Relación bidireccional: Una venta tiene muchos items
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    private List<ItemVenta> items;
}