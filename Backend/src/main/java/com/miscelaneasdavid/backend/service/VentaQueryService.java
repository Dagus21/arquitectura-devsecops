package com.miscelaneasdavid.backend.service;

import com.miscelaneasdavid.backend.dto.ItemVentaDTO;
import com.miscelaneasdavid.backend.dto.VentaDetalleDTO;
import com.miscelaneasdavid.backend.dto.VentaResumenDTO;
import com.miscelaneasdavid.backend.entity.Venta;
import com.miscelaneasdavid.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaQueryService {

    private final VentaRepository ventaRepository;

    public List<VentaResumenDTO> obtenerTodasLasVentas() {
        return ventaRepository.findAll().stream().map(venta -> {
            VentaResumenDTO dto = new VentaResumenDTO();
            dto.setIdVenta(venta.getIdVenta());
            dto.setFecha(venta.getFecha());
            dto.setTotalVenta(venta.getTotalVenta());
            dto.setEstado(venta.getEstado());
            dto.setMetodoPago(venta.getMetodoPago());
            dto.setIdTransaccion(venta.getIdTransaccion());

            if (venta.getUsuario() != null) {
                dto.setEmailUsuario(venta.getUsuario().getEmail());
                dto.setNombreUsuario(venta.getUsuario().getNombre());
            }

            dto.setCantidadItems(venta.getItems() != null ? venta.getItems().size() : 0);
            return dto;
        }).collect(Collectors.toList());
    }

    public VentaDetalleDTO obtenerDetalleVenta(Long idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        VentaDetalleDTO dto = new VentaDetalleDTO();
        dto.setIdVenta(venta.getIdVenta());
        dto.setFecha(venta.getFecha());
        dto.setTotalVenta(venta.getTotalVenta());
        dto.setEstado(venta.getEstado());
        dto.setMetodoPago(venta.getMetodoPago());

        if (venta.getUsuario() != null) {
            dto.setEmailUsuario(venta.getUsuario().getEmail());
            dto.setNombreUsuario(venta.getUsuario().getNombre());
            dto.setTelefonoUsuario(venta.getUsuario().getTelefono());
        }

        List<ItemVentaDTO> itemsDTO = venta.getItems().stream().map(item -> {
            ItemVentaDTO iDto = new ItemVentaDTO();
            iDto.setNombreProducto(item.getProducto().getNombre());
            iDto.setCantidad(item.getCantidad());
            iDto.setPrecioUnitario(item.getPrecioUnitario());
            iDto.setSubtotal(item.getPrecioUnitario().multiply(new BigDecimal(item.getCantidad())));
            return iDto;
        }).collect(Collectors.toList());

        dto.setItems(itemsDTO);
        return dto;
    }
}