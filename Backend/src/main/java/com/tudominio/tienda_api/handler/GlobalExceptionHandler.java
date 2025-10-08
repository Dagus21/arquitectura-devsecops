package com.tudominio.tienda_api.handler;

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

    // Aquí podríamos añadir más métodos @ExceptionHandler para otros tipos de excepciones,
    // como nuestra ResourceNotFoundException, para centralizar todo el manejo de errores.
}