package com.miscelaneasdavid.backend.Controller;

import com.miscelaneasdavid.backend.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        // Validar que venga algo
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo no puede estar vacío"));
        }

        try {
            String url = storageService.subirImagen(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}