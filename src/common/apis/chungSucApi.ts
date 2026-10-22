import { httpClient } from './httpClient';
import { API_PATHS } from '../const/apiPath';
import type {
  AdminCampaignRequestDto,
  CalculatePriceRequest,
  CampaignDto,
  CampaignLifecycleAction,
  CampaignParticipantDto,
  CreateCampaignRequest,
  JoinCampaignRequest,
  MyRequestDto,
  PriceCalculationDto,
  SeasonDto,
  UpdateCampaignRequest,
  UpdateRequestStatusRequest,
} from '../models/chungSuc';

export const chungSucApi = {
  activeCampaigns(): Promise<CampaignDto[]> {
    return httpClient.get<CampaignDto[]>(API_PATHS.CAMPAIGNS.ACTIVE);
  },

  campaign(id: string): Promise<CampaignDto> {
    return httpClient.get<CampaignDto>(API_PATHS.CAMPAIGNS.DETAIL(id));
  },

  join(id: string, payload: JoinCampaignRequest): Promise<CampaignParticipantDto> {
    return httpClient.post<CampaignParticipantDto>(API_PATHS.CAMPAIGNS.JOIN(id), payload);
  },

  myRequests(): Promise<MyRequestDto[]> {
    return httpClient.get<MyRequestDto[]>(API_PATHS.CAMPAIGNS.MY_REQUESTS);
  },

  cancelRequest(requestId: string): Promise<CampaignParticipantDto> {
    return httpClient.post<CampaignParticipantDto>(API_PATHS.CAMPAIGNS.CANCEL_REQUEST(requestId));
  },

  calculatePrice(payload: CalculatePriceRequest): Promise<PriceCalculationDto> {
    return httpClient.post<PriceCalculationDto>(API_PATHS.PRICING.CALCULATE, payload);
  },
};

export const adminChungSucApi = {
  campaigns(): Promise<CampaignDto[]> {
    return httpClient.get<CampaignDto[]>(API_PATHS.CAMPAIGNS.LIST);
  },

  seasons(): Promise<SeasonDto[]> {
    return httpClient.get<SeasonDto[]>(API_PATHS.SEASONS.LIST);
  },

  createCampaign(payload: CreateCampaignRequest): Promise<CampaignDto> {
    return httpClient.post<CampaignDto>(API_PATHS.CAMPAIGNS.LIST, payload);
  },

  updateCampaign(id: string, payload: UpdateCampaignRequest): Promise<CampaignDto> {
    return httpClient.patch<CampaignDto>(API_PATHS.CAMPAIGNS.DETAIL(id), payload);
  },

  runLifecycle(id: string, action: CampaignLifecycleAction): Promise<CampaignDto> {
    return httpClient.post<CampaignDto>(API_PATHS.CAMPAIGNS.LIFECYCLE(id, action));
  },

  requests(campaignId: string): Promise<AdminCampaignRequestDto[]> {
    return httpClient.get<AdminCampaignRequestDto[]>(API_PATHS.CAMPAIGNS.PARTICIPANTS(campaignId));
  },

  updateRequestStatus(
    requestId: string,
    payload: UpdateRequestStatusRequest,
  ): Promise<CampaignParticipantDto> {
    return httpClient.patch<CampaignParticipantDto>(
      API_PATHS.CAMPAIGNS.REQUEST_STATUS(requestId),
      payload,
    );
  },

  deleteCampaign(id: string): Promise<{ id: string }> {
    return httpClient.delete<{ id: string }>(API_PATHS.CAMPAIGNS.DETAIL(id));
  },
};
