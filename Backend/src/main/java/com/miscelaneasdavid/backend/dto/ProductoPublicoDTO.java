package com.miscelaneasdavid.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoPublicoDTO {
    private Long idProducto;
    private String nombre;
    private String descripcion;
    private BigDecimal precioVenta;
    private String estado;
    private String imagenUrl;
    private boolean disponible; 
    
    // NUEVO: Agregamos el stock para mandarlo al E-commerce
    private Integer stock; 
}