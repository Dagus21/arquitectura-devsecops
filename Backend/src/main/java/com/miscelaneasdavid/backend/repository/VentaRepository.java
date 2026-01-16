package com.miscelaneasdavid.backend.repository;

import com.miscelaneasdavid.backend.entity.Venta; // O Venta, o ItemVenta
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
}