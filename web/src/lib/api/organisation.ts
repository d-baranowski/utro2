import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { create } from '@bufbuild/protobuf';
import {
  OrganisationService,
  GetMyOrganisationsRequestSchema,
  CreateOrganisationRequestSchema,
  SearchOrganisationsRequestSchema,
} from '@/generated/organisation/v1/organisation_pb';

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

const client = createClient(OrganisationService, transport);

export const organisationApi = {
  async getMyOrganisations() {
    const request = create(GetMyOrganisationsRequestSchema, {});
    const response = await client.getMyOrganisations(request);
    return response.organisations;
  },

  async createOrganisation(name: string, description?: string) {
    const request = create(CreateOrganisationRequestSchema, {
      name,
      description: description || '',
    });
    const response = await client.createOrganisation(request);
    if (!response.organisation) {
      throw new Error('Failed to create organisation');
    }
    return response.organisation;
  },

  async searchOrganisations(query: string) {
    const request = create(SearchOrganisationsRequestSchema, {
      query,
    });
    const response = await client.searchOrganisations(request);
    return response.organisations;
  },
};
