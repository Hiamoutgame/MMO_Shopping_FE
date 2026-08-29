import { httpClient } from './httpClient';
import { API_PATHS } from '../const/apiPath';
import type {
  AuthResponseDto,
  LoginRequest,
  LogoutRequest,
  MeResponseDto,
  RefreshRequest,
  RefreshResponseDto,
  RegisterRequest,
} from '../models/identity';

export const identityApi = {
  login(payload: LoginRequest): Promise<AuthResponseDto> {
    return httpClient.post<AuthResponseDto>(API_PATHS.AUTH.LOGIN, payload);
  },

  register(payload: RegisterRequest): Promise<AuthResponseDto> {
    return httpClient.post<AuthResponseDto>(API_PATHS.AUTH.REGISTER, payload);
  },

  refresh(payload: RefreshRequest): Promise<RefreshResponseDto> {
    return httpClient.post<RefreshResponseDto>(API_PATHS.AUTH.REFRESH, payload);
  },

  me(): Promise<MeResponseDto> {
    return httpClient.get<MeResponseDto>(API_PATHS.AUTH.ME);
  },

  logout(payload: LogoutRequest): Promise<unknown> {
    return httpClient.post<unknown>(API_PATHS.AUTH.LOGOUT, payload);
  },
};
