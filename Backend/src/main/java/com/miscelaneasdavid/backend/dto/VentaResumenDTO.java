package com.miscelaneasdavid.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VentaResumenDTO {
    private Long idVenta;
    private LocalDateTime fecha;
    private BigDecimal totalVenta;
    private String estado;      // PENDIENTE, PAGADO
    private String metodoPago;
    private String idTransaccion;
    private String emailUsuario; // Para saber quién compró
    private String nombreUsuario;
    private int cantidadItems;   // Un resumen (ej: "3 productos")
}