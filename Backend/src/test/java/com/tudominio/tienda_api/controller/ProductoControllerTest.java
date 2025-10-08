package com.tudominio.tienda_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tudominio.tienda_api.Controller.ProductoController;
import com.tudominio.tienda_api.config.SecurityConfig;
import com.tudominio.tienda_api.dto.ProductoDTO;
import com.tudominio.tienda_api.service.JwtService;
import com.tudominio.tienda_api.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// 1. SE ELIMINA LA IMPORTACIÓN ANTIGUA
// import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
// 2. SE AÑADE LA NUEVA IMPORTACIÓN PARA @MockitoBean
import org.springframework.test.context.bean.override.mockito.MockitoBean;


import java.util.Collections;
import java.util.Optional;

import static org.hamcrest.CoreMatchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/*
 * ========================================================================
 *              PRUEBAS DE INTEGRACIÓN PARA ProductoController (MODERNAS)
 * ========================================================================
 */

// NOTA: Aquí debería ir el controlador que estás probando, no la clase de prueba misma.
// Lo he corregido a ProductoController.class
@WebMvcTest(ProductoController.class)
@Import(SecurityConfig.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // --- EXPLICACIÓN DE @MockitoBean ---
    //
    // @MockitoBean es la anotación moderna que reemplaza a la antigua @MockBean.
    // Le dice a Spring que cree un "mock" de esta clase y lo reemplace
    // en el contexto de la aplicación de prueba. Sigue siendo necesaria porque
    // @WebMvcTest no carga la capa de servicio, y necesitamos simularla.

    // 3. SE REEMPLAZA @MockBean POR @MockitoBean
    @MockitoBean
    private ProductoService productoService;

    // También actualizamos los mocks necesarios para la configuración de seguridad.
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
        productoDTO.setId(1L);
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
        productoDTO.setId(productoId);
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