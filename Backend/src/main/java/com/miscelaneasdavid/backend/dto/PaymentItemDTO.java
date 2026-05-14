package com.miscelaneasdavid.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PaymentItemDTO {
    private String id;
    private String title;
    private String description;
    private String pictureUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
}