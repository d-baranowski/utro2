package com.inspirationparticle.utro.entity;

import com.github.ksuid.Ksuid;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "organisation")
public class Organisation {
    @Id
    @Column(length = 27)
    private String id;

    @Column(nullable = false)
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<OrganisationMember> getMembers() {
        return members;
    }

    public void setMembers(Set<OrganisationMember> members) {
        this.members = members;
    }
}