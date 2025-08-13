import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import {
  OrganisationService,
  GetMyOrganisationsRequest,
  CreateOrganisationRequest,
  SearchOrganisationsRequest,
} from '@/generated/organisation/v1/organisation_pb';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const transport = createConnectTransport({
  baseUrl: API_URL,
  interceptors: [
    (next) => async (req) => {
      const token = localStorage.getItem('token');
      if (token) {
        req.header.set('Authorization', `Bearer ${token}`);
      }
      return await next(req);
    },
  ],
});

const client = createClient(OrganisationService, transport);

export const organisationApi = {
  async getMyOrganisations() {
    const request: GetMyOrganisationsRequest = {};
    const response = await client.getMyOrganisations(request);
    return response.organisations;
  },

  async createOrganisation(name: string, description?: string) {
    const request: CreateOrganisationRequest = {
      name,
      description,
    };
    const response = await client.createOrganisation(request);
    return response.organisation;
  },

  async searchOrganisations(query: string) {
    const request: SearchOrganisationsRequest = {
      query,
    };
    const response = await client.searchOrganisations(request);
    return response.organisations;
  },
};
