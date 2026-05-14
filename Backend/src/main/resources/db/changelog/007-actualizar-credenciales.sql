-- liquibase formatted sql

-- changeset david:7
-- Propósito: Actualizar contraseñas de prueba a credenciales seguras de producción

-- Actualizar el Administrador (Reemplaza el correo y el hash)
UPDATE usuario 
SET email = 'useradmin@gmail.com', 
    password = '$2a$12$h.0Ap2JpQ9mY5cs6qk70mur/GcricBduMpEfR4SsZ9Zgz2magH/wq' 
WHERE email = 'admin@tienda.com';

-- Actualizar el Usuario Cliente de prueba (Reemplaza el correo y el hash)
UPDATE usuario 
SET email = 'usertest@gmail.com', 
    password = '$2a$12$dv0b0wrW5CQsnyPCs.heI.yMV3HThIaEYwyZHlpdMES/L3EBsyaQa' 
WHERE email = 'user@tienda.com';