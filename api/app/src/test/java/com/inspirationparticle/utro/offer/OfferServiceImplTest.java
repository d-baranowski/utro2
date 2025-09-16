package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.v1.OfferProto;
import com.inspirationparticle.utro.organisation.MemberType;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.organisation.OrganisationMember;
import com.inspirationparticle.utro.organisation.OrganisationMemberRepository;
import com.inspirationparticle.utro.organisation.OrganisationRepository;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferServiceImplTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganisationMemberRepository organisationMemberRepository;

    @Mock
    private OrganisationRepository organisationRepository;

    @InjectMocks
    private OfferServiceImpl offerService;

    private User testUser;
    private Organisation testOrganisation;
    private OrganisationMember testMembership;
    private Offer testOffer;
    private UUID userId;
    private UUID organisationId;
    private UUID offerId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        organisationId = UUID.randomUUID();
        offerId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .build();

        testOrganisation = Organisation.builder()
                .id(organisationId)
                .name("Test Organisation")
                .description("Test Description")
                .contactEmail("org@example.com")
                .contactPhone("+48123456789")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        testMembership = OrganisationMember.builder()
                .userId(userId)
                .organisationId(organisationId)
                .memberType(MemberType.ADMINISTRATOR)
                .build();

        testOffer = Offer.builder()
                .id(offerId)
                .nameEng("Test Offer")
                .namePl("Testowa Oferta")
                .descriptionEng("Test description")
                .descriptionPl("Testowy opis")
                .organisation(testOrganisation)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void testCreateOffer_Success() {
        // Given
        OfferProto.CreateOfferRequest request = OfferProto.CreateOfferRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setNameEng("New Offer")
                .setNamePl("Nowa Oferta")
                .setDescriptionEng("New description")
                .setDescriptionPl("Nowy opis")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(organisationMemberRepository.findByUserIdAndOrganisationId(userId, organisationId))
                .thenReturn(Optional.of(testMembership));
        when(organisationRepository.findById(organisationId)).thenReturn(Optional.of(testOrganisation));
        when(offerRepository.existsByOrganisationIdAndName(organisationId, "New Offer", "Nowa Oferta"))
                .thenReturn(false);
        when(offerRepository.save(any(Offer.class))).thenReturn(testOffer);

        // When
        ResponseEntity<OfferProto.Offer> response = offerService.createOffer(request, "testuser");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(offerRepository).save(any(Offer.class));
    }

    @Test
    void testCreateOffer_UserNotFound() {
        // Given
        OfferProto.CreateOfferRequest request = OfferProto.CreateOfferRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setNameEng("New Offer")
                .setNamePl("Nowa Oferta")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(AccessDeniedException.class, () -> 
                offerService.createOffer(request, "testuser"));
    }

    @Test
    void testCreateOffer_NotOwner() {
        // Given
        OfferProto.CreateOfferRequest request = OfferProto.CreateOfferRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setNameEng("New Offer")
                .setNamePl("Nowa Oferta")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(organisationMemberRepository.findByUserIdAndOrganisationId(userId, organisationId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(AccessDeniedException.class, () -> 
                offerService.createOffer(request, "testuser"));
    }

    @Test
    void testCreateOffer_DuplicateName() {
        // Given
        OfferProto.CreateOfferRequest request = OfferProto.CreateOfferRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setNameEng("Existing Offer")
                .setNamePl("Istniejąca Oferta")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(organisationMemberRepository.findByUserIdAndOrganisationId(userId, organisationId))
                .thenReturn(Optional.of(testMembership));
        when(organisationRepository.findById(organisationId)).thenReturn(Optional.of(testOrganisation));
        when(offerRepository.existsByOrganisationIdAndName(organisationId, "Existing Offer", "Istniejąca Oferta"))
                .thenReturn(true);

        // When
        ResponseEntity<OfferProto.Offer> response = offerService.createOffer(request, "testuser");

        // Then
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(offerRepository, never()).save(any(Offer.class));
    }

    @Test
    void testUpdateOffer_Success() {
        // Given
        OfferProto.UpdateOfferRequest request = OfferProto.UpdateOfferRequest.newBuilder()
                .setId(offerId.toString())
                .setNameEng("Updated Offer")
                .setDescriptionEng("Updated description")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(offerRepository.findById(offerId)).thenReturn(Optional.of(testOffer));
        when(organisationMemberRepository.findByUserIdAndOrganisationId(userId, organisationId))
                .thenReturn(Optional.of(testMembership));
        when(offerRepository.save(any(Offer.class))).thenReturn(testOffer);

        // When
        ResponseEntity<OfferProto.Offer> response = offerService.updateOffer(request, "testuser");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(offerRepository).save(testOffer);
    }

    @Test
    void testDeleteOffer_Success() {
        // Given
        OfferProto.DeleteOfferRequest request = OfferProto.DeleteOfferRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(offerRepository.findById(offerId)).thenReturn(Optional.of(testOffer));
        when(organisationMemberRepository.findByUserIdAndOrganisationId(userId, organisationId))
                .thenReturn(Optional.of(testMembership));

        // When
        ResponseEntity<OfferProto.DeleteOfferResponse> response = offerService.deleteOffer(request, "testuser");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getSuccess());
        verify(offerRepository).delete(testOffer);
    }

    @Test
    void testGetOffer_Success() {
        // Given
        OfferProto.GetOfferRequest request = OfferProto.GetOfferRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(testOffer));

        // When
        ResponseEntity<OfferProto.Offer> response = offerService.getOffer(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testGetOffer_NotFound() {
        // Given
        OfferProto.GetOfferRequest request = OfferProto.GetOfferRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        when(offerRepository.findById(offerId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
                offerService.getOffer(request));
    }

    @Test
    void testListOffers_WithOrganisation() {
        // Given
        OfferProto.ListOffersRequest request = OfferProto.ListOffersRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setPageSize(10)
                .setPageNumber(1)
                .build();

        List<Offer> offers = Arrays.asList(testOffer);
        when(offerRepository.findByOrganisationIdOrderByCreatedAtDesc(organisationId))
                .thenReturn(offers);

        // When
        ResponseEntity<OfferProto.ListOffersResponse> response = offerService.listOffers(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalCount());
        assertEquals(1, response.getBody().getOffersCount());
    }

    @Test
    void testSearchOffers_Success() {
        // Given
        OfferProto.SearchOffersRequest request = OfferProto.SearchOffersRequest.newBuilder()
                .setQuery("test")
                .setPageSize(10)
                .setPageNumber(1)
                .build();

        List<Offer> offers = Arrays.asList(testOffer);
        when(offerRepository.searchOffers("test")).thenReturn(offers);

        // When
        ResponseEntity<OfferProto.SearchOffersResponse> response = offerService.searchOffers(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalCount());
        assertEquals(1, response.getBody().getOffersCount());
    }

    @Test
    void testGetOfferProfileImage_Success() {
        // Given
        OfferProto.GetOfferProfileImageRequest request = OfferProto.GetOfferProfileImageRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        testOffer.setProfileImage("test-image-data".getBytes());
        testOffer.setProfileImageMimeType("image/png");

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(testOffer));

        // When
        ResponseEntity<OfferProto.GetOfferProfileImageResponse> response = 
                offerService.getOfferProfileImage(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("image/png", response.getBody().getMimeType());
    }

    @Test
    void testGetOfferProfileImage_NoImage() {
        // Given
        OfferProto.GetOfferProfileImageRequest request = OfferProto.GetOfferProfileImageRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(testOffer));

        // When
        ResponseEntity<OfferProto.GetOfferProfileImageResponse> response = 
                offerService.getOfferProfileImage(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}