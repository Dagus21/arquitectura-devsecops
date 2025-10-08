package com.tudominio.tienda_api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductoDTO {

    private Long id;

    // --- Concepto: Anotaciones de Validación ---
    // Estas anotaciones declaran las reglas que este campo debe cumplir.

    // @NotEmpty: Asegura que el string no sea nulo y que su longitud sea mayor que 0.
    // El atributo `message` nos permite personalizar el mensaje de error.
    @NotEmpty(message = "El nombre del producto no puede estar vacío.")
    // @Size: Define el tamaño mínimo y máximo del string.
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres.")
    private String nombre;

    @NotEmpty(message = "La descripción no puede estar vacía.")
    private String descripcion;

    // @NotNull: Asegura que el valor no sea nulo.
    @NotNull(message = "El precio no puede ser nulo.")
    // @Positive: Asegura que el número sea estrictamente mayor que 0.
    @Positive(message = "El precio debe ser un número positivo.")
    private Double precio;

    @NotNull(message = "El stock no puede ser nulo.")
    // @PositiveOrZero: Asegura que el número sea 0 o mayor.
    // (Importado de `jakarta.validation.constraints.PositiveOrZero`)
    // Como no lo hemos añadido, lo dejaremos como @Positive por ahora.
    private Integer stock;
}