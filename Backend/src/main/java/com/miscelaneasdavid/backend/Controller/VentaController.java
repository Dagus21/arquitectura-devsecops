package com.miscelaneasdavid.backend.Controller;

import com.miscelaneasdavid.backend.dto.CheckoutRequestDTO;
import com.miscelaneasdavid.backend.dto.VentaDetalleDTO;
import com.miscelaneasdavid.backend.dto.VentaResumenDTO;
import com.miscelaneasdavid.backend.entity.Venta;
import com.miscelaneasdavid.backend.service.PaymentService;
import com.miscelaneasdavid.backend.service.VentaOnlineService;
import com.miscelaneasdavid.backend.service.VentaPosService;
import com.miscelaneasdavid.backend.service.VentaQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    // Inyectamos los 3 servicios especializados en lugar de un "God Object" (Servicio Dios)
    private final VentaOnlineService ventaOnlineService;
    private final VentaPosService ventaPosService;
    private final VentaQueryService ventaQueryService;
    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> procesarCheckout(
            @Valid @RequestBody CheckoutRequestDTO checkoutRequest,
            @AuthenticationPrincipal UserDetails userDetails 
    ) {
        try {
            Venta ventaCreada = ventaOnlineService.crearVenta(checkoutRequest, userDetails.getUsername());
            String urlPago = paymentService.createPreference(ventaCreada);
            return ResponseEntity.ok(Map.of("url", urlPago));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/fisica")
    public ResponseEntity<?> registrarVentaFisica(
            @Valid @RequestBody CheckoutRequestDTO checkoutRequest,
            @RequestParam(defaultValue = "EFECTIVO") String metodoPago,
            @RequestParam(required = false) String emailCliente,
            @RequestParam(required = false) String nombreCliente,
            @RequestParam(required = false) String telefonoCliente, 
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            VentaResumenDTO venta = ventaPosService.registrarVentaFisica(
                    checkoutRequest, userDetails.getUsername(), metodoPago, emailCliente, nombreCliente, telefonoCliente
            );
            return ResponseEntity.ok(venta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<VentaResumenDTO>> listarVentas() {
        return ResponseEntity.ok(ventaQueryService.obtenerTodasLasVentas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaDetalleDTO> obtenerDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(ventaQueryService.obtenerDetalleVenta(id));
    }

    @PostMapping("/{id}/anular")
    public ResponseEntity<?> anularVentaFisica(@PathVariable Long id) {
        try {
            ventaPosService.anularVentaFisica(id);
            return ResponseEntity.ok(Map.of("mensaje", "Venta anulada y stock devuelto"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}