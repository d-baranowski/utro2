package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import com.inspirationparticle.utro.organisation.MemberType;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.organisation.OrganisationMemberRepository;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
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
    private TherapistService therapistService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganisationMemberRepository organisationMemberRepository;


    @InjectMocks
    private TherapistServiceImpl therapistServiceImpl;

    private Therapist testTherapist;
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
        testTherapist.setPublishedAt(Instant.now());

    }

    @Test
    void testGetTherapist_WithValidId_ReturnsTherapist() {
        // Given
        TherapistProto.GetTherapistRequest request = TherapistProto.GetTherapistRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.of(testTherapist));

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistServiceImpl.getTherapist(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId.toString(), response.getBody().getId());
        assertEquals("Licensed Therapist", response.getBody().getProfessionalTitle());

        verify(therapistRepository).findById(testId);
    }

    @Test
    void testGetTherapist_WithNonExistentId_ReturnsNotFound() {
        // Given
        TherapistProto.GetTherapistRequest request = TherapistProto.GetTherapistRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(therapistRepository.findById(testId)).thenReturn(Optional.empty());

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistServiceImpl.getTherapist(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findById(testId);
    }

    @Test
    void testGetTherapist_WithInvalidId_ReturnsBadRequest() {
        // Given
        TherapistProto.GetTherapistRequest request = TherapistProto.GetTherapistRequest.newBuilder()
            .setId("invalid-uuid")
            .build();

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistServiceImpl.getTherapist(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository, never()).findById(any(UUID.class));
    }

    @Test
    void testGetTherapistBySlug_WithValidSlug_ReturnsTherapist() {
        // Given
        String slug = "test-therapist";
        TherapistProto.GetTherapistBySlugRequest request = TherapistProto.GetTherapistBySlugRequest.newBuilder()
            .setSlug(slug)
            .build();

        when(therapistRepository.findBySlug(slug)).thenReturn(Optional.of(testTherapist));

        // When
        ResponseEntity<TherapistProto.Therapist> response = therapistServiceImpl.getTherapistBySlug(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId.toString(), response.getBody().getId());
        assertEquals(slug, response.getBody().getSlug());

        verify(therapistRepository).findBySlug(slug);
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
        ResponseEntity<TherapistProto.Therapist> response = therapistServiceImpl.getTherapistBySlug(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findBySlug(slug);
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

        // When
        ResponseEntity<TherapistProto.ListTherapistsResponse> response = therapistServiceImpl.listTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());
        assertEquals(1, response.getBody().getTotalCount());
        assertEquals(10, response.getBody().getPageSize());
        assertEquals(0, response.getBody().getPageNumber());

        verify(therapistRepository).findVisibleTherapists(orgId);
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

        // When
        ResponseEntity<TherapistProto.SearchTherapistsResponse> response = therapistServiceImpl.searchTherapists(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTherapistsCount());
        assertEquals(1, response.getBody().getTotalCount());

        verify(therapistRepository).searchTherapists(eq(query), any(Pageable.class));
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
        ResponseEntity<TherapistProto.SearchTherapistsResponse> response = therapistServiceImpl.searchTherapists(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository, never()).searchTherapists(anyString(), any(Pageable.class));
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
            therapistServiceImpl.getTherapistProfileImage(request);

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
            therapistServiceImpl.getTherapistProfileImage(request);

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
            therapistServiceImpl.getTherapistProfileImage(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(therapistRepository).findById(testId);
    }
}