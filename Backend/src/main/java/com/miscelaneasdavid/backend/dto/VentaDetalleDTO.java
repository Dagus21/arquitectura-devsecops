package com.miscelaneasdavid.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaDetalleDTO {
    private Long idVenta;
    private LocalDateTime fecha;
    private BigDecimal totalVenta;
    private String estado;
    private String metodoPago;
    private String emailUsuario;
    private String nombreUsuario;
    private String telefonoUsuario;
    private List<ItemVentaDTO> items;
}