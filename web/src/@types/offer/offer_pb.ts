// Stub types for offer protobuf interfaces until proto generation is available
// These should match the proto definitions in proto/utro/v1/offer.proto

export interface Offer {
  id: string;
  nameEng: string;
  namePl: string;
  descriptionEng: string;
  descriptionPl: string;
  organisationId: string;
  organisationName: string;
  profileImageMimeType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetOfferRequest {
  id: string;
}

export interface ListOffersRequest {
  organisationId?: string;
  pageSize: number;
  pageNumber: number;
}

export interface ListOffersResponse {
  offers: Offer[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export interface SearchOffersRequest {
  query: string;
  organisationId?: string;
  pageSize: number;
  pageNumber: number;
}

export interface SearchOffersResponse {
  offers: Offer[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

export interface GetOfferProfileImageRequest {
  id: string;
}

export interface GetOfferProfileImageResponse {
  imageData: Uint8Array;
  mimeType: string;
}

export interface CreateOfferRequest {
  organisationId: string;
  nameEng: string;
  namePl: string;
  descriptionEng: string;
  descriptionPl: string;
  profileImageData?: Uint8Array;
  profileImageMimeType?: string;
}

export interface UpdateOfferRequest {
  id: string;
  nameEng?: string;
  namePl?: string;
  descriptionEng?: string;
  descriptionPl?: string;
  profileImageData?: Uint8Array;
  profileImageMimeType?: string;
}

export interface DeleteOfferRequest {
  id: string;
}

export interface DeleteOfferResponse {
  success: boolean;
  message: string;
}

// Schema constants for protobuf creation
export const ListOffersRequestSchema = {};
export const CreateOfferRequestSchema = {};
export const UpdateOfferRequestSchema = {};
export const DeleteOfferRequestSchema = {};
export const GetOfferRequestSchema = {};
export const SearchOffersRequestSchema = {};
export const GetOfferProfileImageRequestSchema = {};