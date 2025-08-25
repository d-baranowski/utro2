package com.inspirationparticle.utro.organisation;

import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Setter
@Getter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class OrganisationMemberId implements Serializable {
    private UUID user;
    private UUID organisation;
}
