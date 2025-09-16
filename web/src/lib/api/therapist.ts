import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { create } from '@bufbuild/protobuf';
import {
  TherapistService,
  SpecializationService,
  ListTherapistsRequestSchema,
  SearchTherapistsRequestSchema,
  GetTherapistRequestSchema,
  GetTherapistBySlugRequestSchema,
  CreateTherapistRequestSchema,
  UpdateTherapistRequestSchema,
  DeleteTherapistRequestSchema,
  PublishTherapistRequestSchema,
  UnpublishTherapistRequestSchema,
  ListSpecializationsRequestSchema,
} from '@/generated/utro/v1/therapist_pb';

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

const client = createClient(TherapistService, transport);
const specializationClient = createClient(SpecializationService, transport);

export const therapistApi = {
  async listTherapists(
    params: {
      organisationId?: string;
      pageSize?: number;
      pageNumber?: number;
      specializationId?: string;
      language?: string;
      inPerson?: boolean;
      online?: boolean;
      acceptingClients?: boolean;
    } = {}
  ) {
    const request = create(ListTherapistsRequestSchema, {
      organisationId: params.organisationId,
      pageSize: params.pageSize || 12,
      pageNumber: params.pageNumber || 1,
      specializationId: params.specializationId,
      language: params.language,
      inPerson: params.inPerson,
      online: params.online,
      acceptingClients: params.acceptingClients,
    });
    const response = await client.listTherapists(request);
    return {
      therapists: response.therapists,
      totalCount: response.totalCount,
      pageSize: response.pageSize,
      pageNumber: response.pageNumber,
    };
  },

  async searchTherapists(query: string, organisationId?: string) {
    const request = create(SearchTherapistsRequestSchema, {
      query,
    });
    const response = await client.searchTherapists(request);
    return response.therapists;
  },

  async getTherapist(id: string) {
    const request = create(GetTherapistRequestSchema, {
      id,
    });
    const response = await client.getTherapist(request);
    return response;
  },

  async getTherapistBySlug(slug: string) {
    const request = create(GetTherapistBySlugRequestSchema, {
      slug,
    });
    const response = await client.getTherapistBySlug(request);
    return response;
  },

  async createTherapist(data: {
    userId: string;
    organisationId: string;
    professionalTitle: string;
    descriptionEng?: string;
    descriptionPl?: string;
    workExperienceEng?: string;
    workExperiencePl?: string;
    languages: string[];
    inPersonTherapyFormat: boolean;
    onlineTherapyFormat: boolean;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    isAcceptingNewClients: boolean;
    slug: string;
    searchTags: string[];
  }) {
    const request = create(CreateTherapistRequestSchema, {
      userId: data.userId,
      organisationId: data.organisationId,
      professionalTitle: data.professionalTitle,
      descriptionEng: data.descriptionEng || '',
      descriptionPl: data.descriptionPl || '',
      workExperienceEng: data.workExperienceEng || '',
      workExperiencePl: data.workExperiencePl || '',
      languages: data.languages,
      inPersonTherapyFormat: data.inPersonTherapyFormat,
      onlineTherapyFormat: data.onlineTherapyFormat,
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      websiteUrl: data.websiteUrl || '',
      isAcceptingNewClients: data.isAcceptingNewClients,
      slug: data.slug,
      searchTags: data.searchTags,
    });
    const response = await client.createTherapist(request);
    return response;
  },

  async updateTherapist(data: {
    id: string;
    professionalTitle?: string;
    descriptionEng?: string;
    descriptionPl?: string;
    workExperienceEng?: string;
    workExperiencePl?: string;
    languages?: string[];
    inPersonTherapyFormat?: boolean;
    onlineTherapyFormat?: boolean;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    isAcceptingNewClients?: boolean;
    slug?: string;
    searchTags?: string[];
  }) {
    const request = create(UpdateTherapistRequestSchema, {
      id: data.id,
      professionalTitle: data.professionalTitle || '',
      descriptionEng: data.descriptionEng || '',
      descriptionPl: data.descriptionPl || '',
      workExperienceEng: data.workExperienceEng || '',
      workExperiencePl: data.workExperiencePl || '',
      languages: data.languages || [],
      inPersonTherapyFormat: data.inPersonTherapyFormat || false,
      onlineTherapyFormat: data.onlineTherapyFormat || false,
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      websiteUrl: data.websiteUrl || '',
      isAcceptingNewClients: data.isAcceptingNewClients || false,
      slug: data.slug || '',
      searchTags: data.searchTags || [],
    });
    const response = await client.updateTherapist(request);
    return response;
  },

  async deleteTherapist(id: string) {
    const request = create(DeleteTherapistRequestSchema, {
      id,
    });
    const response = await client.deleteTherapist(request);
    return response;
  },

  async publishTherapist(id: string) {
    const request = create(PublishTherapistRequestSchema, {
      id,
    });
    const response = await client.publishTherapist(request);
    return response;
  },

  async unpublishTherapist(id: string) {
    const request = create(UnpublishTherapistRequestSchema, {
      id,
    });
    const response = await client.unpublishTherapist(request);
    return response;
  },

  async listSpecializations() {
    const request = create(ListSpecializationsRequestSchema, {});
    const response = await specializationClient.listSpecializations(request);
    return response.specializations;
  },
};
