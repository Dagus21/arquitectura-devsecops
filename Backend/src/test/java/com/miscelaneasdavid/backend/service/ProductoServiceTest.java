package com.miscelaneasdavid.backend.service;

import com.miscelaneasdavid.backend.dto.ProductoDTO;
import com.miscelaneasdavid.backend.entity.Producto;
import com.miscelaneasdavid.backend.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal; // Importante
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto producto;
    private ProductoDTO productoDTO;

    @BeforeEach
    void setUp() {
        // CORRECCIÓN: Usar los nuevos setters y BigDecimal
        producto = new Producto();
        producto.setIdProducto(1L); // Antes setId
        producto.setNombre("Gorro de Lana");
        producto.setDescripcion("Un gorro cálido");
        producto.setPrecioVenta(new BigDecimal("25.00")); // Antes setPrecio(Double)
        producto.setStock(100);

        productoDTO = new ProductoDTO();
        productoDTO.setIdProducto(1L); // Antes setId
        productoDTO.setNombre("Gorro de Lana");
        productoDTO.setDescripcion("Un gorro cálido");
        productoDTO.setPrecioVenta(new BigDecimal("25.00")); // Antes setPrecio
        productoDTO.setStock(100);
    }

    @Test
    void cuandoObtenerTodosLosProductosEsLlamado_debeDevolverListaDeDTOs() {
        when(productoRepository.findAll()).thenReturn(Collections.singletonList(producto));
        List<ProductoDTO> resultado = productoService.obtenerTodosLosProductos();
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Gorro de Lana", resultado.get(0).getNombre());
    }

    @Test
    void cuandoObtenerProductoPorIdExistente_debeDevolverProductoDTO() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        Optional<ProductoDTO> resultado = productoService.obtenerProductoPorId(1L);
        assertTrue(resultado.isPresent());
        assertEquals(producto.getNombre(), resultado.get().getNombre());
        verify(productoRepository, times(1)).findById(1L);
    }

    @Test
    void cuandoGuardarProducto_debeDevolverProductoGuardadoDTO() {
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);
        ProductoDTO resultado = productoService.guardarProducto(productoDTO);
        assertNotNull(resultado);
        assertEquals(productoDTO.getNombre(), resultado.getNombre());
    }
}