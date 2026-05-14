package com.miscelaneasdavid.backend.service;

import com.miscelaneasdavid.backend.dto.CheckoutItemDTO;
import com.miscelaneasdavid.backend.dto.CheckoutRequestDTO;
import com.miscelaneasdavid.backend.entity.ItemVenta;
import com.miscelaneasdavid.backend.entity.Producto;
import com.miscelaneasdavid.backend.entity.Usuario;
import com.miscelaneasdavid.backend.entity.Venta;
import com.miscelaneasdavid.backend.repository.ProductoRepository;
import com.miscelaneasdavid.backend.repository.UsuarioRepository;
import com.miscelaneasdavid.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VentaOnlineService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Venta crearVenta(CheckoutRequestDTO request, String emailUsuario) {
        // Anti-Doble-Click (Idempotencia)
        Optional<Venta> ventaExistente = ventaRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (ventaExistente.isPresent()) {
            return ventaExistente.get(); 
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setFecha(LocalDateTime.now());
        venta.setEstado("PENDIENTE"); 
        venta.setCanal("ECOMMERCE");
        venta.setMetodoPago("NO_DEFINIDO"); 
        venta.setIdempotencyKey(request.getIdempotencyKey()); 

        BigDecimal totalVenta = BigDecimal.ZERO;
        List<ItemVenta> itemsVenta = new ArrayList<>();

        for (CheckoutItemDTO itemDTO : request.getItems()) {
            Producto producto = productoRepository.findById(itemDTO.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado ID: " + itemDTO.getIdProducto()));

            if (producto.getStock() < itemDTO.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }
            
            ItemVenta item = new ItemVenta();
            item.setProducto(producto);
            item.setCantidad(itemDTO.getCantidad());
            item.setPrecioUnitario(producto.getPrecioVenta());
            item.setVenta(venta);
            itemsVenta.add(item);

            BigDecimal subtotal = producto.getPrecioVenta().multiply(new BigDecimal(itemDTO.getCantidad()));
            totalVenta = totalVenta.add(subtotal);
        }

        venta.setItems(itemsVenta);
        venta.setTotalVenta(totalVenta);

        return ventaRepository.save(venta);
    }
}