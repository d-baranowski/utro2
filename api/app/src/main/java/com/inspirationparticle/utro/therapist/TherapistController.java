package com.inspirationparticle.utro.therapist;

import com.inspirationparticle.utro.gen.v1.TherapistProto;
import com.inspirationparticle.utro.user.User;
import com.inspirationparticle.utro.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
public class TherapistController {

    @Autowired
    private TherapistServiceImpl therapistService;

    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/GetTherapist",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Therapist> getTherapist(@RequestBody TherapistProto.GetTherapistRequest request) {
        return therapistService.getTherapist(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/GetTherapistBySlug",
                 consumes = "application/json", 
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Therapist> getTherapistBySlug(@RequestBody TherapistProto.GetTherapistBySlugRequest request) {
        return therapistService.getTherapistBySlug(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/GetTherapistByUser",
                 consumes = "application/json",
                 produces = "application/json") 
    public ResponseEntity<TherapistProto.Therapist> getTherapistByUser(@RequestBody TherapistProto.GetTherapistByUserRequest request) {
        return therapistService.getTherapistByUser(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/ListTherapists",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.ListTherapistsResponse> listTherapists(@RequestBody TherapistProto.ListTherapistsRequest request) {
        return therapistService.listTherapists(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/SearchTherapists",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.SearchTherapistsResponse> searchTherapists(@RequestBody TherapistProto.SearchTherapistsRequest request) {
        return therapistService.searchTherapists(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/GetTherapistProfileImage",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.GetTherapistProfileImageResponse> getTherapistProfileImage(@RequestBody TherapistProto.GetTherapistProfileImageRequest request) {
        return therapistService.getTherapistProfileImage(request);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/CreateTherapist",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Therapist> createTherapist(@RequestBody TherapistProto.CreateTherapistRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return therapistService.createTherapist(request, username);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/UpdateTherapist",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Therapist> updateTherapist(@RequestBody TherapistProto.UpdateTherapistRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return therapistService.updateTherapist(request, username);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/DeleteTherapist",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.DeleteTherapistResponse> deleteTherapist(@RequestBody TherapistProto.DeleteTherapistRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return therapistService.deleteTherapist(request, username);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/PublishTherapist",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Therapist> publishTherapist(@RequestBody TherapistProto.PublishTherapistRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return therapistService.publishTherapist(request, username);
    }

    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping(value = "/com.inspirationparticle.utro.gen.v1.TherapistService/UnpublishTherapist",
                 consumes = "application/json",
                 produces = "application/json")
    public ResponseEntity<TherapistProto.Therapist> unpublishTherapist(@RequestBody TherapistProto.UnpublishTherapistRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return therapistService.unpublishTherapist(request, username);
    }
}