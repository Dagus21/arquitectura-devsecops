package com.miscelaneasdavid.backend.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket.name}")
    private String bucketName;

    // CAMBIO: Usamos la URL Pública para generar el String final
    @Value("${minio.public.url}")
    private String publicUrl;

    public String subirImagen(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            InputStream inputStream = file.getInputStream();
            
            // Subimos usando el cliente (que ya está configurado con la interna)
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // Generamos URL Pública: https://s3.miscelaneasdavid.shop/...
            String baseUrl = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
            return baseUrl + bucketName + "/" + fileName;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error MinIO: " + e.getMessage());
        }
    }
}