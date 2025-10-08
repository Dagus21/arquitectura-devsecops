// ########################################################################
// CAPA 3: REPOSITORIO (Data Access Layer)
// Archivo: src/main/java/.../repository/ProductoRepository.java
// ########################################################################

// --- Concepto: Anotación @Repository ---
// Es una especialización de @Component. Marca esta clase como un Bean
// de la capa de acceso a datos y permite a Spring traducir excepciones
// específicas de la base de datos a excepciones de Spring más genéricas.

package com.tudominio.tienda_api.repository;

import com.tudominio.tienda_api.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/*
 * ========================================================================
 *              EXPLICACIÓN DE LA INTERFAZ REPOSITORIO
 * ========================================================================
 */

// --- Concepto: Anotación @Repository ---
// Marca esta interfaz como un Bean de la capa de acceso a datos de Spring.
// Aunque en versiones modernas de Spring con JpaRepository no es estrictamente
// necesario, es una buena práctica para la claridad y la consistencia.
@Repository

// --- Concepto: Interfaz JpaRepository ---
// ¡Aquí está la magia! Al extender JpaRepository, nuestra interfaz HEREDA
// automáticamente un conjunto completo de métodos para operaciones CRUD.
// No necesitamos escribir ninguna implementación para métodos como:
// - save(producto): Guarda o actualiza un producto.
// - findById(id): Busca un producto por su ID.
// - findAll(): Devuelve todos los productos.
// - deleteById(id): Borra un producto por su ID.
// - y muchos más...

// --- Concepto: Parámetros Genéricos <Producto, Long> ---
// JpaRepository necesita saber dos cosas:
// 1. El tipo de la entidad con la que va a trabajar (en nuestro caso, `Producto`).
// 2. El tipo de la clave primaria de esa entidad (en nuestro caso, `Long`).
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // --- Concepto: Consultas Derivadas del Nombre del Método ---
    // Spring Data JPA es tan inteligente que puede crear consultas SQL
    // automáticamente basándose en el nombre de los métodos que declares aquí.
    // Por ejemplo, si necesitas buscar productos por su nombre, solo tienes que
    // declarar el método. Spring lo implementará por ti.
    //
    // List<Producto> findByNombre(String nombre);
    // List<Producto> findByPrecioGreaterThan(Double precio);
    //
    // Por ahora, lo dejaremos vacío y usaremos los métodos heredados.
}
