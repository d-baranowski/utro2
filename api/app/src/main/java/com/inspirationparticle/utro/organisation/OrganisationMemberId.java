package com.inspirationparticle.utro.organisation;

import lombok.*;

import java.io.Serializable;

@Setter
@Getter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class OrganisationMemberId implements Serializable {
    private String user;
    private String organisation;
}
