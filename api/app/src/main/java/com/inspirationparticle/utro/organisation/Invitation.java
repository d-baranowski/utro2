package com.inspirationparticle.utro.organisation;

import com.inspirationparticle.utro.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "invitation")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invitation {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by")
    private User invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_type", nullable = false, length = 20)
    private MemberType memberType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvitationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (expiresAt == null) {
            expiresAt = createdAt.plusSeconds(7 * 24 * 60 * 60); // 7 days expiration
        }
    }

    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        EXPIRED
    }
}
