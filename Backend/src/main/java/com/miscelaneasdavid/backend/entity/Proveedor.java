package com.miscelaneasdavid.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProveedor;
    
    private String nombre;
    private String telefono;
}