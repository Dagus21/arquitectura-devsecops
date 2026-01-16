-- liquibase formatted sql

-- changeset david:2
-- Comentario: Implementación del ERD completo

-- BORRAR TABLAS VIEJAS (Orden inverso para evitar errores de Foreign Keys)
DROP TABLE IF EXISTS item_venta CASCADE;
DROP TABLE IF EXISTS venta CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS proveedor CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE; 
DROP TABLE IF EXISTS usuario CASCADE;

-- CREAR TABLAS NUEVAS
CREATE TABLE proveedor (
    id_proveedor BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

CREATE TABLE usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255),
    documento VARCHAR(20) UNIQUE,
    id_google VARCHAR(100) UNIQUE,
    tipo_usuario VARCHAR(20) NOT NULL,
    rol VARCHAR(20) NOT NULL
);

CREATE TABLE producto (
    id_producto BIGSERIAL PRIMARY KEY,
    id_referencia VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    stock INTEGER NOT NULL,
    precio_venta DECIMAL(12,2) NOT NULL,
    precio_compra DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    imagen_url VARCHAR(255),
    proveedor_id BIGINT,
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id_proveedor)
);

CREATE TABLE venta (
    id_venta BIGSERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_venta DECIMAL(12,2) NOT NULL,
    canal VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    usuario_id BIGINT,
    CONSTRAINT fk_venta_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

CREATE TABLE item_venta (
    id_item_venta BIGSERIAL PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    CONSTRAINT fk_item_venta FOREIGN KEY (venta_id) REFERENCES venta(id_venta),
    CONSTRAINT fk_item_producto FOREIGN KEY (producto_id) REFERENCES producto(id_producto)
);