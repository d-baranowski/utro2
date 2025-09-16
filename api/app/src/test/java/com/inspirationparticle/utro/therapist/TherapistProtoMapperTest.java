package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TherapistProtoMapperTest {

    private User testUser;
    private Organisation testOrganisation;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setFullName("Test User");

        testOrganisation = new Organisation();
        testOrganisation.setId(UUID.randomUUID());
        testOrganisation.setName("Test Organisation");
    }

    @Test
    void testToProtoTherapist_WithNullInput_ReturnsNull() {
        assertNull(TherapistProtoMapper.toProto((Therapist) null));
    }

    @Test
    void testToProtoTherapist_WithValidInput_ReturnsProtoTherapist() {
        // Given
        Therapist therapist = new Therapist();
        therapist.setId(UUID.randomUUID());
        therapist.setUser(testUser);
        therapist.setOrganisation(testOrganisation);
        therapist.setProfessionalTitle("Licensed Therapist");
        therapist.setDescriptionEng("English description");
        therapist.setDescriptionPl("Polish description");
        therapist.setWorkExperienceEng("5 years experience");
        therapist.setWorkExperiencePl("5 lat doświadczenia");
        therapist.setInPersonTherapyFormat(true);
        therapist.setOnlineTherapyFormat(false);
        therapist.setIsActive(true);
        therapist.setIsAcceptingNewClients(true);
        therapist.setVisibility(Therapist.TherapistVisibility.PUBLIC);
        therapist.setContactEmail("test@example.com");
        therapist.setContactPhone("+1234567890");
        therapist.setWebsiteUrl("https://example.com");
        therapist.setSlug("test-therapist");
        therapist.setMetaDescription("Meta description");
        therapist.setLanguages(Set.of("English", "Polish"));
        therapist.setSearchTags(Set.of("anxiety", "depression"));
        therapist.setProfileImageMimeType("image/jpeg");
        therapist.setCreatedAt(Instant.now());
        therapist.setUpdatedAt(Instant.now());
        therapist.setPublishedAt(Instant.now());

        // When
        TherapistProto.Therapist proto = TherapistProtoMapper.toProto(therapist);

        // Then
        assertNotNull(proto);
        assertEquals(therapist.getId().toString(), proto.getId());
        assertEquals(testUser.getId().toString(), proto.getUserId());
        assertEquals(testUser.getUsername(), proto.getUserName());
        assertEquals(testUser.getFullName(), proto.getUserFullName());
        assertEquals(testOrganisation.getId().toString(), proto.getOrganisationId());
        assertEquals(testOrganisation.getName(), proto.getOrganisationName());
        assertEquals("Licensed Therapist", proto.getProfessionalTitle());
        assertEquals("English description", proto.getDescriptionEng());
        assertEquals("Polish description", proto.getDescriptionPl());
        assertEquals("5 years experience", proto.getWorkExperienceEng());
        assertEquals("5 lat doświadczenia", proto.getWorkExperiencePl());
        assertTrue(proto.getInPersonTherapyFormat());
        assertFalse(proto.getOnlineTherapyFormat());
        assertTrue(proto.getIsActive());
        assertTrue(proto.getIsAcceptingNewClients());
        assertEquals(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC, proto.getVisibility());
        assertEquals("test@example.com", proto.getContactEmail());
        assertEquals("+1234567890", proto.getContactPhone());
        assertEquals("https://example.com", proto.getWebsiteUrl());
        assertEquals("test-therapist", proto.getSlug());
        assertEquals("Meta description", proto.getMetaDescription());
        assertTrue(proto.getLanguagesList().containsAll(Arrays.asList("English", "Polish")));
        assertEquals(2, proto.getLanguagesCount());
        assertTrue(proto.getSearchTagsList().containsAll(Arrays.asList("anxiety", "depression")));
        assertEquals(2, proto.getSearchTagsCount());
        assertEquals("image/jpeg", proto.getProfileImageMimeType());
        assertTrue(proto.hasCreatedAt());
        assertTrue(proto.hasUpdatedAt());
        assertTrue(proto.hasPublishedAt());
    }

    @Test
    void testToProtoSpecialization_WithNullInput_ReturnsNull() {
        assertNull(TherapistProtoMapper.toProto((Specialization) null));
    }

    @Test
    void testToProtoSpecialization_WithValidInput_ReturnsProtoSpecialization() {
        // Given
        Specialization specialization = new Specialization();
        specialization.setId(UUID.randomUUID());
        specialization.setNameEng("Anxiety Disorders");
        specialization.setNamePl("Zaburzenia lękowe");
        specialization.setDescriptionEng("Treatment of anxiety disorders");
        specialization.setDescriptionPl("Leczenie zaburzeń lękowych");
        specialization.setCategory("Mental Health");
        specialization.setIsActive(true);
        specialization.setCreatedAt(Instant.now());
        specialization.setUpdatedAt(Instant.now());

        // When
        TherapistProto.Specialization proto = TherapistProtoMapper.toProto(specialization);

        // Then
        assertNotNull(proto);
        assertEquals(specialization.getId().toString(), proto.getId());
        assertEquals("Anxiety Disorders", proto.getNameEng());
        assertEquals("Zaburzenia lękowe", proto.getNamePl());
        assertEquals("Treatment of anxiety disorders", proto.getDescriptionEng());
        assertEquals("Leczenie zaburzeń lękowych", proto.getDescriptionPl());
        assertEquals("Mental Health", proto.getCategory());
        assertTrue(proto.getIsActive());
        assertTrue(proto.hasCreatedAt());
        assertTrue(proto.hasUpdatedAt());
    }

    @Test
    void testToProtoTherapistSpecialization_WithNullInput_ReturnsNull() {
        assertNull(TherapistSpecializationMapper.toProto((TherapistSpecialization) null));
    }

    @Test
    void testToProtoTherapistSpecialization_WithValidInput_ReturnsProtoTherapistSpecialization() {
        // Given
        Specialization specialization = new Specialization();
        specialization.setId(UUID.randomUUID());
        specialization.setNameEng("Anxiety Disorders");
        specialization.setNamePl("Zaburzenia lękowe");
        specialization.setDescriptionEng("Treatment of anxiety disorders");
        specialization.setDescriptionPl("Leczenie zaburzeń lękowych");
        specialization.setCategory("Mental Health");

        TherapistSpecialization ts = new TherapistSpecialization();
        ts.setSpecialization(specialization);
        ts.setIsPrimary(true);
        ts.setYearsOfPractice(5);
        ts.setCreatedAt(Instant.now());

        // When
        TherapistProto.TherapistSpecialization proto = TherapistSpecializationMapper.toProto(ts);

        // Then
        assertNotNull(proto);
        assertEquals(specialization.getId().toString(), proto.getSpecializationId());
        assertEquals("Anxiety Disorders", proto.getNameEng());
        assertEquals("Zaburzenia lękowe", proto.getNamePl());
        assertEquals("Treatment of anxiety disorders", proto.getDescriptionEng());
        assertEquals("Leczenie zaburzeń lękowych", proto.getDescriptionPl());
        assertEquals("Mental Health", proto.getCategory());
        assertTrue(proto.getIsPrimary());
        assertEquals(5, proto.getYearsOfPractice());
        assertTrue(proto.hasCreatedAt());
    }

    @Test
    void testToProtoTherapistEducation_WithNullInput_ReturnsNull() {
        assertNull(TherapistEducationMapper.toProto((TherapistEducation) null));
    }

    @Test
    void testToProtoTherapistEducation_WithValidInput_ReturnsProtoTherapistEducation() {
        // Given
        TherapistEducation education = new TherapistEducation();
        education.setId(UUID.randomUUID());
        education.setDegree("Master of Science");
        education.setFieldOfStudy("Psychology");
        education.setInstitution("University of Test");
        education.setCountry("Poland");
        education.setStartYear(2015);
        education.setGraduationYear(2017);
        education.setIsCompleted(true);
        education.setThesisTitle("Test Thesis");
        education.setHonors("Magna Cum Laude");
        education.setDisplayOrder(1);
        education.setCreatedAt(Instant.now());
        education.setUpdatedAt(Instant.now());

        // When
        TherapistProto.TherapistEducation proto = TherapistEducationMapper.toProto(education);

        // Then
        assertNotNull(proto);
        assertEquals(education.getId().toString(), proto.getId());
        assertEquals("Master of Science", proto.getDegree());
        assertEquals("Psychology", proto.getFieldOfStudy());
        assertEquals("University of Test", proto.getInstitution());
        assertEquals("Poland", proto.getCountry());
        assertEquals(2015, proto.getStartYear());
        assertEquals(2017, proto.getGraduationYear());
        assertTrue(proto.getIsCompleted());
        assertEquals("Test Thesis", proto.getThesisTitle());
        assertEquals("Magna Cum Laude", proto.getHonors());
        assertEquals(1, proto.getDisplayOrder());
        assertTrue(proto.hasCreatedAt());
        assertTrue(proto.hasUpdatedAt());
    }

    @Test
    void testToProtoTherapistCertification_WithNullInput_ReturnsNull() {
        assertNull(TherapistCertificationMapper.toProto((TherapistCertification) null));
    }

    @Test
    void testToProtoTherapistCertification_WithValidInput_ReturnsProtoTherapistCertification() {
        // Given
        TherapistCertification certification = new TherapistCertification();
        certification.setId(UUID.randomUUID());
        certification.setName("Certified Therapist");
        certification.setIssuingOrganization("Test Organization");
        certification.setCredentialId("CERT123");
        certification.setIssueDate(LocalDate.of(2020, 1, 15));
        certification.setExpiryDate(LocalDate.of(2025, 1, 15));
        certification.setVerificationUrl("https://verify.example.com");
        certification.setCertificationLevel("Professional");
        certification.setHoursCompleted(100);
        certification.setIsActive(true);
        certification.setDisplayOrder(1);
        certification.setCreatedAt(Instant.now());
        certification.setUpdatedAt(Instant.now());

        // When
        TherapistProto.TherapistCertification proto = TherapistCertificationMapper.toProto(certification);

        // Then
        assertNotNull(proto);
        assertEquals(certification.getId().toString(), proto.getId());
        assertEquals("Certified Therapist", proto.getName());
        assertEquals("Test Organization", proto.getIssuingOrganization());
        assertEquals("CERT123", proto.getCredentialId());
        assertEquals("2020-01-15", proto.getIssueDate());
        assertEquals("2025-01-15", proto.getExpiryDate());
        assertEquals("https://verify.example.com", proto.getVerificationUrl());
        assertEquals("Professional", proto.getCertificationLevel());
        assertEquals(100, proto.getHoursCompleted());
        assertTrue(proto.getIsActive());
        assertEquals(1, proto.getDisplayOrder());
        assertTrue(proto.hasCreatedAt());
        assertTrue(proto.hasUpdatedAt());
    }

    @Test
    void testMapVisibilityToProto_WithAllValues() {
        Therapist therapist1 = new Therapist();
        therapist1.setId(UUID.randomUUID());
        therapist1.setUser(testUser);
        therapist1.setOrganisation(testOrganisation);
        therapist1.setVisibility(Therapist.TherapistVisibility.PUBLIC);
        therapist1.setCreatedAt(Instant.now());
        therapist1.setUpdatedAt(Instant.now());
        
        TherapistProto.Therapist proto1 = TherapistProtoMapper.toProto(therapist1);
        assertEquals(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC, proto1.getVisibility());

        therapist1.setVisibility(Therapist.TherapistVisibility.ORGANISATION_ONLY);
        TherapistProto.Therapist proto2 = TherapistProtoMapper.toProto(therapist1);
        assertEquals(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_ORGANISATION_ONLY, proto2.getVisibility());

        therapist1.setVisibility(Therapist.TherapistVisibility.PRIVATE);
        TherapistProto.Therapist proto3 = TherapistProtoMapper.toProto(therapist1);
        assertEquals(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PRIVATE, proto3.getVisibility());

        therapist1.setVisibility(null);
        TherapistProto.Therapist proto4 = TherapistProtoMapper.toProto(therapist1);
        assertEquals(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC, proto4.getVisibility());
    }
}