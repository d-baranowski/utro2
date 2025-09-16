package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.organisation.Organisation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OfferRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private OfferRepository offerRepository;

    private Organisation testOrganisation1;
    private Organisation testOrganisation2;
    private Offer offer1;
    private Offer offer2;
    private Offer offer3;

    @BeforeEach
    void setUp() {
        // Create test organisations
        testOrganisation1 = Organisation.builder()
                .id(UUID.randomUUID())
                .name("Test Organisation 1")
                .description("Test Description 1")
                .contactEmail("test1@example.com")
                .contactPhone("+48123456789")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        
        testOrganisation2 = Organisation.builder()
                .id(UUID.randomUUID())
                .name("Test Organisation 2")
                .description("Test Description 2")
                .contactEmail("test2@example.com")
                .contactPhone("+48987654321")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        entityManager.persistAndFlush(testOrganisation1);
        entityManager.persistAndFlush(testOrganisation2);

        // Create test offers
        offer1 = Offer.builder()
                .id(UUID.randomUUID())
                .nameEng("Individual Therapy")
                .namePl("Terapia Indywidualna")
                .descriptionEng("Professional individual therapy sessions")
                .descriptionPl("Profesjonalne sesje terapii indywidualnej")
                .organisation(testOrganisation1)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        offer2 = Offer.builder()
                .id(UUID.randomUUID())
                .nameEng("Group Therapy")
                .namePl("Terapia Grupowa")
                .descriptionEng("Group therapy sessions for better social skills")
                .descriptionPl("Sesje terapii grupowej dla lepszych umiejętności społecznych")
                .organisation(testOrganisation1)
                .createdAt(Instant.now().minusSeconds(3600)) // 1 hour ago
                .updatedAt(Instant.now().minusSeconds(3600))
                .build();

        offer3 = Offer.builder()
                .id(UUID.randomUUID())
                .nameEng("Family Counseling")
                .namePl("Poradnictwo Rodzinne")
                .descriptionEng("Family counseling services")
                .descriptionPl("Usługi poradnictwa rodzinnego")
                .organisation(testOrganisation2)
                .createdAt(Instant.now().minusSeconds(7200)) // 2 hours ago
                .updatedAt(Instant.now().minusSeconds(7200))
                .build();

        entityManager.persistAndFlush(offer1);
        entityManager.persistAndFlush(offer2);
        entityManager.persistAndFlush(offer3);
    }

    @Test
    void testFindByOrganisationId() {
        List<Offer> offers = offerRepository.findByOrganisationId(testOrganisation1.getId());
        
        assertEquals(2, offers.size());
        assertTrue(offers.stream().anyMatch(o -> o.getNameEng().equals("Individual Therapy")));
        assertTrue(offers.stream().anyMatch(o -> o.getNameEng().equals("Group Therapy")));
    }

    @Test
    void testFindByOrganisationIdOrderByCreatedAtDesc() {
        List<Offer> offers = offerRepository.findByOrganisationIdOrderByCreatedAtDesc(testOrganisation1.getId());
        
        assertEquals(2, offers.size());
        // Should be ordered by created_at descending (newest first)
        assertEquals("Individual Therapy", offers.get(0).getNameEng());
        assertEquals("Group Therapy", offers.get(1).getNameEng());
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        List<Offer> offers = offerRepository.findByNameContainingIgnoreCase("therapy");
        
        assertEquals(2, offers.size());
        assertTrue(offers.stream().anyMatch(o -> o.getNameEng().equals("Individual Therapy")));
        assertTrue(offers.stream().anyMatch(o -> o.getNameEng().equals("Group Therapy")));
    }

    @Test
    void testFindByNameContainingIgnoreCasePolish() {
        List<Offer> offers = offerRepository.findByNameContainingIgnoreCase("terapia");
        
        assertEquals(2, offers.size());
        assertTrue(offers.stream().anyMatch(o -> o.getNamePl().equals("Terapia Indywidualna")));
        assertTrue(offers.stream().anyMatch(o -> o.getNamePl().equals("Terapia Grupowa")));
    }

    @Test
    void testFindByDescriptionContainingIgnoreCase() {
        List<Offer> offers = offerRepository.findByDescriptionContainingIgnoreCase("professional");
        
        assertEquals(1, offers.size());
        assertEquals("Individual Therapy", offers.get(0).getNameEng());
    }

    @Test
    void testSearchOffers() {
        List<Offer> offers = offerRepository.searchOffers("family");
        
        assertEquals(1, offers.size());
        assertEquals("Family Counseling", offers.get(0).getNameEng());
    }

    @Test
    void testSearchOffersPolish() {
        List<Offer> offers = offerRepository.searchOffers("umiejętności");
        
        assertEquals(1, offers.size());
        assertEquals("Group Therapy", offers.get(0).getNameEng());
    }

    @Test
    void testFindByOrganisationIdAndSearchTerm() {
        List<Offer> offers = offerRepository.findByOrganisationIdAndSearchTerm(
                testOrganisation1.getId(), "individual");
        
        assertEquals(1, offers.size());
        assertEquals("Individual Therapy", offers.get(0).getNameEng());
    }

    @Test
    void testCountByOrganisationId() {
        long count = offerRepository.countByOrganisationId(testOrganisation1.getId());
        assertEquals(2, count);
        
        long count2 = offerRepository.countByOrganisationId(testOrganisation2.getId());
        assertEquals(1, count2);
    }

    @Test
    void testExistsByOrganisationIdAndName() {
        boolean exists = offerRepository.existsByOrganisationIdAndName(
                testOrganisation1.getId(), "Individual Therapy", "Terapia Indywidualna");
        assertTrue(exists);
        
        boolean notExists = offerRepository.existsByOrganisationIdAndName(
                testOrganisation1.getId(), "Non-existent Offer", "Nieistniejąca Oferta");
        assertFalse(notExists);
    }

    @Test
    void testFindById() {
        Optional<Offer> found = offerRepository.findById(offer1.getId());
        assertTrue(found.isPresent());
        assertEquals("Individual Therapy", found.get().getNameEng());
    }

    @Test
    void testSaveOffer() {
        Offer newOffer = Offer.builder()
                .id(UUID.randomUUID())
                .nameEng("New Offer")
                .namePl("Nowa Oferta")
                .descriptionEng("New offer description")
                .descriptionPl("Opis nowej oferty")
                .organisation(testOrganisation1)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Offer saved = offerRepository.save(newOffer);
        assertNotNull(saved);
        assertEquals("New Offer", saved.getNameEng());
        
        long count = offerRepository.countByOrganisationId(testOrganisation1.getId());
        assertEquals(3, count); // Should now have 3 offers for organisation 1
    }

    @Test
    void testDeleteOffer() {
        UUID offerId = offer1.getId();
        offerRepository.deleteById(offerId);
        
        Optional<Offer> found = offerRepository.findById(offerId);
        assertFalse(found.isPresent());
        
        long count = offerRepository.countByOrganisationId(testOrganisation1.getId());
        assertEquals(1, count); // Should now have 1 offer for organisation 1
    }
}