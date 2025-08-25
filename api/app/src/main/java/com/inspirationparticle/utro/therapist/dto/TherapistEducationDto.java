package com.inspirationparticle.utro.therapist.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TherapistEducationDto {
    private UUID id;
    private String degree;
    private String fieldOfStudy;
    private String institution;
    private String country;
    private Integer startYear;
    private Integer graduationYear;
    private Boolean isCompleted;
    private String thesisTitle;
    private String honors;
    private Integer displayOrder;
    private Instant createdAt;
    private Instant updatedAt;
}