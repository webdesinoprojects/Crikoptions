export interface RiskLimits {
  maxExposure: number;
  defaultLeverage: number;
  autoKillSwitch: boolean;
}

export interface Preferences {
  theme: string;
  dataDensity: string;
  notificationsEnabled: boolean;
}

export interface UserSettings {
  riskLimits: RiskLimits;
  preferences: Preferences;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  tier?: string;
  role?: "user" | "admin" | string;
  settings?: UserSettings;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  name: string;
  phone?: string;
}
