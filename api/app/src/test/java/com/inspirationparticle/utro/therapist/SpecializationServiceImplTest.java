package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
class SpecializationServiceImplTest {

    @Mock
    private SpecializationRepository specializationRepository;


    @InjectMocks
    private SpecializationServiceImpl specializationService;

    private Specialization testSpecialization;
    private TherapistProto.Specialization testProtoSpecialization;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        
        testSpecialization = new Specialization();
        testSpecialization.setId(testId);
        testSpecialization.setNameEng("Test Specialization");
        testSpecialization.setNamePl("Test Specjalizacja");
        testSpecialization.setDescriptionEng("Test description");
        testSpecialization.setDescriptionPl("Test opis");
        testSpecialization.setCategory("Mental Health");
        testSpecialization.setIsActive(true);
        testSpecialization.setCreatedAt(Instant.now());
        testSpecialization.setUpdatedAt(Instant.now());

        testProtoSpecialization = TherapistProto.Specialization.newBuilder()
            .setId(testId.toString())
            .setNameEng("Test Specialization")
            .setNamePl("Test Specjalizacja")
            .setDescriptionEng("Test description")
            .setDescriptionPl("Test opis")
            .setCategory("Mental Health")
            .setIsActive(true)
            .build();
    }

    @Test
    void testGetSpecialization_WithValidId_ReturnsSpecialization() {
        // Given
        TherapistProto.GetSpecializationRequest request = TherapistProto.GetSpecializationRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(specializationRepository.findById(testId)).thenReturn(Optional.of(testSpecialization));

        // When
        ResponseEntity<TherapistProto.Specialization> response = specializationService.getSpecialization(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testId.toString(), response.getBody().getId());
        assertEquals("Test Specialization", response.getBody().getNameEng());

        verify(specializationRepository).findById(testId);
    }

    @Test
    void testGetSpecialization_WithNonExistentId_ReturnsNotFound() {
        // Given
        TherapistProto.GetSpecializationRequest request = TherapistProto.GetSpecializationRequest.newBuilder()
            .setId(testId.toString())
            .build();

        when(specializationRepository.findById(testId)).thenReturn(Optional.empty());

        // When
        ResponseEntity<TherapistProto.Specialization> response = specializationService.getSpecialization(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        verify(specializationRepository).findById(testId);
    }

    @Test
    void testGetSpecialization_WithInvalidId_ReturnsBadRequest() {
        // Given
        TherapistProto.GetSpecializationRequest request = TherapistProto.GetSpecializationRequest.newBuilder()
            .setId("invalid-uuid")
            .build();

        // When
        ResponseEntity<TherapistProto.Specialization> response = specializationService.getSpecialization(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(specializationRepository, never()).findById(any(UUID.class));
    }

    @Test
    void testListSpecializations_WithoutCategory_ReturnsAllActiveSpecializations() {
        // Given
        TherapistProto.ListSpecializationsRequest request = TherapistProto.ListSpecializationsRequest.newBuilder()
            .build();

        List<Specialization> specializations = Arrays.asList(testSpecialization);
        List<TherapistProto.Specialization> protoSpecializations = Arrays.asList(testProtoSpecialization);

        when(specializationRepository.findByIsActiveTrueOrderByNameEng()).thenReturn(specializations);

        // When
        ResponseEntity<TherapistProto.ListSpecializationsResponse> response = specializationService.listSpecializations(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getSpecializationsCount());
        assertEquals(testId.toString(), response.getBody().getSpecializations(0).getId());

        verify(specializationRepository).findByIsActiveTrueOrderByNameEng();
        verify(specializationRepository, never()).findByCategoryAndIsActiveTrueOrderByNameEng(anyString());
    }

    @Test
    void testListSpecializations_WithCategory_ReturnsSpecializationsInCategory() {
        // Given
        String category = "Mental Health";
        TherapistProto.ListSpecializationsRequest request = TherapistProto.ListSpecializationsRequest.newBuilder()
            .setCategory(category)
            .build();

        List<Specialization> specializations = Arrays.asList(testSpecialization);

        when(specializationRepository.findByCategoryAndIsActiveTrueOrderByNameEng(category)).thenReturn(specializations);

        // When
        ResponseEntity<TherapistProto.ListSpecializationsResponse> response = specializationService.listSpecializations(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getSpecializationsCount());
        assertEquals(testId.toString(), response.getBody().getSpecializations(0).getId());

        verify(specializationRepository).findByCategoryAndIsActiveTrueOrderByNameEng(category);
        verify(specializationRepository, never()).findByIsActiveTrueOrderByNameEng();
    }

    @Test
    void testSearchSpecializations_WithValidQuery_ReturnsMatchingSpecializations() {
        // Given
        String query = "anxiety";
        TherapistProto.SearchSpecializationsRequest request = TherapistProto.SearchSpecializationsRequest.newBuilder()
            .setQuery(query)
            .build();

        List<Specialization> specializations = Arrays.asList(testSpecialization);

        when(specializationRepository.searchSpecializations(query)).thenReturn(specializations);

        // When
        ResponseEntity<TherapistProto.SearchSpecializationsResponse> response = specializationService.searchSpecializations(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getSpecializationsCount());
        assertEquals(testId.toString(), response.getBody().getSpecializations(0).getId());

        verify(specializationRepository).searchSpecializations(query);
    }

    @Test
    void testSearchSpecializations_WithEmptyQuery_ReturnsBadRequest() {
        // Given
        TherapistProto.SearchSpecializationsRequest request = TherapistProto.SearchSpecializationsRequest.newBuilder()
            .setQuery("")
            .build();

        // When
        ResponseEntity<TherapistProto.SearchSpecializationsResponse> response = specializationService.searchSpecializations(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(specializationRepository, never()).searchSpecializations(anyString());
    }

    @Test
    void testSearchSpecializations_WithWhitespaceQuery_ReturnsBadRequest() {
        // Given
        TherapistProto.SearchSpecializationsRequest request = TherapistProto.SearchSpecializationsRequest.newBuilder()
            .setQuery("   ")
            .build();

        // When
        ResponseEntity<TherapistProto.SearchSpecializationsResponse> response = specializationService.searchSpecializations(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());

        verify(specializationRepository, never()).searchSpecializations(anyString());
    }

    @Test
    void testGetSpecializationCategories_ReturnsAllCategories() {
        // Given
        TherapistProto.GetSpecializationCategoriesRequest request = TherapistProto.GetSpecializationCategoriesRequest.newBuilder()
            .build();

        List<String> categories = Arrays.asList("Mental Health", "Addiction", "Family Therapy");

        when(specializationRepository.findDistinctCategories()).thenReturn(categories);

        // When
        ResponseEntity<TherapistProto.GetSpecializationCategoriesResponse> response = specializationService.getSpecializationCategories(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().getCategoriesCount());
        assertTrue(response.getBody().getCategoriesList().contains("Mental Health"));
        assertTrue(response.getBody().getCategoriesList().contains("Addiction"));
        assertTrue(response.getBody().getCategoriesList().contains("Family Therapy"));

        verify(specializationRepository).findDistinctCategories();
    }

    @Test
    void testGetSpecializationCategories_WithEmptyResult_ReturnsEmptyList() {
        // Given
        TherapistProto.GetSpecializationCategoriesRequest request = TherapistProto.GetSpecializationCategoriesRequest.newBuilder()
            .build();

        when(specializationRepository.findDistinctCategories()).thenReturn(Arrays.asList());

        // When
        ResponseEntity<TherapistProto.GetSpecializationCategoriesResponse> response = specializationService.getSpecializationCategories(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().getCategoriesCount());

        verify(specializationRepository).findDistinctCategories();
    }
}