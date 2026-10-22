import type { Money } from './common';

export type CampaignStatus =
  | 'DRAFT'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ENDED'
  | 'CLOSED';

export type CampaignLifecycleAction = 'activate' | 'pause' | 'end' | 'close';

export interface SeasonDto {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface CampaignProductDto {
  id: string;
  name: string;
  slug: string;
  basePrice: Money | null;
}

export interface CampaignDto {
  id: string;
  seasonId: string | null;
  productId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  // Số tài khoản hỗ trợ tối đa cho mỗi mã mời.
  targetQuantity: number;
  startTime: string;
  endTime: string;
  status: CampaignStatus;
  rewards: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  season?: SeasonDto | null;
  product?: CampaignProductDto;
}

export type ParticipantStatus =
  | 'PENDING'
  | 'CHECKING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export interface CampaignParticipantDto {
  id: string;
  campaignId: string;
  accountId: string;
  orderId: string | null;
  inviteCodeMasked: string;
  quantity: number;
  status: ParticipantStatus;
  unitPrice: Money;
  currency: string;
  joinedAt: string;
  cancelledAt: string | null;
  statusHistory: RequestStatusHistoryDto[];
}

export interface RequestStatusHistoryDto {
  from: ParticipantStatus;
  to: ParticipantStatus;
  at: string;
  // accountId của admin đã đổi.
  by: string;
  note?: string;
}

export interface AdminCampaignRequestDto extends CampaignParticipantDto {
  account: { id: string; email: string; name: string } | null;
}

export interface UpdateRequestStatusRequest {
  status: ParticipantStatus;
  note?: string;
}

export interface MyRequestDto extends CampaignParticipantDto {
  campaign: { id: string; name: string; slug: string } | null;
}

export interface JoinCampaignRequest {
  inviteCode: string;
  quantity: number;
}

export interface CreateCampaignRequest {
  productId: string;
  seasonId?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  targetQuantity: number;
  startTime: string;
  endTime: string;
  rewards?: Record<string, unknown>;
}

// BE không cho sửa productId/seasonId/slug/status qua PATCH.
export type UpdateCampaignRequest = Partial<
  Omit<CreateCampaignRequest, 'productId' | 'seasonId' | 'slug'>
>;

export interface CalculatePriceRequest {
  productId: string;
  accountId: string;
  quantity: number;
  seasonId?: string;
  sellerCode?: string;
  couponCode?: string;
}

export interface PriceBreakdownItemDto {
  step: string;
  description: string;
  type: 'base' | 'discount' | 'floor';
  amount: Money;
  discountAmount?: Money;
  discountPercentage?: string;
}

export interface PriceCalculationDto {
  basePrice: Money;
  finalPrice: Money;
  totalDiscount: Money;
  discountPercentage: string;
  breakdown: PriceBreakdownItemDto[];
  priceFloor?: Money;
  floorEnforced: boolean;
}
