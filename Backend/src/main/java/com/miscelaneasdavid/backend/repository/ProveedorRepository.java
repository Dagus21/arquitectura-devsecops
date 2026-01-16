package com.miscelaneasdavid.backend.repository;

import com.miscelaneasdavid.backend.entity.Proveedor; // O Venta, o ItemVenta
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
}