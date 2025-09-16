package com.inspirationparticle.utro.offer;

import com.inspirationparticle.utro.gen.offer.v1.OfferProto;
import com.inspirationparticle.utro.organisation.MemberType;
import com.inspirationparticle.utro.organisation.Organisation;
import com.inspirationparticle.utro.organisation.OrganisationMember;
import com.inspirationparticle.utro.organisation.OrganisationMemberRepository;
import com.inspirationparticle.utro.organisation.OrganisationRepository;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class OfferServiceImpl implements OfferService {
    
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;
    private final OrganisationMemberRepository organisationMemberRepository;
    private final OrganisationRepository organisationRepository;

    @Override
    @Transactional
    public ResponseEntity<OfferProto.Offer> createOffer(
            OfferProto.CreateOfferRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID organisationId = UUID.fromString(request.getOrganisationId());
        
        // Check if current user is owner/administrator of the organisation
        if (!isOrganisationOwner(currentUser.getId(), organisationId)) {
            throw new AccessDeniedException("Only organisation owners can create offers");
        }

        // Get organisation
        Organisation organisation = organisationRepository.findById(organisationId)
                .orElseThrow(() -> new IllegalArgumentException("Organisation not found"));

        // Check if offer with same name already exists in organisation
        if (offerRepository.existsByOrganisationIdAndName(
                organisationId, request.getNameEng(), request.getNamePl())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Create new offer using mapper
        Offer offer = OfferRequestMapper.fromCreateRequest(request, organisation);

        offer = offerRepository.save(offer);

        return ResponseEntity.ok(OfferProtoMapper.toProto(offer));
    }

    @Override
    @Transactional
    public ResponseEntity<OfferProto.Offer> updateOffer(
            OfferProto.UpdateOfferRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID offerId = UUID.fromString(request.getId());
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        // Check if current user is owner of the organisation
        if (!isOrganisationOwner(currentUser.getId(), offer.getOrganisation().getId())) {
            throw new AccessDeniedException("Only organisation owners can update offers");
        }

        // Update fields using mapper
        OfferRequestMapper.updateFromRequest(offer, request);

        offer = offerRepository.save(offer);

        return ResponseEntity.ok(OfferProtoMapper.toProto(offer));
    }

    @Override
    @Transactional
    public ResponseEntity<OfferProto.DeleteOfferResponse> deleteOffer(
            OfferProto.DeleteOfferRequest request, String username) {
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        UUID offerId = UUID.fromString(request.getId());
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        // Only organisation owner can delete
        if (!isOrganisationOwner(currentUser.getId(), offer.getOrganisation().getId())) {
            throw new AccessDeniedException("Only organisation owners can delete offers");
        }

        offerRepository.delete(offer);

        return ResponseEntity.ok(OfferProto.DeleteOfferResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Offer deleted successfully")
                .build());
    }

    @Override
    public ResponseEntity<OfferProto.Offer> getOffer(OfferProto.GetOfferRequest request) {
        UUID offerId = UUID.fromString(request.getId());
        
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        return ResponseEntity.ok(OfferProtoMapper.toProto(offer));
    }

    @Override
    public ResponseEntity<OfferProto.ListOffersResponse> listOffers(
            OfferProto.ListOffersRequest request) {
        
        List<Offer> offers;
        
        if (request.hasOrganisationId()) {
            UUID organisationId = UUID.fromString(request.getOrganisationId());
            offers = offerRepository.findByOrganisationIdOrderByCreatedAtDesc(organisationId);
        } else {
            offers = offerRepository.findAll();
        }

        // Convert to proto messages
        List<OfferProto.Offer> protoOffers = offers.stream()
                .map(OfferProtoMapper::toProto)
                .toList();

        return ResponseEntity.ok(OfferProto.ListOffersResponse.newBuilder()
                .addAllOffers(protoOffers)
                .setTotalCount(protoOffers.size())
                .setPageSize(request.getPageSize())
                .setPageNumber(request.getPageNumber())
                .build());
    }

    @Override
    public ResponseEntity<OfferProto.SearchOffersResponse> searchOffers(
            OfferProto.SearchOffersRequest request) {
        
        List<Offer> offers;
        
        if (request.hasOrganisationId()) {
            UUID organisationId = UUID.fromString(request.getOrganisationId());
            offers = offerRepository.findByOrganisationIdAndSearchTerm(
                    organisationId, request.getQuery());
        } else {
            offers = offerRepository.searchOffers(request.getQuery());
        }

        // Convert to proto messages
        List<OfferProto.Offer> protoOffers = offers.stream()
                .map(OfferProtoMapper::toProto)
                .toList();

        return ResponseEntity.ok(OfferProto.SearchOffersResponse.newBuilder()
                .addAllOffers(protoOffers)
                .setTotalCount(protoOffers.size())
                .setPageSize(request.getPageSize())
                .setPageNumber(request.getPageNumber())
                .build());
    }

    @Override
    public ResponseEntity<OfferProto.GetOfferProfileImageResponse> getOfferProfileImage(
            OfferProto.GetOfferProfileImageRequest request) {
        
        UUID offerId = UUID.fromString(request.getId());
        
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        if (offer.getProfileImage() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(OfferProto.GetOfferProfileImageResponse.newBuilder()
                .setImageData(com.google.protobuf.ByteString.copyFrom(offer.getProfileImage()))
                .setMimeType(offer.getProfileImageMimeType())
                .build());
    }

    private boolean isOrganisationOwner(UUID userId, UUID organisationId) {
        Optional<OrganisationMember> membership = organisationMemberRepository
                .findByUserIdAndOrganisationId(userId, organisationId);
        return membership.isPresent() && 
               (membership.get().getMemberType() == MemberType.ADMINISTRATOR ||
                membership.get().getMemberType() == MemberType.OWNER);
    }
}