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

export interface GetRoleResponse {
  code: number;
  message: string;
  role: string;
}

export interface LogoutResponse {
  code: number;
  message: string;
}

export interface ForgotPasswordResponse {
  code: number;
  message: string;
}

export interface ResetPasswordResponse {
  code: number;
  message: string;
}
