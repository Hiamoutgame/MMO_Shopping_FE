import { httpClient } from './httpClient';
import { API_PATHS } from '../const/apiPath';

export interface CreateProductViewRequest {
  productId: string;
  sessionId?: string;
  source?: string;
}

export const shoppingApi = {
  recordProductView(payload: CreateProductViewRequest): Promise<{ productView: { id: string } }> {
    return httpClient.post<{ productView: { id: string } }>(
      API_PATHS.PRODUCT_VIEWS.CREATE,
      payload,
    );
  },
};
