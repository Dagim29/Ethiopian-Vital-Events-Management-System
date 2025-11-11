export interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'vms_officer' | 'statistician';
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  department?: string;
  phone?: string;
  badge_number?: string;
  office_name?: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

