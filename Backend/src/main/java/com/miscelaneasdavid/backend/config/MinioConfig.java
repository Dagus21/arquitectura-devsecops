package com.miscelaneasdavid.backend.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    // CAMBIO: Usamos la URL Interna para la conexión
    @Value("${minio.internal.url}") 
    private String minioInternalUrl;

    @Value("${minio.access.key}")
    private String accessKey;

    @Value("${minio.secret.key}")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(minioInternalUrl) // Conecta directo al VPS (VPN), evita Cloudflare
                .credentials(accessKey, secretKey)
                .build();
    }
}