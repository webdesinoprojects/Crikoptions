import { create } from "zustand";
import { User, LoginCredentials, RegisterCredentials } from "../types/auth";
import { authService } from "../services/auth.service";
import { getErrorMessage } from "@/lib/error-message";
import { socketManager } from "@/lib/websocket/socket-manager";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const getStoredToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("crik_token") || null;
  }
  return null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getStoredToken(),
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.login(credentials);
      if (typeof window !== "undefined") {
        localStorage.setItem("crik_token", token);
      }
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error, "Failed to sign in");
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.loginWithGoogle(credential);
      if (typeof window !== "undefined") {
        localStorage.setItem("crik_token", token);
      }
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error, "Google sign-in failed");
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Create the user account
      await authService.register(credentials);
      
      // 2. Perform login immediately to get token and user session
      const { token, user } = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("crik_token", token);
      }
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error, "Failed to register");
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("crik_token");
    }
    socketManager.disconnect();
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(profile);
      set({ user: updatedUser, isLoading: false });
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error, "Failed to update profile");
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  initializeAuth: async () => {
    let token = get().token;
    if ((!token || token === "undefined") && typeof window !== "undefined") {
      token = localStorage.getItem("crik_token");
    }
    if (!token || token === "undefined") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("crik_token");
      }
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    set({ token, isLoading: true });
    try {
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token is likely invalid or expired
      if (typeof window !== "undefined") {
        localStorage.removeItem("crik_token");
      }
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
