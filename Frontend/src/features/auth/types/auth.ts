export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
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
