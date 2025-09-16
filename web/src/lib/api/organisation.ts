import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { create } from '@bufbuild/protobuf';
import {
  OrganisationService,
  GetMyOrganisationsRequestSchema,
  CreateOrganisationRequestSchema,
  SearchOrganisationsRequestSchema,
  GetOrganisationUsersRequestSchema,
  RemoveOrganisationMemberRequestSchema,
} from '@/generated/organisation/v1/organisation_pb';
import {
  InvitationService,
  CreateInvitationRequestSchema,
  GetInvitationsRequestSchema,
  RespondToInvitationRequestSchema,
  CancelInvitationRequestSchema,
} from '@/generated/organisation/v1/invitation_pb';

import config from '@/config/env';

const API_URL = config.apiBaseUrl;

const transport = createConnectTransport({
  baseUrl: API_URL,
  useBinaryFormat: false, // Use JSON instead of binary protobuf
  interceptors: [
    (next) => async (req) => {
      const token = localStorage.getItem('token');
      if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
      }
      // Force JSON content-type headers
      req.header.set('Content-Type', 'application/json');
      req.header.set('Accept', 'application/json');
      return await next(req);
    },
  ],
});

const organisationClient = createClient(OrganisationService, transport);
const invitationClient = createClient(InvitationService, transport);

export const organisationApi = {
  async getMyOrganisations() {
    const request = create(GetMyOrganisationsRequestSchema, {});
    const response = await organisationClient.getMyOrganisations(request);
    return response.organisations;
  },

  async createOrganisation(name: string, description?: string) {
    const request = create(CreateOrganisationRequestSchema, {
      name,
      description: description || '',
    });
    const response = await organisationClient.createOrganisation(request);
    if (!response.organisation) {
      throw new Error('Failed to create organisation');
    }
    return response.organisation;
  },

  async searchOrganisations(query: string) {
    const request = create(SearchOrganisationsRequestSchema, {
      query,
    });
    const response = await organisationClient.searchOrganisations(request);
    return response.organisations;
  },

  async getOrganisationUsers(organisationId: string) {
    const request = create(GetOrganisationUsersRequestSchema, {
      organisationId,
    });
    const response = await organisationClient.getOrganisationUsers(request);
    return response.users;
  },

  async createInvitation(organisationId: string, email: string, memberType: number) {
    const request = create(CreateInvitationRequestSchema, {
      organisationId,
      email,
      memberType,
    });
    const response = await invitationClient.createInvitation(request);
    return response.invitation;
  },

  async getInvitations(organisationId: string) {
    const request = create(GetInvitationsRequestSchema, {
      organisationId,
    });
    const response = await invitationClient.getInvitations(request);
    return response.invitations;
  },

  async respondToInvitation(invitationId: string, accept: boolean) {
    const request = create(RespondToInvitationRequestSchema, {
      invitationId,
      accept,
    });
    const response = await invitationClient.respondToInvitation(request);
    return response.invitation;
  },

  async cancelInvitation(invitationId: string) {
    const request = create(CancelInvitationRequestSchema, {
      invitationId,
    });
    const response = await invitationClient.cancelInvitation(request);
    return response.success;
  },

  async removeOrganisationMember(organisationId: string, userId: string) {
    const request = create(RemoveOrganisationMemberRequestSchema, {
      organisationId,
      userId,
    });
    const response = await organisationClient.removeOrganisationMember(request);
    return response.success;
  },
};
