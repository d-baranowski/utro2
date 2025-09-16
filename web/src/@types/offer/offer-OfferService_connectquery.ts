// Stub Connect Query hooks for offer service until proto generation is available
// These should match the generated hooks from proto definitions

import { useMutation, useQuery } from '@connectrpc/connect-query';
import type {
  Offer,
  ListOffersRequest,
  ListOffersResponse,
  SearchOffersRequest,
  SearchOffersResponse,
  CreateOfferRequest,
  UpdateOfferRequest,
  DeleteOfferRequest,
  DeleteOfferResponse,
  GetOfferRequest,
  GetOfferProfileImageRequest,
  GetOfferProfileImageResponse,
} from '../@types/offer/offer_pb';

// Mock service endpoints - these would be generated from protobuf
const OFFER_SERVICE_BASE = '/com.inspirationparticle.utro.gen.v1.OfferService/';

export const listOffers = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'ListOffers',
  endpoint: `${OFFER_SERVICE_BASE}ListOffers`,
} as const;

export const searchOffers = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'SearchOffers',
  endpoint: `${OFFER_SERVICE_BASE}SearchOffers`,
} as const;

export const getOffer = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'GetOffer',
  endpoint: `${OFFER_SERVICE_BASE}GetOffer`,
} as const;

export const createOffer = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'CreateOffer',
  endpoint: `${OFFER_SERVICE_BASE}CreateOffer`,
} as const;

export const updateOffer = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'UpdateOffer',
  endpoint: `${OFFER_SERVICE_BASE}UpdateOffer`,
} as const;

export const deleteOffer = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'DeleteOffer',
  endpoint: `${OFFER_SERVICE_BASE}DeleteOffer`,
} as const;

export const getOfferProfileImage = {
  service: {
    typeName: 'utro.v1.OfferService',
  },
  name: 'GetOfferProfileImage',
  endpoint: `${OFFER_SERVICE_BASE}GetOfferProfileImage`,
} as const;

// Export hooks that would be generated
export { useQuery as useListOffers } from '@connectrpc/connect-query';
export { useQuery as useSearchOffers } from '@connectrpc/connect-query';
export { useQuery as useGetOffer } from '@connectrpc/connect-query';
export { useMutation as useCreateOffer } from '@connectrpc/connect-query';
export { useMutation as useUpdateOffer } from '@connectrpc/connect-query';
export { useMutation as useDeleteOffer } from '@connectrpc/connect-query';
export { useQuery as useGetOfferProfileImage } from '@connectrpc/connect-query';