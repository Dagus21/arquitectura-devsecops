package com.tudominio.tienda_api.Controller;

import com.tudominio.tienda_api.dto.ProductoDTO;
import com.tudominio.tienda_api.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tudominio.tienda_api.exception.ResourceNotFoundException;


import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    @Autowired
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // Ahora el controlador trabaja EXCLUSIVAMENTE con DTOs.
    // No tiene ni idea de que existe una @Entity llamada Producto.

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> obtenerTodosLosProductos() {
        List<ProductoDTO> productos = productoService.obtenerTodosLosProductos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerProductoPorId(@PathVariable Long id) {
        return productoService.obtenerProductoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/productos
    @PostMapping
    // --- Concepto: Anotación @Valid ---
    // Esta anotación le dice a Spring: "Antes de ejecutar este método,
    // toma el objeto `productoDTO` que viene del @RequestBody y valida
    // TODAS las reglas (@NotEmpty, @Size, etc.) que tiene definidas en su clase".
    // Si alguna regla falla, Spring lanzará automáticamente una excepción
    // `MethodArgumentNotValidException`.
    public ResponseEntity<ProductoDTO> crearProducto(@Valid @RequestBody ProductoDTO productoDTO) {
        ProductoDTO nuevoProducto = productoService.guardarProducto(productoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    // PUT /api/productos/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @Valid @RequestBody ProductoDTO productoDTO) {
        // También añadimos @Valid aquí para asegurar que los datos de actualización sean correctos.
        ProductoDTO productoActualizado = productoService.actualizarProducto(id, productoDTO);
        return ResponseEntity.ok(productoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarProducto(@PathVariable Long id) {
        productoService.borrarProducto(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para simular la venta de un producto.
    // URL: POST /api/productos/{id}/vender?cantidad=X
    @PostMapping("/{id}/vender")
    public ResponseEntity<?> venderProducto(@PathVariable Long id, @RequestParam Integer cantidad) {
        try {
            ProductoDTO productoVendido = productoService.venderProducto(id, cantidad);
            return ResponseEntity.ok(productoVendido);
        } catch (ResourceNotFoundException e) {
            // Capturamos el error de "no encontrado" y devolvemos 404.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            // Capturamos el error de "stock insuficiente" y devolvemos 400.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            // Capturamos el error simulado final y devolvemos 500.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}


