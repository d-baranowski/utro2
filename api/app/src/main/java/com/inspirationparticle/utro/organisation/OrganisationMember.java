package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
@Entity
@Table(name = "organisation_member")
@IdClass(OrganisationMemberId.class)
public class OrganisationMember {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "member_type", nullable = false, length = 20)
    private MemberType memberType;
    
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;
    
    @PrePersist
    protected void onCreate() {
        joinedAt = Instant.now();
    }

}

