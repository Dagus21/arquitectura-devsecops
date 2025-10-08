package com.tudominio.tienda_api.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

/*
 * ========================================================================
 *              EXPLICACIÓN DE LA CLASE ENTIDAD
 * ========================================================================
 */

// --- Concepto: Anotación @Entity ---
// Esta anotación de JPA le dice a Hibernate: "Esta clase representa una tabla
// en la base de datos". Por defecto, el nombre de la tabla será el mismo
// que el de la clase (en este caso, 'producto').
@Entity

// --- Concepto: Anotación @Data (de Lombok) ---
// ¡Esta es una anotación de productividad, no de Spring o JPA!
// Lombok es una librería que genera automáticamente código repetitivo.
// @Data crea por nosotros en tiempo de compilación:
// - Getters para todos los campos (ej: getId(), getNombre()).
// - Setters para todos los campos (ej: setId(), setNombre()).
// - Un método toString() útil para imprimir el objeto.
// - Métodos equals() y hashCode().
// Esto nos ahorra escribir decenas de líneas de código.
@Data
public class Producto {

    // --- Concepto: Anotación @Id ---
    // Marca este campo como la clave primaria (primary key) de la tabla.
    @Id

    // --- Concepto: Anotación @GeneratedValue ---
    // Le indica a la base de datos cómo se debe generar el valor de la clave primaria.
    // GenerationType.IDENTITY es la estrategia más común: le delega a la base de datos
    // la tarea de autoincrementar el valor (como un AUTO_INCREMENT en MySQL).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hibernate mapeará automáticamente estos campos a columnas en la tabla 'producto'.
    // El tipo de dato en Java (String, Double, Integer) se traducirá al tipo
    // de columna apropiado en la base de datos (VARCHAR, DOUBLE, INT).
    private String nombre;

    private String descripcion;

    private Double precio;

    private Integer stock;
}
