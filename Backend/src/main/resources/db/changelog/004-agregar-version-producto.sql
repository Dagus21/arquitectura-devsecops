-- liquibase formatted sql

-- changeset david:4
-- Propósito: Agregar control de versiones para Optimistic Locking en productos
-- DEFAULT 0 asegura que los productos que ya creaste antes no queden con valor NULL
ALTER TABLE producto ADD COLUMN version BIGINT DEFAULT 0;