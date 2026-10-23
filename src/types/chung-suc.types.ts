export interface Season {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ChungSucCampaign {
  id: string;
  seasonId: string;
  productId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  targetQuantity: number;
  startTime: string;
  endTime: string;
  status: 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ENDED' | 'CLOSED';
  rewards?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  season?: Season;
  product?: Product;
}

export interface ChungSucParticipant {
  id: string;
  campaignId: string;
  accountId: string;
  quantity: number;
  joinedAt: string;
  account?: { id: string; email: string; name: string };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: string;
  minimumSellingPrice?: string;
  seasonId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  seasonId?: string;
  name: string;
  slug: string;
  description?: string;
  quantity: number;
  displayPrice: string;
  unitPrice: string;
  applicableRoles: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  season?: Season;
}

export interface PriceBreakdownItem {
  step: string;
  description: string;
  type: 'base' | 'discount' | 'floor';
  amount: string;
  discountAmount?: string;
  discountPercentage?: string;
}

export interface PriceCalculationResult {
  basePrice: string;
  finalPrice: string;
  totalDiscount: string;
  discountPercentage: string;
  breakdown: PriceBreakdownItem[];
  priceFloor?: string;
  floorEnforced: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleCode: 'USER' | 'ADMIN';
  role: {
    id: string;
    code: string;
    name: string;
  };
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
