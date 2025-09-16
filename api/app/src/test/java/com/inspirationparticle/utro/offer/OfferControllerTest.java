package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.v1.OfferProto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(SpringJUnitExtension.class)
@WebMvcTest(OfferController.class)
class OfferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OfferService offerService;

    @Autowired
    private ObjectMapper objectMapper;

    private OfferProto.Offer testOffer;
    private UUID offerId;
    private UUID organisationId;

    @BeforeEach
    void setUp() {
        offerId = UUID.randomUUID();
        organisationId = UUID.randomUUID();

        testOffer = OfferProto.Offer.newBuilder()
                .setId(offerId.toString())
                .setNameEng("Test Offer")
                .setNamePl("Testowa Oferta")
                .setDescriptionEng("Test description")
                .setDescriptionPl("Testowy opis")
                .setOrganisationId(organisationId.toString())
                .setOrganisationName("Test Organisation")
                .build();
    }

    @Test
    @WithMockUser
    void testGetOffer() throws Exception {
        // Given
        OfferProto.GetOfferRequest request = OfferProto.GetOfferRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        when(offerService.getOffer(any(OfferProto.GetOfferRequest.class)))
                .thenReturn(ResponseEntity.ok(testOffer));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/GetOffer")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(offerId.toString()))
                .andExpect(jsonPath("$.nameEng").value("Test Offer"));

        verify(offerService).getOffer(any(OfferProto.GetOfferRequest.class));
    }

    @Test
    @WithMockUser
    void testListOffers() throws Exception {
        // Given
        OfferProto.ListOffersRequest request = OfferProto.ListOffersRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setPageSize(10)
                .setPageNumber(1)
                .build();

        OfferProto.ListOffersResponse response = OfferProto.ListOffersResponse.newBuilder()
                .addOffers(testOffer)
                .setTotalCount(1)
                .setPageSize(10)
                .setPageNumber(1)
                .build();

        when(offerService.listOffers(any(OfferProto.ListOffersRequest.class)))
                .thenReturn(ResponseEntity.ok(response));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/ListOffers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalCount").value(1))
                .andExpect(jsonPath("$.offers[0].id").value(offerId.toString()));

        verify(offerService).listOffers(any(OfferProto.ListOffersRequest.class));
    }

    @Test
    @WithMockUser
    void testSearchOffers() throws Exception {
        // Given
        OfferProto.SearchOffersRequest request = OfferProto.SearchOffersRequest.newBuilder()
                .setQuery("test")
                .setPageSize(10)
                .setPageNumber(1)
                .build();

        OfferProto.SearchOffersResponse response = OfferProto.SearchOffersResponse.newBuilder()
                .addOffers(testOffer)
                .setTotalCount(1)
                .setPageSize(10)
                .setPageNumber(1)
                .build();

        when(offerService.searchOffers(any(OfferProto.SearchOffersRequest.class)))
                .thenReturn(ResponseEntity.ok(response));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/SearchOffers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalCount").value(1))
                .andExpect(jsonPath("$.offers[0].nameEng").value("Test Offer"));

        verify(offerService).searchOffers(any(OfferProto.SearchOffersRequest.class));
    }

    @Test
    @WithMockUser
    void testCreateOffer() throws Exception {
        // Given
        OfferProto.CreateOfferRequest request = OfferProto.CreateOfferRequest.newBuilder()
                .setOrganisationId(organisationId.toString())
                .setNameEng("New Offer")
                .setNamePl("Nowa Oferta")
                .setDescriptionEng("New description")
                .setDescriptionPl("Nowy opis")
                .build();

        when(offerService.createOffer(any(OfferProto.CreateOfferRequest.class), anyString()))
                .thenReturn(ResponseEntity.ok(testOffer));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/CreateOffer")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists());

        verify(offerService).createOffer(any(OfferProto.CreateOfferRequest.class), anyString());
    }

    @Test
    @WithMockUser
    void testUpdateOffer() throws Exception {
        // Given
        OfferProto.UpdateOfferRequest request = OfferProto.UpdateOfferRequest.newBuilder()
                .setId(offerId.toString())
                .setNameEng("Updated Offer")
                .setDescriptionEng("Updated description")
                .build();

        when(offerService.updateOffer(any(OfferProto.UpdateOfferRequest.class), anyString()))
                .thenReturn(ResponseEntity.ok(testOffer));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/UpdateOffer")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(offerId.toString()));

        verify(offerService).updateOffer(any(OfferProto.UpdateOfferRequest.class), anyString());
    }

    @Test
    @WithMockUser
    void testDeleteOffer() throws Exception {
        // Given
        OfferProto.DeleteOfferRequest request = OfferProto.DeleteOfferRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        OfferProto.DeleteOfferResponse response = OfferProto.DeleteOfferResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Offer deleted successfully")
                .build();

        when(offerService.deleteOffer(any(OfferProto.DeleteOfferRequest.class), anyString()))
                .thenReturn(ResponseEntity.ok(response));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/DeleteOffer")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Offer deleted successfully"));

        verify(offerService).deleteOffer(any(OfferProto.DeleteOfferRequest.class), anyString());
    }

    @Test
    @WithMockUser
    void testGetOfferProfileImage() throws Exception {
        // Given
        OfferProto.GetOfferProfileImageRequest request = OfferProto.GetOfferProfileImageRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        OfferProto.GetOfferProfileImageResponse response = OfferProto.GetOfferProfileImageResponse.newBuilder()
                .setImageData(com.google.protobuf.ByteString.copyFrom("test-image-data".getBytes()))
                .setMimeType("image/png")
                .build();

        when(offerService.getOfferProfileImage(any(OfferProto.GetOfferProfileImageRequest.class)))
                .thenReturn(ResponseEntity.ok(response));

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/GetOfferProfileImage")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.mimeType").value("image/png"));

        verify(offerService).getOfferProfileImage(any(OfferProto.GetOfferProfileImageRequest.class));
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Given
        OfferProto.GetOfferRequest request = OfferProto.GetOfferRequest.newBuilder()
                .setId(offerId.toString())
                .build();

        // When & Then
        mockMvc.perform(post("/com.inspirationparticle.utro.gen.v1.OfferService/GetOffer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

        verify(offerService, never()).getOffer(any());
    }
}