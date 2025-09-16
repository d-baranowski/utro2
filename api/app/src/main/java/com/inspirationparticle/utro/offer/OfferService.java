package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.v1.OfferProto;
import org.springframework.http.ResponseEntity;

public interface OfferService {
    
    /**
     * Create a new offer (Owner role only)
     */
    ResponseEntity<OfferProto.Offer> createOffer(
            OfferProto.CreateOfferRequest request, String username);
    
    /**
     * Update an existing offer (Owner role only)
     */
    ResponseEntity<OfferProto.Offer> updateOffer(
            OfferProto.UpdateOfferRequest request, String username);
    
    /**
     * Delete an offer (Owner role only)
     */
    ResponseEntity<OfferProto.DeleteOfferResponse> deleteOffer(
            OfferProto.DeleteOfferRequest request, String username);
    
    /**
     * Get a single offer by ID
     */
    ResponseEntity<OfferProto.Offer> getOffer(
            OfferProto.GetOfferRequest request);
    
    /**
     * List offers with optional filtering
     */
    ResponseEntity<OfferProto.ListOffersResponse> listOffers(
            OfferProto.ListOffersRequest request);
    
    /**
     * Search offers by term
     */
    ResponseEntity<OfferProto.SearchOffersResponse> searchOffers(
            OfferProto.SearchOffersRequest request);
    
    /**
     * Get offer profile image
     */
    ResponseEntity<OfferProto.GetOfferProfileImageResponse> getOfferProfileImage(
            OfferProto.GetOfferProfileImageRequest request);
}