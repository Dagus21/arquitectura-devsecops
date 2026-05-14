package com.miscelaneasdavid.backend.repository;

import com.miscelaneasdavid.backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    // Busca una venta previa con la misma llave
    Optional<Venta> findByIdempotencyKey(String idempotencyKey); 
}