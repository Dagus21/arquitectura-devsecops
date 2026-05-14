package com.miscelaneasdavid.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal; // Importante

@Data
public class ProductoDTO {

    private Long idProducto; // Antes era 'id'

    private String idReferencia; // Nuevo (SKU)

    @NotEmpty(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100)
    private String nombre;

    private String descripcion;

    private String descripcionPrivada; 

    @NotNull(message = "El precio de venta es obligatorio")
    @Positive
    private BigDecimal precioVenta; // Antes 'precio' (ahora BigDecimal)

    private BigDecimal precioCompra; // Nuevo

    @NotNull(message = "El stock es obligatorio")
    @Positive
    private Integer stock;

    private String estado;
    private String imagenUrl;
    
    // Opcional: ID del proveedor si quisieras enviarlo desde el front
    private Long proveedorId; 
}