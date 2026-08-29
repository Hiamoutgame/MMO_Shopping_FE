import { httpClient } from './httpClient';
import { API_PATHS } from '../const/apiPath';
import type {
  CategoryDto,
  ProductDetailDto,
  ProductListItemDto,
  ProductListQuery,
} from '../models/catalog';
import type { PaginatedResponse } from '../models/common';

export const catalogApi = {
  listCategories(): Promise<PaginatedResponse<CategoryDto>> {
    return httpClient.get<PaginatedResponse<CategoryDto>>(API_PATHS.CATEGORIES.LIST, {
      params: { pageSize: 100 },
    });
  },

  listProducts(query: ProductListQuery = {}): Promise<PaginatedResponse<ProductListItemDto>> {
    const params: Record<string, string | number | boolean> = {};
    if (query.page) params.page = query.page;
    if (query.pageSize) params.pageSize = query.pageSize;
    if (query.categoryId) params.categoryId = query.categoryId;
    if (query.minPrice) params.minPrice = query.minPrice;
    if (query.maxPrice) params.maxPrice = query.maxPrice;
    if (query.inStock !== undefined) params.inStock = query.inStock;

    return httpClient.get<PaginatedResponse<ProductListItemDto>>(API_PATHS.PRODUCTS.LIST, {
      params,
    });
  },

  getProduct(id: string): Promise<ProductDetailDto> {
    return httpClient.get<ProductDetailDto>(API_PATHS.PRODUCTS.DETAIL(id));
  },
};
