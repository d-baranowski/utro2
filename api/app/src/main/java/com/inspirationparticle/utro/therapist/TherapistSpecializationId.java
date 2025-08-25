package com.inspirationparticle.utro.therapist;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TherapistSpecializationId implements Serializable {
    @Column(name = "therapist_id", columnDefinition = "uuid")
    private UUID therapistId;

    @Column(name = "specialization_id", columnDefinition = "uuid")
    private UUID specializationId;
}