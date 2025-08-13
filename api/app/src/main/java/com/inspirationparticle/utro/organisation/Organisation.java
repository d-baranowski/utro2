package com.inspirationparticle.utro.organisation;

import com.github.ksuid.Ksuid;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.Set;
import java.util.HashSet;

@Setter
@Getter
@Entity
@Table(name = "organisation")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organisation {
    @Id
    @Column(length = 27)
    private String id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "organisation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrganisationMember> members = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = Ksuid.newKsuid().toString();
        }
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

}