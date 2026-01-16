package com.miscelaneasdavid.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// --- Concepto: @ResponseStatus ---
// Esta anotación le dice a Spring que cuando esta excepción sea lanzada
// desde un controlador, la respuesta HTTP debe tener el código de estado
// que especifiquemos, en este caso, 404 Not Found.
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}