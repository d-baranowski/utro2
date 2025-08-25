package com.inspirationparticle.utro.therapist.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class SpecializationDto {
    private UUID id;
    private String nameEng;
    private String namePl;
    private String descriptionEng;
    private String descriptionPl;
    private String category;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}