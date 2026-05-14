package com.miscelaneasdavid.backend.service;

import com.miscelaneasdavid.backend.dto.CheckoutItemDTO;
import com.miscelaneasdavid.backend.dto.CheckoutRequestDTO;
import com.miscelaneasdavid.backend.dto.VentaResumenDTO;
import com.miscelaneasdavid.backend.entity.ItemVenta;
import com.miscelaneasdavid.backend.entity.Producto;
import com.miscelaneasdavid.backend.entity.Rol;
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
public class VentaPosService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public VentaResumenDTO registrarVentaFisica(CheckoutRequestDTO request, String emailAdmin, String metodoPago, String emailCliente, String nombreCliente, String telefonoCliente) {
        Optional<Venta> ventaExistente = ventaRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (ventaExistente.isPresent()) return null;

        Usuario usuarioVenta;
        
        if (emailCliente != null && !emailCliente.isBlank()) {
            Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(emailCliente);
            if (usuarioExistente.isPresent()) {
                usuarioVenta = usuarioExistente.get();
                if (telefonoCliente != null && !telefonoCliente.isBlank()) {
                    usuarioVenta.setTelefono(telefonoCliente);
                    usuarioRepository.save(usuarioVenta);
                }
            } else {
                Usuario nuevo = new Usuario();
                nuevo.setEmail(emailCliente);
                nuevo.setNombre(nombreCliente != null && !nombreCliente.isBlank() ? nombreCliente : "Cliente POS");
                nuevo.setTelefono(telefonoCliente);
                nuevo.setPassword("{bcrypt}dummy_pos_password"); 
                nuevo.setTipoUsuario("CLIENTE");
                nuevo.setRol(Rol.USER);
                usuarioVenta = usuarioRepository.save(nuevo);
            }
        } else {
            usuarioVenta = usuarioRepository.findByEmail(emailAdmin).orElseThrow();
        }

        Venta venta = new Venta();
        venta.setUsuario(usuarioVenta);
        venta.setFecha(LocalDateTime.now());
        venta.setEstado("PAGADO"); 
        venta.setCanal("TIENDA_FISICA");
        venta.setMetodoPago(metodoPago);
        venta.setIdempotencyKey(request.getIdempotencyKey());

        BigDecimal totalVenta = BigDecimal.ZERO;
        List<ItemVenta> itemsVenta = new ArrayList<>();

        for (CheckoutItemDTO itemDTO : request.getItems()) {
            Producto producto = productoRepository.findById(itemDTO.getIdProducto()).orElseThrow();
            if (producto.getStock() < itemDTO.getCantidad()) throw new RuntimeException("Stock insuficiente");

            producto.setStock(producto.getStock() - itemDTO.getCantidad());
            if (producto.getStock() == 0) producto.setEstado("AGOTADO");
            productoRepository.save(producto);

            ItemVenta item = new ItemVenta();
            item.setProducto(producto);
            item.setCantidad(itemDTO.getCantidad());
            item.setPrecioUnitario(producto.getPrecioVenta());
            item.setVenta(venta);
            itemsVenta.add(item);

            totalVenta = totalVenta.add(producto.getPrecioVenta().multiply(new BigDecimal(itemDTO.getCantidad())));
        }

        venta.setItems(itemsVenta);
        venta.setTotalVenta(totalVenta);
        venta = ventaRepository.save(venta);

        VentaResumenDTO dto = new VentaResumenDTO();
        dto.setIdVenta(venta.getIdVenta());
        dto.setFecha(venta.getFecha());
        dto.setTotalVenta(venta.getTotalVenta());
        dto.setEstado(venta.getEstado());
        dto.setMetodoPago(venta.getMetodoPago());
        dto.setEmailUsuario(usuarioVenta.getEmail());
        dto.setNombreUsuario(usuarioVenta.getNombre());
        return dto;
    }

    @Transactional
    public void anularVentaFisica(Long idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        if ("CANCELADO".equals(venta.getEstado()) || "REEMBOLSADO".equals(venta.getEstado())) {
            throw new RuntimeException("La venta ya está anulada.");
        }

        if ("MERCADO_PAGO".equals(venta.getMetodoPago())) {
            throw new RuntimeException("No puedes anular pagos online desde aquí. Hazlo desde Mercado Pago.");
        }

        for (ItemVenta item : venta.getItems()) {
            Producto p = item.getProducto();
            p.setStock(p.getStock() + item.getCantidad());
            if ("AGOTADO".equals(p.getEstado()) && p.getStock() > 0) {
                p.setEstado("ACTIVO");
            }
            productoRepository.save(p);
        }

        venta.setEstado("CANCELADO");
        ventaRepository.save(venta);
    }
}