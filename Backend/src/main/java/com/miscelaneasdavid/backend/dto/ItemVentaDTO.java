package com.miscelaneasdavid.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemVentaDTO {
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}