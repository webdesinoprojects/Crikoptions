import { apiClient } from "@/lib/api/client";
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from "../types/auth";

export const authService = {
  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User }>("/v1/auth/register", credentials);
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>("/v1/auth/login", credentials);
    return response.data.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>("/v1/auth/me");
    return response.data.data;
  },

  async updateProfile(profile: Partial<User>): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; data: User }>("/v1/users/me", profile);
    return response.data.data;
  },
};
