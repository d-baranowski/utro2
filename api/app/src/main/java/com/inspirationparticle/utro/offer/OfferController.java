package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.v1.OfferProto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class OfferController {

    @Autowired
    private OfferService offerService;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/GetOffer",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.Offer> getOffer(@RequestBody OfferProto.GetOfferRequest request) {
        return offerService.getOffer(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/ListOffers",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.ListOffersResponse> listOffers(@RequestBody OfferProto.ListOffersRequest request) {
        return offerService.listOffers(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/SearchOffers",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.SearchOffersResponse> searchOffers(@RequestBody OfferProto.SearchOffersRequest request) {
        return offerService.searchOffers(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/GetOfferProfileImage",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.GetOfferProfileImageResponse> getOfferProfileImage(@RequestBody OfferProto.GetOfferProfileImageRequest request) {
        return offerService.getOfferProfileImage(request);
    }

    // CRUD operations - Owner role only
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/CreateOffer",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.Offer> createOffer(@RequestBody OfferProto.CreateOfferRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return offerService.createOffer(request, username);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/UpdateOffer",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.Offer> updateOffer(@RequestBody OfferProto.UpdateOfferRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return offerService.updateOffer(request, username);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.OfferService/DeleteOffer",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<OfferProto.DeleteOfferResponse> deleteOffer(@RequestBody OfferProto.DeleteOfferRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return offerService.deleteOffer(request, username);
    }
}