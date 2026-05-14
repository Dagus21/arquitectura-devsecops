package com.miscelaneasdavid.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal; // IMPORTANTE: Necesario para manejar dinero con precisión

/*
 * ========================================================================
 *              ENTIDAD PRODUCTO (ACTUALIZADA CON OPTIMISTIC LOCKING)
 * ========================================================================
 */

@Entity
@Data
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Cambiamos 'id' a 'idProducto' para ser consistentes con el ERD y el SQL.
    // Hibernate mapeará automáticamente 'idProducto' a la columna 'id_producto'.
    private Long idProducto;

    // SKU o Código de Barras. 'unique = true' crea una restricción de unicidad.
    @Column(unique = true)
    private String idReferencia;

    private String nombre;

    // 'columnDefinition = "TEXT"' le dice a Postgres que use el tipo TEXT
    // en lugar de VARCHAR(255), permitiendo descripciones largas sin límite.
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String descripcionPrivada; // <--- NUEVO CAMPO

    private Integer stock;

    // ========================================================================
    //              CONTROL DE CONCURRENCIA (OPTIMISTIC LOCKING)
    // ========================================================================
    // Propósito: Evitar el problema de "condición de carrera" o "sobreventa".
    // Cómo funciona: Cada vez que se realiza un UPDATE (ej. al restar stock tras una venta), 
    // Hibernate suma automáticamente +1 a este número.
    // Si dos clientes intentan comprar simultáneamente, el primero que guarde cambiará la versión.
    // Cuando el segundo cliente intente guardar con la versión antigua, Hibernate lo rechazará 
    // lanzando 'ObjectOptimisticLockingFailureException', impidiendo inventarios negativos.
    @Version
    private Long version;

    // --- CAMBIO IMPORTANTE: Double vs BigDecimal ---
    // Usamos BigDecimal en lugar de Double para precios.
    // Double tiene problemas de precisión con decimales (ej: 0.1 + 0.2 da 0.30000000004).
    // BigDecimal es exacto, lo cual es obligatorio para aplicaciones financieras/comerciales.
    private BigDecimal precioVenta;
    
    private BigDecimal precioCompra;

    // Estado del producto (ej: ACTIVO, INACTIVO, BORRADOR)
    private String estado;

    // URL de la imagen guardada en MinIO
    private String imagenUrl;

    // --- RELACIONES (Foreign Keys) ---
    
    // @ManyToOne: "Muchos Productos pueden tener Un Proveedor".
    // @JoinColumn: Define que la columna en la tabla 'producto' se llamará 'proveedor_id'.
    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;
}