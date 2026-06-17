-- liquibase formatted sql

-- changeset david:8
-- Propósito: Agregar el prefijo {bcrypt} requerido por Spring Security 6

UPDATE usuario 
SET password = '{bcrypt}' || password 
WHERE password NOT LIKE '{%}';