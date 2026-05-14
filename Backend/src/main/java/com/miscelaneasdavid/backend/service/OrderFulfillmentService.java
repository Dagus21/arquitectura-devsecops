package com.miscelaneasdavid.backend.service;

import com.miscelaneasdavid.backend.entity.ItemVenta;
import com.miscelaneasdavid.backend.entity.Producto;
import com.miscelaneasdavid.backend.entity.Venta;
import com.miscelaneasdavid.backend.repository.ProductoRepository;
import com.miscelaneasdavid.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderFulfillmentService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public void actualizarEstadoVenta(Long idVentaLocal, String paymentStatus, String idTransaccion) {
        Venta venta = ventaRepository.findById(idVentaLocal)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada: " + idVentaLocal));

        System.out.println("🔄 Procesando Venta #" + idVentaLocal + " | Estado actual: " + venta.getEstado() + " | Estado MP: " + paymentStatus);

        if ("PAGADO".equals(venta.getEstado()) && "approved".equals(paymentStatus)) {
            System.out.println("⏹️ Venta ya pagada previamente. Ignorando webhook repetido de pago.");
            return;
        }
        
        if ("REEMBOLSADO".equals(venta.getEstado()) || "CANCELADO".equals(venta.getEstado())) {
            System.out.println("⏹️ Venta ya procesada como cancelada/reembolsada. Ignorando webhook.");
            return;
        }

        if ("approved".equals(paymentStatus)) {
            venta.setEstado("PAGADO");
            venta.setIdTransaccion(idTransaccion);
            venta.setMetodoPago("MERCADO_PAGO");
            
            if (venta.getItems() != null) {
                for (ItemVenta item : venta.getItems()) {
                    Producto producto = item.getProducto();
                    int nuevoStock = producto.getStock() - item.getCantidad();
                    if (nuevoStock <= 0) {
                        nuevoStock = 0;
                        producto.setEstado("AGOTADO");
                    }
                    producto.setStock(nuevoStock);
                    productoRepository.save(producto);
                }
            }
            System.out.println("✅ ¡ÉXITO! Venta aprobada y stock descontado.");
            
        } else if ("rejected".equals(paymentStatus)) {
            venta.setEstado("RECHAZADO");
            System.out.println("❌ Pago rechazado.");
            
        } else if ("refunded".equals(paymentStatus) || "cancelled".equals(paymentStatus)) {
            
            if ("PAGADO".equals(venta.getEstado()) && "refunded".equals(paymentStatus)) {
                if (venta.getItems() != null) {
                    for (ItemVenta item : venta.getItems()) {
                        Producto producto = item.getProducto();
                        producto.setStock(producto.getStock() + item.getCantidad());
                        
                        if (producto.getStock() > 0 && "AGOTADO".equals(producto.getEstado())) {
                            producto.setEstado("ACTIVO");
                        }
                        productoRepository.save(producto);
                    }
                }
                System.out.println("⏪ Dinero reembolsado (Refund). Stock devuelto al inventario.");
            } else if ("cancelled".equals(paymentStatus)) {
                System.out.println("🚫 Pago cancelado antes de concretarse.");
            }
            
            venta.setEstado("refunded".equals(paymentStatus) ? "REEMBOLSADO" : "CANCELADO");
        }
        
        ventaRepository.save(venta);
        System.out.println("💾 Base de datos actualizada.");
    }
}