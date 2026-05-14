-- liquibase formatted sql

-- changeset david:5
-- 1. Agregar llave de idempotencia a la tabla ventas
ALTER TABLE venta ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;

-- 2. Insertar usuarios iniciales para producción (La contraseña es: password)
-- Usamos ON CONFLICT DO NOTHING para que, si reinicias el servidor, no intente crearlos de nuevo.
INSERT INTO usuario (email, nombre, password, tipo_usuario, rol)
VALUES 
('admin@tienda.com', 'Administrador Principal', '$2a$12$wIMp0VBVzkOn0CSV5lHAWOr.eEHG4eF3nQWJLMt/OKMQ3NcFpfi.q', 'ADMINISTRADOR', 'ADMIN'),
('user@tienda.com', 'Cliente de Prueba', '$2a$12$wIMp0VBVzkOn0CSV5lHAWOr.eEHG4eF3nQWJLMt/OKMQ3NcFpfi.q', 'CLIENTE', 'USER')
ON CONFLICT (email) DO NOTHING;