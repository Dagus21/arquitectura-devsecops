package com.miscelaneasdavid.backend.service;

import com.miscelaneasdavid.backend.dto.ProductoDTO;
import com.miscelaneasdavid.backend.dto.ProductoPublicoDTO;
import com.miscelaneasdavid.backend.entity.Producto;
import com.miscelaneasdavid.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.miscelaneasdavid.backend.exception.ResourceNotFoundException;
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

    // --- MÉTODOS DE MAPEO ---

    private ProductoDTO convertirA_DTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setIdProducto(producto.getIdProducto());
        dto.setIdReferencia(producto.getIdReferencia()); // Mapeo SKU
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecioVenta(producto.getPrecioVenta());
        dto.setPrecioCompra(producto.getPrecioCompra()); // Mapeo nuevo
        dto.setStock(producto.getStock());
        dto.setEstado(producto.getEstado()); // Mapeo nuevo
        dto.setImagenUrl(producto.getImagenUrl()); // Mapeo nuevo
        dto.setDescripcionPrivada(producto.getDescripcionPrivada());
        return dto;
    }

    private Producto convertirA_Entidad(ProductoDTO dto) {
        Producto producto = new Producto();
        // Nota: No seteamos ID aquí, eso lo maneja la BD o el método actualizar
        producto.setIdReferencia(dto.getIdReferencia());
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecioVenta(dto.getPrecioVenta());
        producto.setPrecioCompra(dto.getPrecioCompra());
        producto.setStock(dto.getStock());
        producto.setEstado(dto.getEstado());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setDescripcionPrivada(dto.getDescripcionPrivada());
        return producto;
    }

    private ProductoPublicoDTO convertirA_DTO_Publico(Producto producto) {
        ProductoPublicoDTO dto = new ProductoPublicoDTO();
        dto.setIdProducto(producto.getIdProducto());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecioVenta(producto.getPrecioVenta());
        dto.setEstado(producto.getEstado());
        dto.setImagenUrl(producto.getImagenUrl());
        dto.setDisponible(producto.getStock() > 0 && !"AGOTADO".equals(producto.getEstado()));
        
        // NUEVO: Pasamos el stock real
        dto.setStock(producto.getStock()); 
        return dto;
    }

    // --- NUEVO MÉTODO PÚBLICO ---
    public List<ProductoPublicoDTO> obtenerProductosPublicos() {
        return productoRepository.findAll().stream()
                .filter(p -> !"INACTIVO".equals(p.getEstado())) // Filtramos inactivos desde la BD
                .map(this::convertirA_DTO_Publico)
                .collect(Collectors.toList());
    }

    // --- LÓGICA DE NEGOCIO ---

    public List<ProductoDTO> obtenerTodosLosProductos() {
        return productoRepository.findAll().stream()
                .map(this::convertirA_DTO)
                .collect(Collectors.toList());
    }

    public Optional<ProductoDTO> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id)
                .map(this::convertirA_DTO);
    }

    public ProductoDTO guardarProducto(ProductoDTO productoDTO) {
        Producto producto = convertirA_Entidad(productoDTO);
        Producto productoGuardado = productoRepository.save(producto);
        return convertirA_DTO(productoGuardado);
    }

    public ProductoDTO actualizarProducto(Long id, ProductoDTO productoDTO) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // Actualizamos TODOS los campos permitidos
        productoExistente.setIdReferencia(productoDTO.getIdReferencia());
        productoExistente.setNombre(productoDTO.getNombre());
        productoExistente.setDescripcion(productoDTO.getDescripcion());
        
        // ---> ¡AÑADIR ESTA LÍNEA AQUÍ! <---
        productoExistente.setDescripcionPrivada(productoDTO.getDescripcionPrivada());
        
        productoExistente.setPrecioVenta(productoDTO.getPrecioVenta());
        productoExistente.setPrecioCompra(productoDTO.getPrecioCompra());
        productoExistente.setStock(productoDTO.getStock());
        
        // LÓGICA AUTOMÁTICA DE ESTADO
        if (productoDTO.getStock() > 0 && "AGOTADO".equals(productoExistente.getEstado())) {
            productoExistente.setEstado("ACTIVO");
        } else {
            productoExistente.setEstado(productoDTO.getEstado());
        }

        productoExistente.setImagenUrl(productoDTO.getImagenUrl());

        Producto productoActualizado = productoRepository.save(productoExistente);
        return convertirA_DTO(productoActualizado);
    }

    public void borrarProducto(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede borrar. Producto no encontrado con id: " + id);
        }
        productoRepository.deleteById(id);
    }

    @Transactional
    public ProductoDTO venderProducto(Long id, Integer cantidad) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        if (producto.getStock() < cantidad) {
            throw new IllegalStateException("No hay stock suficiente para realizar la venta.");
        }

        producto.setStock(producto.getStock() - cantidad);
        productoRepository.save(producto);

        // --- CORRECCIÓN: ELIMINÉ EL ERROR SIMULADO (if true throw...) ---
        // Ahora la venta sí se completará correctamente.

        return convertirA_DTO(producto);
    }
}