package com.inspirationparticle.utro.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.io.Serializable;

@Entity
@Table(name = "organisation_member")
@IdClass(OrganisationMemberId.class)
public class OrganisationMember {
    
    public enum MemberType {
        ADMINISTRATOR,
        MEMBER
    }
    
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Organisation getOrganisation() {
        return organisation;
    }
    
    public void setOrganisation(Organisation organisation) {
        this.organisation = organisation;
    }
    
    public MemberType getMemberType() {
        return memberType;
    }
    
    public void setMemberType(MemberType memberType) {
        this.memberType = memberType;
    }
    
    public Instant getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}

class OrganisationMemberId implements Serializable {
    private String user;
    private String organisation;
    
    public OrganisationMemberId() {}
    
    public OrganisationMemberId(String user, String organisation) {
        this.user = user;
        this.organisation = organisation;
    }
    
    public String getUser() {
        return user;
    }
    
    public void setUser(String user) {
        this.user = user;
    }
    
    public String getOrganisation() {
        return organisation;
    }
    
    public void setOrganisation(String organisation) {
        this.organisation = organisation;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        OrganisationMemberId that = (OrganisationMemberId) o;
        
        if (!user.equals(that.user)) return false;
        return organisation.equals(that.organisation);
    }
    
    @Override
    public int hashCode() {
        int result = user.hashCode();
        result = 31 * result + organisation.hashCode();
        return result;
    }
}