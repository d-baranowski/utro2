package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.organisation.Organisation;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "offer")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Offer {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "name_eng", columnDefinition = "TEXT")
    private String nameEng;

    @Column(name = "name_pl", columnDefinition = "TEXT")
    private String namePl;

    @Column(name = "description_eng", columnDefinition = "TEXT")
    private String descriptionEng;

    @Column(name = "description_pl", columnDefinition = "TEXT")
    private String descriptionPl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;

    @Column(name = "profile_image", columnDefinition = "bytea")
    private byte[] profileImage;

    @Column(name = "profile_image_mime_type")
    private String profileImageMimeType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false, updatable = false)
    private Instant updatedAt;

}
