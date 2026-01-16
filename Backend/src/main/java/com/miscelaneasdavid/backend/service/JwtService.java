package com.miscelaneasdavid.backend.service;

// --- EXPLICACIÓN DE LAS LIBRERÍAS (IMPORTS) ---
// Clases de la librería JJWT para manejar la lógica de los tokens.
import io.jsonwebtoken.Claims; // Representa el "payload" o cuerpo del JWT (los datos dentro del token).
import io.jsonwebtoken.Jwts; // Es la clase principal de la librería, usada para crear y leer JWTs.
import io.jsonwebtoken.SignatureAlgorithm; // Define el algoritmo de firma que usaremos (HS256).
import io.jsonwebtoken.io.Decoders; // Utilidad para decodificar la clave secreta desde Base64.
import io.jsonwebtoken.security.Keys; // Utilidad para crear una instancia segura de la clave de firma.

// Clases de Spring Security para interactuar con los detalles del usuario.
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key; // Interfaz de Java para representar claves criptográficas.
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

// La anotación @Service marca esta clase como un Bean de servicio de Spring.
@Service
public class JwtService {

    // --- CLAVE SECRETA ---
    // Esta es la clave que solo el servidor conoce. Se usa para "firmar" el JWT y verificar
    // que no ha sido modificado. Si alguien intenta cambiar el contenido del token, la firma
    // no coincidirá y el token será rechazado.
    // ¡IMPORTANTE! En un proyecto de producción, NUNCA debe estar aquí. Debe cargarse
    // desde un lugar seguro, como las variables de entorno o el archivo application.properties.
    private static final String SECRET_KEY = "U3VwZXJEdXBlclNlY3JldEtleUZvclRpZW5kYUFwaTEyMzQ1Njc4OTA=";

    /**
     * Genera un token JWT para un usuario autenticado.
     * @param userDetails El objeto de Spring Security que contiene los detalles del usuario.
     * @return Un String que es el token JWT.
     */
    public String generateToken(UserDetails userDetails) {
        // Llama al método sobrecargado con un mapa de "claims" vacío.
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Genera un token JWT con claims adicionales.
     * @param extraClaims Un mapa de datos extra que queramos añadir al payload del token.
     * @param userDetails Los detalles del usuario.
     * @return El token JWT.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder() // Inicia la construcción del JWT.
                .setClaims(extraClaims) // Añade los claims extra.
                .setSubject(userDetails.getUsername()) // Establece el "sujeto" del token (quién es).
                .setIssuedAt(new Date(System.currentTimeMillis())) // Fecha y hora de creación.
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Fecha de caducidad (10 horas).
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Firma el token usando nuestra clave secreta y el algoritmo HS256.
                .compact(); // Finaliza la construcción y lo serializa a un String.
    }

    /**
     * Valida si un token JWT es correcto y pertenece al usuario.
     * @param token El token a validar.
     * @param userDetails El usuario contra el que se compara.
     * @return `true` si el token es válido, `false` en caso contrario.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // Extraemos el username del token.
        // Comprobamos que el username del token coincide y que el token no ha expirado.
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // --- MÉTODOS PRIVADOS DE UTILIDAD ---

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date()); // Comprueba si la fecha de expiración es anterior a la fecha actual.
    }

    private Date extractExpiration(String token) {
        // Extrae el claim específico de la fecha de expiración.
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrae el nombre de usuario (el "subject") del token JWT.
     * @param token El token JWT.
     * @return El nombre de usuario.
     */
    public String extractUsername(String token) {
        // Utiliza una referencia a método (Claims::getSubject) para extraer el "subject".
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Método genérico para extraer cualquier claim (dato) del payload del token.
     * @param token El token JWT.
     * @param claimsResolver Una función que especifica cómo extraer el claim deseado.
     * @return El claim extraído.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token); // Primero parseamos todos los claims.
        return claimsResolver.apply(claims); // Luego aplicamos la función para obtener el dato específico.
    }

    // Parsea el token y extrae todo su payload (cuerpo).
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Necesita la clave para verificar la firma antes de leer.
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Convierte nuestra clave secreta en Base64 a un objeto Key que la librería pueda usar.
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}