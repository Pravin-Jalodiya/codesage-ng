import {Role} from "../config/roles.config";

export interface RoleResponse {
  code: number;
  role: Role;
  message?: string;
}

export interface LoginResponse {
  code: number;
  token: string;
  role: string;
  message: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  organization: string;
  country: string;
  leetcodeId: string;
}

export interface UpdateProfileRequest {
  username?: string;
  fullname?: string;
  email?: string;
  leetcodeId?: string;
  country?: string;
  organisation?: string;
}

// src/app/shared/types/responses.types.ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

// export interface UserProfileResponse {
//   code: number;
//   user_profile: UserProfile;
// }
//
// export interface UserProgressResponse {
//   code: number;
//   message: string;
//   leetcodeStats: LeetCodeStats;
//   codesageStats: CodeSageStats;
// }
