package com.miscelaneasdavid.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PaymentRequestDTO {
    private List<PaymentItemDTO> items;
}

