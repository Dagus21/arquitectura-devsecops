package com.miscelaneasdavid.backend.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/*
 * ========================================================================
 *              MANEJADOR GLOBAL DE EXCEPCIONES
 * ========================================================================
 */

// --- Concepto: Anotación @ControllerAdvice ---
// Marca esta clase como un "consejero" global para todos los controladores.
// Spring la usará para interceptar excepciones que ocurran en cualquier @RestController.
@ControllerAdvice
public class GlobalExceptionHandler {

    // --- Concepto: Anotación @ExceptionHandler ---
    // Le dice a Spring: "Cuando una excepción del tipo `MethodArgumentNotValidException`
    // (que es la que se lanza cuando falla el @Valid) ocurra en CUALQUIER controlador,
    // no ejecutes el manejo de errores por defecto. En su lugar, ejecuta ESTE método".
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Creamos un mapa para almacenar los errores de una forma limpia (campo -> mensaje).
        Map<String, String> errors = new HashMap<>();

        // La excepción `ex` contiene una lista de todos los errores de validación que ocurrieron.
        // Iteramos sobre ellos.
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Devolvemos una respuesta HTTP 400 Bad Request con el mapa de errores en el cuerpo.
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // --- NUEVO: ESCUDO GLOBAL CATCH-ALL ---
    // Atrapa cualquier error inesperado en tiempo de ejecución (Ej: NullPointer, Caídas de BD)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllUncaughtException(Exception ex) {
        // 1. Registramos el error REAL en nuestros logs internos (consola de Dokploy)
        // Usamos System.err o un Logger para que el desarrollador pueda depurarlo.
        System.err.println("🚨 [ERROR CRÍTICO NO CONTROLADO]: " + ex.getMessage());
        ex.printStackTrace(); // Esto solo se verá en el servidor, jamás en la web

        // 2. Creamos una respuesta genérica, segura y amigable para el cliente (Frontend/Hacker)
        Map<String, String> safeResponse = new HashMap<>();
        safeResponse.put("error", "Error interno del servidor. Por favor, intente más tarde.");
        
        // 3. Devolvemos HTTP 500
        return new ResponseEntity<>(safeResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    
}