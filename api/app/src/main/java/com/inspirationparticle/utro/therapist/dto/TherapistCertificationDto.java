package com.inspirationparticle.utro.therapist.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TherapistCertificationDto {
    private UUID id;
    private String name;
    private String issuingOrganization;
    private String credentialId;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private Boolean isActive;
    private String verificationUrl;
    private String certificationLevel;
    private Integer hoursCompleted;
    private Integer displayOrder;
    private Instant createdAt;
    private Instant updatedAt;
}