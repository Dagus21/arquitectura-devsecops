package com.tudominio.tienda_api.service;

import com.tudominio.tienda_api.dto.ProductoDTO;
import com.tudominio.tienda_api.entity.Producto;
import com.tudominio.tienda_api.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tudominio.tienda_api.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    @Autowired
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // --- Métodos de Mapeo (privados) ---

    // Convierte una Entidad Producto a un ProductoDTO
    private ProductoDTO convertirA_DTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecio(producto.getPrecio());
        dto.setStock(producto.getStock());
        return dto;
    }

    // Convierte un ProductoDTO a una Entidad Producto
    private Producto convertirA_Entidad(ProductoDTO dto) {
        Producto producto = new Producto();
        // OJO: No mapeamos el ID desde el DTO al crear o actualizar,
        // para que no pueda ser manipulado por el cliente. El ID se maneja
        // por la URL o lo genera la BBDD.
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        return producto;
    }


    // --- Lógica de Negocio (ahora trabaja con DTOs) ---

    public List<ProductoDTO> obtenerTodosLosProductos() {
        // Obtenemos las entidades de la BBDD.
        List<Producto> productos = productoRepository.findAll();
        // Las convertimos a una lista de DTOs para devolverlas al controlador.
        // --- Concepto: Java Streams ---
        // .stream() convierte la lista en un "flujo" de datos.
        // .map(this::convertirA_DTO) aplica la función de conversión a cada elemento del flujo.
        // .collect(Collectors.toList()) recoge los resultados en una nueva lista.
        return productos.stream()
                .map(this::convertirA_DTO)
                .collect(Collectors.toList());
    }

    public Optional<ProductoDTO> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id)
                .map(this::convertirA_DTO); // Si el Optional tiene un valor, lo mapea a DTO.
    }

    public ProductoDTO guardarProducto(ProductoDTO productoDTO) {
        // Convertimos el DTO que recibimos a una entidad para poder guardarla.
        Producto producto = convertirA_Entidad(productoDTO);
        Producto productoGuardado = productoRepository.save(producto);
        // Devolvemos el resultado convertido de nuevo a DTO.
        return convertirA_DTO(productoGuardado);
    }

    public ProductoDTO actualizarProducto(Long id, ProductoDTO productoDTO) {
        // Buscamos la entidad existente.
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // Actualizamos los campos.
        productoExistente.setNombre(productoDTO.getNombre());
        productoExistente.setDescripcion(productoDTO.getDescripcion());
        productoExistente.setPrecio(productoDTO.getPrecio());
        productoExistente.setStock(productoDTO.getStock());

        Producto productoActualizado = productoRepository.save(productoExistente);
        return convertirA_DTO(productoActualizado);
    }

    public void borrarProducto(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede borrar. Producto no encontrado con id: " + id);
        }
        productoRepository.deleteById(id);
    }
    // ========================================================================
    //              EJEMPLO DE MÉTODO TRANSACCIONAL
    // ========================================================================

    // --- Concepto: Anotación @Transactional ---
    // Al anotar este método, Spring envolverá su ejecución en una transacción de base de datos.
    // 1. Inicia la transacción.
    // 2. Ejecuta el código del método.
    // 3. Si el método termina normalmente, hace COMMIT (los cambios se guardan).
    // 4. Si el método lanza una RuntimeException (o Error), hace ROLLBACK (los cambios se deshacen).
    @Transactional
    public ProductoDTO venderProducto(Long id, Integer cantidad) {
        System.out.println("Intentando vender " + cantidad + " unidad(es) del producto con ID: " + id);

        // Buscamos el producto. Si no existe, orElseThrow lanzará la excepción y
        // la transacción hará rollback (aunque no se haya hecho ningún cambio aún).
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        System.out.println("Stock actual: " + producto.getStock());

        // Validamos si hay stock suficiente.
        if (producto.getStock() < cantidad) {
            // Lanzamos una excepción de negocio. Al ser una RuntimeException,
            // esto provocará un rollback automático.
            throw new IllegalStateException("No hay stock suficiente para realizar la venta.");
        }

        // Restamos el stock. Este es nuestro primer cambio en la base de datos.
        producto.setStock(producto.getStock() - cantidad);
        productoRepository.save(producto); // Guardamos el cambio de stock

        System.out.println("Stock actualizado a: " + producto.getStock());
        System.out.println("... Realizando otras operaciones, como registrar la venta...");

        // --- SIMULACIÓN DE UN ERROR INESPERADO ---
        // Vamos a simular que después de actualizar el stock, ocurre otro error.
        if (true) { // Lo forzamos a que siempre ocurra para el ejemplo.
            System.out.println("¡ERROR! Falló la segunda parte de la operación (ej: el servicio de facturación no responde).");
            throw new RuntimeException("Error simulado después de actualizar el stock.");
        }

        // Esta parte nunca se alcanzará en nuestro ejemplo.
        System.out.println("La venta se ha completado con éxito.");

        // Devolvemos el DTO con el stock supuestamente actualizado.
        return convertirA_DTO(producto);
    }
}


