package com.miscelaneasdavid.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class WebhookValidator {

    @Value("${mercadopago.webhook-secret}")
    private String webhookSecret;

    public boolean isSignatureValid(String xSignature, String xRequestId, String dataId) {
        if (webhookSecret == null || webhookSecret.isEmpty() || xSignature == null) {
            System.err.println("❌ ERROR: Secret o Signature nulos.");
            return false;
        }

        String ts = null;
        String hashRecibido = null;

        // Extraer 'ts' y 'v1' del header que envía Mercado Pago
        for (String part : xSignature.split(",")) {
            String[] keyValue = part.split("=", 2);
            if (keyValue.length == 2) {
                if (keyValue[0].trim().equals("ts")) ts = keyValue[1].trim();
                if (keyValue[0].trim().equals("v1")) hashRecibido = keyValue[1].trim();
            }
        }

        if (ts == null || hashRecibido == null) return false;

        // Validar Hash
        String manifest = String.format("id:%s;request-id:%s;ts:%s;", dataId, xRequestId, ts);
        try {
            String hashCalculado = hmacSha256(webhookSecret, manifest);
            return hashCalculado.equals(hashRecibido);
        } catch (Exception e) {
            System.err.println("❌ Error criptográfico: " + e.getMessage());
            return false;
        }
    }

    // --- FUNCIÓN UTILITARIA DE CRIPTOGRAFÍA ---
    private String hmacSha256(String key, String data) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        // Java 17+ (Usas Java 21, así que esto es nativo y eficiente)
        return HexFormat.of().formatHex(hmacBytes);
    }
}