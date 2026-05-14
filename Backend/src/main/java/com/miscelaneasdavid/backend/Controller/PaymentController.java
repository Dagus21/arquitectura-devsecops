package com.miscelaneasdavid.backend.Controller;

import com.miscelaneasdavid.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<String> recibirNotificacion(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId
    ) {
        // 1. Validación temprana: Si no hay firma, rechazamos (Security First)
        if (xSignature == null || xRequestId == null) {
            System.err.println("⛔ Intento de acceso al Webhook sin firma.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Firma faltante");
        }

        System.out.println("🔔 Webhook recibido. Validando firma...");

        try {
            // 2. Delegamos la validación y el procesamiento al servicio
            boolean esValido = paymentService.processWebhook(payload, xSignature, xRequestId);

            if (esValido) {
                return ResponseEntity.ok("OK");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Firma inválida");
            }

        } catch (Exception e) {
            System.err.println("Error procesando webhook: " + e.getMessage());
            // Respondemos OK para que MP deje de reintentar si es un error lógico nuestro,
            // pero logueamos el error.
            return ResponseEntity.ok("Error procesado");
        }
    }
}