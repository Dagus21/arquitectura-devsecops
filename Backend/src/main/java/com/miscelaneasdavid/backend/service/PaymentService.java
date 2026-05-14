package com.miscelaneasdavid.backend.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.miscelaneasdavid.backend.entity.ItemVenta;
import com.miscelaneasdavid.backend.entity.Venta;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    // Dependencias limpias: Inyectamos nuestros nuevos micro-componentes
    private final WebhookValidator webhookValidator;
    private final OrderFulfillmentService orderFulfillmentService;

    @Value("${mercadopago.back-urls.success}")
    private String successUrl;

    @Value("${mercadopago.webhook-url}")
    private String webhookUrl;

    public String createPreference(Venta venta) {
        try {
            List<PreferenceItemRequest> items = new ArrayList<>();

            for (ItemVenta item : venta.getItems()) {
                PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                        .id(item.getProducto().getIdProducto().toString())
                        .title(item.getProducto().getNombre())
                        .pictureUrl(item.getProducto().getImagenUrl())
                        .quantity(item.getCantidad())
                        .currencyId("COP")
                        .unitPrice(item.getPrecioUnitario())
                        .build();
                items.add(itemRequest);
            }

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl)
                    .failure("https://miscelaneasdavid.shop/checkout/failure")
                    .pending("https://miscelaneasdavid.shop/checkout/pending")
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(venta.getIdVenta().toString())
                    .notificationUrl(webhookUrl)
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            return preference.getInitPoint();

        } catch (Exception e) {
            throw new RuntimeException("Error al crear preferencia MP", e);
        }
    }

    public boolean processWebhook(Map<String, Object> payload, String xSignature, String xRequestId) {
        
        System.out.println("\n════════════════ INICIO DEPURACIÓN WEBHOOK ════════════════");
        
        String topic = (String) payload.getOrDefault("topic", "");
        String type = (String) payload.getOrDefault("type", "");
        
        if ("merchant_order".equals(topic) || "merchant_order".equals(type)) {
            System.out.println("ℹ️ Evento ignorado (Merchant Order). No afecta el pago.");
            return true; 
        }

        // 1. Extraer ID del payload
        String dataId = null;
        if (payload.containsKey("data") && payload.get("data") instanceof Map) {
             Map<String, Object> data = (Map<String, Object>) payload.get("data");
             if (data.get("id") != null) dataId = String.valueOf(data.get("id"));
        } else if (payload.containsKey("id")) {
             if (payload.get("id") != null) dataId = String.valueOf(payload.get("id"));
        }

        if (dataId == null) {
            System.err.println("⚠️ Payload ignorado: No se encontró un ID válido.");
            return true; 
        }

        // 2. Validar firma usando nuestro nuevo componente (WebhookValidator)
        boolean isSignatureValid = webhookValidator.isSignatureValid(xSignature, xRequestId, dataId);
        
        if (!isSignatureValid) {
            System.err.println("⛔ ¡FIRMA INVÁLIDA! Los hashes no coinciden. Se rechaza la actualización.");
            return false; 
        }

        System.out.println("✅ ¡FIRMA VÁLIDA! Consultando a Mercado Pago...");

        // 3. Obtener el pago real y delegar a la lógica de base de datos
        try {
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(Long.parseLong(dataId));
            
            if (payment.getExternalReference() == null) {
                System.out.println("⚠️ Pago sin External Reference. Ignorando.");
                return true;
            }

            Long idVentaLocal = Long.parseLong(payment.getExternalReference());
            
            // Pasamos la responsabilidad a OrderFulfillmentService
            orderFulfillmentService.actualizarEstadoVenta(idVentaLocal, payment.getStatus(), payment.getId().toString());

        } catch (Exception e) {
            System.err.println("🔥 Error en lógica de negocio (BD/MP): " + e.getMessage());
        }

        System.out.println("════════════════ FIN DEPURACIÓN (EXITOSO) ════════════════\n");
        return true; 
    }
}