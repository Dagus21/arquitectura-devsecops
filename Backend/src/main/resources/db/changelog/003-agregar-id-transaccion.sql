-- liquibase formatted sql

-- changeset david:3
ALTER TABLE venta ADD COLUMN id_transaccion VARCHAR(255);

-- Opcional: Si quieres permitir que metodo_pago sea nulo al inicio (ya que al crear la venta aun no se ha pagado)
-- ALTER TABLE venta ALTER COLUMN metodo_pago DROP NOT NULL;