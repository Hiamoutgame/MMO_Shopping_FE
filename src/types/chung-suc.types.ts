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
  rewards?: Record<string, any>;
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
  account?: any;
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

export interface SellerProfile {
  id: string;
  accountId: string;
  businessName: string;
  businessType?: string;
  taxId?: string;
  businessAddress?: string;
  phoneNumber?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  commissionRate: number;
  totalSales: string;
  totalCommission: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerReferralCode {
  id: string;
  sellerId: string;
  code: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  roleCode: 'USER' | 'SELLER' | 'ADMIN';
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
