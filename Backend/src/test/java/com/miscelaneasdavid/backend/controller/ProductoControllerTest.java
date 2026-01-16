package com.miscelaneasdavid.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miscelaneasdavid.backend.Controller.ProductoController;
import com.miscelaneasdavid.backend.config.SecurityConfig;
import com.miscelaneasdavid.backend.dto.ProductoDTO;
import com.miscelaneasdavid.backend.service.JwtService;
import com.miscelaneasdavid.backend.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Collections;
import java.util.Optional;

import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductoController.class)
@Import(SecurityConfig.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoService productoService;

    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void cuandoSeLlamaAGetTodosLosProductos_debeDevolverListaDeProductos() throws Exception {
        // 1. Arrange
        ProductoDTO productoDTO = new ProductoDTO();
        // CORRECCIÓN: Usamos setIdProducto en lugar de setId
        productoDTO.setIdProducto(1L); 
        productoDTO.setNombre("Gorro de Prueba");
        
        when(productoService.obtenerTodosLosProductos()).thenReturn(Collections.singletonList(productoDTO));

        // 2. Act
        ResultActions respuesta = mockMvc.perform(get("/api/productos"));

        // 3. Assert
        respuesta.andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$[0].nombre", is("Gorro de Prueba")));
    }

    @Test
    void cuandoSeLlamaAGetProductoPorIdExistente_debeDevolverProducto() throws Exception {
        // Arrange
        Long productoId = 1L;
        ProductoDTO productoDTO = new ProductoDTO();
        // CORRECCIÓN: Usamos setIdProducto
        productoDTO.setIdProducto(productoId);
        productoDTO.setNombre("Producto Encontrado");
        
        when(productoService.obtenerProductoPorId(productoId)).thenReturn(Optional.of(productoDTO));

        // Act
        ResultActions respuesta = mockMvc.perform(get("/api/productos/{id}", productoId));

        // Assert
        respuesta.andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre", is("Producto Encontrado")));
    }

    @Test
    void cuandoSeLlamaAGetProductoPorIdNoExistente_debeDevolverNotFound() throws Exception {
        // Arrange
        Long productoId = 999L;
        when(productoService.obtenerProductoPorId(productoId)).thenReturn(Optional.empty());

        // Act
        ResultActions respuesta = mockMvc.perform(get("/api/productos/{id}", productoId));

        // Assert
        respuesta.andExpect(status().isNotFound());
    }
}