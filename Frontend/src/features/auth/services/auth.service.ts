import { apiClient } from "@/lib/api/client";
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from "../types/auth";

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/v1/auth/register", credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/v1/auth/login", credentials);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/v1/auth/me");
    return response.data;
  },

  async updateProfile(profile: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>("/v1/users/me", profile);
    return response.data;
  },
};
