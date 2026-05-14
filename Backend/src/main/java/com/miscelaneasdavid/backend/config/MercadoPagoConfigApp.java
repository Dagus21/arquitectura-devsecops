package com.miscelaneasdavid.backend.config;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MercadoPagoConfigApp {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        // Se ejecuta automáticamente al arrancar Spring Boot
        MercadoPagoConfig.setAccessToken(accessToken);
        System.out.println("✅ Mercado Pago SDK inicializado correctamente.");
    }
}