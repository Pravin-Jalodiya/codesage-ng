export interface SignupRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  organisation: string;
  country: string;
  leetcode_id: string;
}

export interface SignupResponse {
  code: number;
  message: string;
  user_info: {
    role: string;
    username: string;
  };
}

// Interfaces for Login
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  role: string;
  token: string;
}

// Interfaces for GetRole
export interface GetRoleResponse {
  code: number;
  message: string;
  role: string;
}

// Interfaces for Logout
export interface LogoutResponse {
  code: number;
  message: string;
}
