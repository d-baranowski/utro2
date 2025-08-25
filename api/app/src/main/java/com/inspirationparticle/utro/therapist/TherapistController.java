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
}