package com.miscelaneasdavid.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequestDTO {
    @NotEmpty(message = "El carrito no puede estar vacío")
    private List<CheckoutItemDTO> items;

    // NUEVO
    @NotBlank(message = "La llave de idempotencia es requerida")
    private String idempotencyKey;
}