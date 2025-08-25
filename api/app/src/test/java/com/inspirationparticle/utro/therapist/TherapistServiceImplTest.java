package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TherapistServiceImplTest {

    @Mock
    private TherapistRepository therapistRepository;

    @Mock
    private TherapistProtoMapper therapistProtoMapper;

    @InjectMocks
    private TherapistServiceImpl therapistService;

    private Therapist testTherapist;
    private TherapistProto.Therapist testProtoTherapist;
    private User testUser;
    private Organisation testOrganisation;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setFullName("Test User");

        testOrganisation = new Organisation();
        testOrganisation.setId(UUID.randomUUID());
        testOrganisation.setName("Test Organisation");

        testTherapist = new Therapist();
        testTherapist.setId(testId);
        testTherapist.setUser(testUser);
        testTherapist.setOrganisation(testOrganisation);
        testTherapist.setProfessionalTitle("Licensed Therapist");
        testTherapist.setInPersonTherapyFormat(true);
        testTherapist.setOnlineTherapyFormat(true);
        testTherapist.setIsActive(true);
        testTherapist.setIsAcceptingNewClients(true);
        testTherapist.setVisibility(Therapist.TherapistVisibility.PUBLIC);
        testTherapist.setSlug("test-therapist");
        testTherapist.setProfileImage("test-image-data".getBytes());
        testTherapist.setProfileImageMimeType("image/jpeg");
        testTherapist.setCreatedAt(Instant.now());
        testTherapist.setUpdatedAt(Instant.now());

        testProtoTherapist = TherapistProto.Therapist.newBuilder()
            .setId(testId.toString())
            .setUserId(testUser.getId().toString())
            .setUserName(testUser.getUsername())
            .setUserFullName(testUser.getFullName())
            .setOrganisationId(testOrganisation.getId().toString())
            .setOrganisationName(testOrganisation.getName())
            .setProfessionalTitle("Licensed Therapist")
            .setInPersonTherapyFormat(true)
            .setOnlineTherapyFormat(true)
            .setIsActive(true)
            .setIsAcceptingNewClients(true)
            .setVisibility(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC)
            .setSlug("test-therapist")
            .build();
    }

    @Test
    void testGetTherapist_WithValidId_ReturnsTherapist() {
        // Given
        TherapistProto.GetTherapistRequest request = TherapistProto.GetTherapistRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.of(testTherapist));
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistService.getTherapist(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId.toString(), response.getBody().getId());
        assertEquals("Licensed Therapist", response.getBody().getProfessionalTitle());

        verify(therapistRepository).findById(testId);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testGetTherapist_WithNonExistentId_ReturnsNotFound() {
        // Given
        TherapistProto.GetTherapistRequest request = TherapistProto.GetTherapistRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.empty());

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistService.getTherapist(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findById(testId);
        verify(therapistProtoMapper, never()).toProto(any(Therapist.class));
    }

    @Test
    void testGetTherapist_WithInvalidId_ReturnsBadRequest() {
        // Given
        TherapistProto.GetTherapistRequest request = TherapistProto.GetTherapistRequest.newBuilder()
            .setId("invalid-uuid")
            .build();

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistService.getTherapist(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository, never()).findById(any(UUID.class));
        verify(therapistProtoMapper, never()).toProto(any(Therapist.class));
    }

    @Test
    void testGetTherapistBySlug_WithValidSlug_ReturnsTherapist() {
        // Given
        String slug = "test-therapist";
        TherapistProto.GetTherapistBySlugRequest request = TherapistProto.GetTherapistBySlugRequest.newBuilder()
            .setSlug(slug)
            .build();

        when(therapistRepository.findBySlug(slug)).thenReturn(Optional.of(testTherapist));
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistService.getTherapistBySlug(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId.toString(), response.getBody().getId());
        assertEquals(slug, response.getBody().getSlug());

        verify(therapistRepository).findBySlug(slug);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testGetTherapistBySlug_WithNonExistentSlug_ReturnsNotFound() {
        // Given
        String slug = "non-existent-slug";
        TherapistProto.GetTherapistBySlugRequest request = TherapistProto.GetTherapistBySlugRequest.newBuilder()
            .setSlug(slug)
            .build();

        when(therapistRepository.findBySlug(slug)).thenReturn(Optional.empty());

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistService.getTherapistBySlug(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findBySlug(slug);
        verify(therapistProtoMapper, never()).toProto(any(Therapist.class));
    }

    @Test
    void testGetTherapistByUser_WithValidUserId_ReturnsTherapist() {
        // Given
        UUID userId = testUser.getId();
        TherapistProto.GetTherapistByUserRequest request = TherapistProto.GetTherapistByUserRequest.newBuilder()
            .setUserId(userId.toString())
            .build();

        when(therapistRepository.findByUserId(userId)).thenReturn(Optional.of(testTherapist));
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistService.getTherapistByUser(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId.toString(), response.getBody().getId());
        assertEquals(userId.toString(), response.getBody().getUserId());

        verify(therapistRepository).findByUserId(userId);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithOrganisationId_ReturnsFilteredTherapists() {
        // Given
        UUID orgId = testOrganisation.getId();
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setOrganisationId(orgId.toString())
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        List<Therapist> therapists = Arrays.asList(testTherapist);

        when(therapistRepository.findVisibleTherapists(orgId)).thenReturn(therapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());
        assertEquals(1, response.getBody().getTotalCount());
        assertEquals(10, response.getBody().getPageSize());
        assertEquals(0, response.getBody().getPageNumber());

        verify(therapistRepository).findVisibleTherapists(orgId);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithSpecializationId_ReturnsFilteredTherapists() {
        // Given
        UUID specId = UUID.randomUUID();
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setSpecializationId(specId.toString())
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        List<Therapist> therapists = Arrays.asList(testTherapist);

        when(therapistRepository.findBySpecializationId(specId)).thenReturn(therapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());

        verify(therapistRepository).findBySpecializationId(specId);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithLanguage_ReturnsFilteredTherapists() {
        // Given
        String language = "English";
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setLanguage(language)
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        List<Therapist> therapists = Arrays.asList(testTherapist);

        when(therapistRepository.findByLanguage(language)).thenReturn(therapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());

        verify(therapistRepository).findByLanguage(language);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithTherapyFormats_ReturnsFilteredTherapists() {
        // Given
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setInPerson(true)
            .setOnline(false)
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        List<Therapist> therapists = Arrays.asList(testTherapist);

        when(therapistRepository.findByTherapyFormats(true, false)).thenReturn(therapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());

        verify(therapistRepository).findByTherapyFormats(true, false);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithAcceptingClients_ReturnsFilteredTherapists() {
        // Given
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setAcceptingClients(true)
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        List<Therapist> therapists = Arrays.asList(testTherapist);

        when(therapistRepository.findByIsActiveTrueAndIsAcceptingNewClientsTrue()).thenReturn(therapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());

        verify(therapistRepository).findByIsActiveTrueAndIsAcceptingNewClientsTrue();
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithVisibility_ReturnsFilteredTherapists() {
        // Given
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setVisibility(TherapistProto.TherapistVisibility.THERAPIST_VISIBILITY_PUBLIC)
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        List<Therapist> therapists = Arrays.asList(testTherapist);

        when(therapistRepository.findByVisibilityAndIsActiveTrue(Therapist.TherapistVisibility.PUBLIC))
            .thenReturn(therapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());

        verify(therapistRepository).findByVisibilityAndIsActiveTrue(Therapist.TherapistVisibility.PUBLIC);
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testListTherapists_WithPagination_ReturnsCorrectPage() {
        // Given
        TherapistProto.ListTherapistsRequest request = TherapistProto.ListTherapistsRequest.newBuilder()
            .setPageSize(1)
            .setPageNumber(0)
            .build();

        List<Therapist> allTherapists = Arrays.asList(testTherapist, testTherapist); // Two therapists

        when(therapistRepository.findByVisibilityAndIsActiveTrue(Therapist.TherapistVisibility.PUBLIC))
            .thenReturn(allTherapists);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistService.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount()); // Only first page
        assertEquals(2, response.getBody().getTotalCount()); // Total count
        assertEquals(1, response.getBody().getPageSize());
        assertEquals(0, response.getBody().getPageNumber());

        verify(therapistRepository).findByVisibilityAndIsActiveTrue(Therapist.TherapistVisibility.PUBLIC);
    }

    @Test
    void testSearchTherapists_WithValidQuery_ReturnsMatchingTherapists() {
        // Given
        String query = "anxiety therapist";
        TherapistProto.SearchTherapistsRequest request = TherapistProto.SearchTherapistsRequest.newBuilder()
            .setQuery(query)
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        Page<Therapist> therapistsPage = new PageImpl<>(Arrays.asList(testTherapist));

        when(therapistRepository.searchTherapists(eq(query), any(Pageable.class))).thenReturn(therapistsPage);
        when(therapistProtoMapper.toProto(testTherapist)).thenReturn(testProtoTherapist);

        // When
        ResponseEntity<TherapistProto.SearchTherapistsResponse> response = therapistService.searchTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());
        assertEquals(1, response.getBody().getTotalCount());

        verify(therapistRepository).searchTherapists(eq(query), any(Pageable.class));
        verify(therapistProtoMapper).toProto(testTherapist);
    }

    @Test
    void testSearchTherapists_WithEmptyQuery_ReturnsBadRequest() {
        // Given
        TherapistProto.SearchTherapistsRequest request = TherapistProto.SearchTherapistsRequest.newBuilder()
            .setQuery("")
            .setPageSize(10)
            .setPageNumber(0)
            .build();

        // When
        ResponseEntity<TherapistProto.SearchTherapistsResponse> response = therapistService.searchTherapists(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository, never()).searchTherapists(anyString(), any(Pageable.class));
        verify(therapistProtoMapper, never()).toProto(any(Therapist.class));
    }

    @Test
    void testGetTherapistProfileImage_WithValidId_ReturnsImageData() {
        // Given
        TherapistProto.GetTherapistProfileImageRequest request = TherapistProto.GetTherapistProfileImageRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.of(testTherapist));

        // When
        ResponseEntity<TherapistProto.GetTherapistProfileImageResponse> response = 
            therapistService.getTherapistProfileImage(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("image/jpeg", response.getBody().getMimeType());
        assertNotNull(response.getBody().getImageData());

        verify(therapistRepository).findById(testId);
    }

    @Test
    void testGetTherapistProfileImage_WithNonExistentId_ReturnsNotFound() {
        // Given
        TherapistProto.GetTherapistProfileImageRequest request = TherapistProto.GetTherapistProfileImageRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.empty());

        // When
        ResponseEntity<TherapistProto.GetTherapistProfileImageResponse> response = 
            therapistService.getTherapistProfileImage(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findById(testId);
    }

    @Test
    void testGetTherapistProfileImage_WithNoImage_ReturnsNotFound() {
        // Given
        testTherapist.setProfileImage(null);
        
        TherapistProto.GetTherapistProfileImageRequest request = TherapistProto.GetTherapistProfileImageRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.of(testTherapist));

        // When
        ResponseEntity<TherapistProto.GetTherapistProfileImageResponse> response = 
            therapistService.getTherapistProfileImage(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findById(testId);
    }
}