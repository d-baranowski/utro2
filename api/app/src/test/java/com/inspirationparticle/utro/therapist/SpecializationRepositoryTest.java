package com.inspirationparticle.utro.therapist;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SpecializationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpecializationRepository specializationRepository;

    private Specialization activeSpecialization1;
    private Specialization activeSpecialization2;
    private Specialization inactiveSpecialization;

    @BeforeEach
    void setUp() {
        // Create active specializations
        activeSpecialization1 = new Specialization();
        activeSpecialization1.setId(UUID.randomUUID());
        activeSpecialization1.setNameEng("Anxiety Disorders");
        activeSpecialization1.setNamePl("Zaburzenia lękowe");
        activeSpecialization1.setDescriptionEng("Treatment of anxiety disorders");
        activeSpecialization1.setDescriptionPl("Leczenie zaburzeń lękowych");
        activeSpecialization1.setCategory("Mental Health");
        activeSpecialization1.setIsActive(true);
        activeSpecialization1.setCreatedAt(Instant.now());
        activeSpecialization1.setUpdatedAt(Instant.now());

        activeSpecialization2 = new Specialization();
        activeSpecialization2.setId(UUID.randomUUID());
        activeSpecialization2.setNameEng("Addiction Therapy");
        activeSpecialization2.setNamePl("Terapia uzależnień");
        activeSpecialization2.setDescriptionEng("Treatment of addiction issues");
        activeSpecialization2.setDescriptionPl("Leczenie problemów uzależnień");
        activeSpecialization2.setCategory("Addiction");
        activeSpecialization2.setIsActive(true);
        activeSpecialization2.setCreatedAt(Instant.now());
        activeSpecialization2.setUpdatedAt(Instant.now());

        // Create inactive specialization
        inactiveSpecialization = new Specialization();
        inactiveSpecialization.setId(UUID.randomUUID());
        inactiveSpecialization.setNameEng("Deprecated Therapy");
        inactiveSpecialization.setNamePl("Przestarzała terapia");
        inactiveSpecialization.setDescriptionEng("Old therapy method");
        inactiveSpecialization.setDescriptionPl("Stara metoda terapii");
        inactiveSpecialization.setCategory("Mental Health");
        inactiveSpecialization.setIsActive(false);
        inactiveSpecialization.setCreatedAt(Instant.now());
        inactiveSpecialization.setUpdatedAt(Instant.now());

        // Persist entities
        entityManager.persist(activeSpecialization1);
        entityManager.persist(activeSpecialization2);
        entityManager.persist(inactiveSpecialization);
        entityManager.flush();
    }

    @Test
    void testFindByIsActiveTrueOrderByNameEng_ReturnsOnlyActiveSpecializationsOrderedByName() {
        // When
        List<Specialization> result = specializationRepository.findByIsActiveTrueOrderByNameEng();

        // Then
        assertEquals(2, result.size());
        // Should be ordered alphabetically: "Addiction Therapy", "Anxiety Disorders"
        assertEquals("Addiction Therapy", result.get(0).getNameEng());
        assertEquals("Anxiety Disorders", result.get(1).getNameEng());
        
        // Verify all returned specializations are active
        result.forEach(spec -> assertTrue(spec.getIsActive()));
    }

    @Test
    void testFindByCategoryAndIsActiveTrueOrderByNameEng_ReturnsFilteredSpecializations() {
        // When - search for Mental Health category
        List<Specialization> mentalHealthSpecs = specializationRepository
            .findByCategoryAndIsActiveTrueOrderByNameEng("Mental Health");

        // Then
        assertEquals(1, mentalHealthSpecs.size());
        assertEquals("Anxiety Disorders", mentalHealthSpecs.get(0).getNameEng());
        assertEquals("Mental Health", mentalHealthSpecs.get(0).getCategory());
        assertTrue(mentalHealthSpecs.get(0).getIsActive());

        // When - search for Addiction category
        List<Specialization> addictionSpecs = specializationRepository
            .findByCategoryAndIsActiveTrueOrderByNameEng("Addiction");

        // Then
        assertEquals(1, addictionSpecs.size());
        assertEquals("Addiction Therapy", addictionSpecs.get(0).getNameEng());
        assertEquals("Addiction", addictionSpecs.get(0).getCategory());
        assertTrue(addictionSpecs.get(0).getIsActive());
    }

    @Test
    void testFindByCategoryAndIsActiveTrueOrderByNameEng_WithNonExistentCategory_ReturnsEmptyList() {
        // When
        List<Specialization> result = specializationRepository
            .findByCategoryAndIsActiveTrueOrderByNameEng("Non-existent Category");

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    void testSearchSpecializations_WithEnglishNameMatch_ReturnsMatchingSpecializations() {
        // When - search by English name
        List<Specialization> result = specializationRepository.searchSpecializations("Anxiety");

        // Then
        assertEquals(1, result.size());
        assertEquals("Anxiety Disorders", result.get(0).getNameEng());
    }

    @Test
    void testSearchSpecializations_WithPolishNameMatch_ReturnsMatchingSpecializations() {
        // When - search by Polish name
        List<Specialization> result = specializationRepository.searchSpecializations("lękowe");

        // Then
        assertEquals(1, result.size());
        assertEquals("Anxiety Disorders", result.get(0).getNameEng());
        assertEquals("Zaburzenia lękowe", result.get(0).getNamePl());
    }

    @Test
    void testSearchSpecializations_WithNameMatch_ReturnsMatchingSpecializations() {
        // When - search by part of name
        List<Specialization> result = specializationRepository.searchSpecializations("Therapy");

        // Then
        assertEquals(1, result.size());
        assertEquals("Addiction Therapy", result.get(0).getNameEng());
    }

    @Test
    void testSearchSpecializations_WithCaseInsensitiveSearch_ReturnsMatchingSpecializations() {
        // When - search with different case
        List<Specialization> result = specializationRepository.searchSpecializations("ANXIETY");

        // Then
        assertEquals(1, result.size());
        assertEquals("Anxiety Disorders", result.get(0).getNameEng());
    }

    @Test
    void testSearchSpecializations_WithPartialMatch_ReturnsMatchingSpecializations() {
        // When - search with partial word
        List<Specialization> result = specializationRepository.searchSpecializations("Ther");

        // Then
        assertEquals(1, result.size());
        assertEquals("Addiction Therapy", result.get(0).getNameEng());
    }

    @Test
    void testSearchSpecializations_OnlyReturnsActiveSpecializations() {
        // When - search for term that matches inactive specialization
        List<Specialization> result = specializationRepository.searchSpecializations("Deprecated");

        // Then - should return empty because inactive specializations are excluded
        assertTrue(result.isEmpty());
    }

    @Test
    void testSearchSpecializations_WithNoMatches_ReturnsEmptyList() {
        // When
        List<Specialization> result = specializationRepository.searchSpecializations("NonExistentTerm");

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    void testFindDistinctCategories_ReturnsUniqueCategories() {
        // When
        List<String> categories = specializationRepository.findDistinctCategories();

        // Then
        assertEquals(2, categories.size());
        assertTrue(categories.contains("Mental Health"));
        assertTrue(categories.contains("Addiction"));
    }

    @Test
    void testFindDistinctCategories_OnlyReturnsActiveSpecializationCategories() {
        // Given - create another inactive specialization with a unique category
        Specialization inactiveUniqueCategory = new Specialization();
        inactiveUniqueCategory.setId(UUID.randomUUID());
        inactiveUniqueCategory.setNameEng("Old Category Therapy");
        inactiveUniqueCategory.setNamePl("Stara kategoria");
        inactiveUniqueCategory.setCategory("Old Category");
        inactiveUniqueCategory.setIsActive(false);
        inactiveUniqueCategory.setCreatedAt(Instant.now());
        inactiveUniqueCategory.setUpdatedAt(Instant.now());
        
        entityManager.persist(inactiveUniqueCategory);
        entityManager.flush();

        // When
        List<String> categories = specializationRepository.findDistinctCategories();

        // Then - should not include the inactive category
        assertEquals(2, categories.size());
        assertTrue(categories.contains("Mental Health"));
        assertTrue(categories.contains("Addiction"));
        assertFalse(categories.contains("Old Category"));
    }
}