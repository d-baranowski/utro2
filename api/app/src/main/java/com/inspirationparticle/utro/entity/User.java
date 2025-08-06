package com.inspirationparticle.utro.entity;

import com.github.ksuid.Ksuid;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "\"user\"")
public class User {
    @Id
    @Column(length = 27)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false)
    private String provider = "local";

    @Column(name = "provider_id")
    private String providerId;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrganisationMember> organisationMemberships = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public Set<OrganisationMember> getOrganisationMemberships() {
        return organisationMemberships;
    }

    public void setOrganisationMemberships(Set<OrganisationMember> organisationMemberships) {
        this.organisationMemberships = organisationMemberships;
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

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}