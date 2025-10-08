package com.tudominio.tienda_api.service;

// --- EXPLICACIÓN DE LAS LIBRERÍAS (IMPORTS) ---
import com.tudominio.tienda_api.dto.ProductoDTO;
import com.tudominio.tienda_api.entity.Producto;
import com.tudominio.tienda_api.repository.ProductoRepository;
// Importaciones de JUnit 5 para definir pruebas y hacer aserciones.
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
// Importaciones de Mockito para crear "mocks" (simulacros) e inyectarlos.
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/*
 * ========================================================================
 *              PRUEBAS UNITARIAS PARA ProductoService
 * ========================================================================
 */

// --- Concepto: @ExtendWith(MockitoExtension.class) ---
// Esta anotación le dice a JUnit 5 que debe activar la extensión de Mockito.
// Esto permite que Mockito procese las anotaciones @Mock y @InjectMocks.
@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    // --- Concepto: @Mock ---
    // Esta anotación de Mockito crea una versión "falsa" o un "simulacro" de la clase especificada.
    // En este caso, creamos un ProductoRepository falso. Este objeto no se conectará a la base de datos;
    // en su lugar, podemos decirle exactamente qué debe devolver cuando se llame a sus métodos.
    @Mock
    private ProductoRepository productoRepository;

    // --- Concepto: @InjectMocks ---
    // Esta anotación crea una instancia REAL de la clase que queremos probar (ProductoService),
    // e intenta INYECTAR los mocks creados con @Mock en sus dependencias.
    // Esencialmente, crea un `new ProductoService(productoRepositoryFalso)`.
    @InjectMocks
    private ProductoService productoService;

    // Variables de prueba que usaremos en varios tests.
    private Producto producto;
    private ProductoDTO productoDTO;

    // --- Concepto: @BeforeEach ---
    // Este método, anotado con @BeforeEach de JUnit, se ejecutará ANTES de cada
    // método de prueba (@Test). Es el lugar perfecto para inicializar objetos
    // que se usan en múltiples pruebas, asegurando que cada test empiece con datos limpios.
    @BeforeEach
    void setUp() {
        // Inicializamos un objeto Producto de ejemplo.
        producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Gorro de Lana");
        producto.setDescripcion("Un gorro cálido");
        producto.setPrecio(25.00);
        producto.setStock(100);

        // Inicializamos su DTO correspondiente.
        productoDTO = new ProductoDTO();
        productoDTO.setId(1L);
        productoDTO.setNombre("Gorro de Lana");
        productoDTO.setDescripcion("Un gorro cálido");
        productoDTO.setPrecio(25.00);
        productoDTO.setStock(100);
    }

    // --- Concepto: @Test ---
    // Esta anotación de JUnit marca un método como un caso de prueba automatizado.
    // El método debe ser público y no devolver nada (void).
    @Test
    void cuandoObtenerTodosLosProductosEsLlamado_debeDevolverListaDeDTOs() {
        // --- Patrón de Prueba: Arrange, Act, Assert (AAA) ---

        // 1. Arrange (Organizar): Preparamos el escenario de la prueba.
        //    Le decimos a nuestro repositorio falso qué debe hacer.
        //    `when(...)`: Le indicamos a Mockito que intercepte una llamada a un método.
        //    `thenReturn(...)`: Especificamos qué valor debe devolver esa llamada.
        //    Traducción: "Cuando alguien llame al método findAll() de mi repositorio falso,
        //                 devuelve una lista que contiene nuestro objeto 'producto'".
        when(productoRepository.findAll()).thenReturn(Collections.singletonList(producto));

        // 2. Act (Actuar): Ejecutamos el método que queremos probar.
        List<ProductoDTO> resultado = productoService.obtenerTodosLosProductos();

        // 3. Assert (Afirmar): Verificamos que el resultado es el esperado.
        //    Usamos los métodos de `Assertions` de JUnit.
        assertNotNull(resultado); // Afirmamos que la lista no es nula.
        assertEquals(1, resultado.size()); // Afirmamos que la lista tiene 1 elemento.
        assertEquals("Gorro de Lana", resultado.get(0).getNombre()); // Afirmamos que el nombre del producto es correcto.
    }

    @Test
    void cuandoObtenerProductoPorIdExistente_debeDevolverProductoDTO() {
        // 1. Arrange: Configuramos el mock.
        // Traducción: "Cuando alguien llame a findById con el ID 1,
        //                 devuelve un Optional que contiene nuestro objeto 'producto'".
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        // 2. Act: Llamamos al método a probar.
        Optional<ProductoDTO> resultado = productoService.obtenerProductoPorId(1L);

        // 3. Assert: Verificamos el resultado.
        assertTrue(resultado.isPresent()); // Afirmamos que el Optional contiene un valor.
        assertEquals(producto.getNombre(), resultado.get().getNombre()); // Verificamos que el nombre es correcto.

        // --- Concepto: verify() ---
        // `verify()` de Mockito nos permite comprobar si un método del mock fue llamado.
        // Traducción: "Verifica que el método findById(1L) del repositorio falso
        //                 fue llamado exactamente 1 vez". Esto es útil para asegurar
        //                 que la lógica interna del servicio está funcionando como se espera.
        verify(productoRepository, times(1)).findById(1L);
    }

    @Test
    void cuandoGuardarProducto_debeDevolverProductoGuardadoDTO() {
        // 1. Arrange: Configuramos el mock.
        // Le decimos a Mockito: "Cuando se llame al método save con CUALQUIER objeto
        // de tipo Producto, devuelve nuestro objeto 'producto'".
        // `any(Producto.class)` es un "matcher" de Mockito.
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        // 2. Act: Llamamos al método a probar.
        ProductoDTO resultado = productoService.guardarProducto(productoDTO);

        // 3. Assert: Verificamos.
        assertNotNull(resultado);
        assertEquals(productoDTO.getNombre(), resultado.getNombre());
    }
}
