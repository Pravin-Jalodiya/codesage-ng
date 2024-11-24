export interface UserProfile {
  username: string;
  name: string;
  email: string;
  leetcodeId: string;
  organisation: string;
  country: string;
  avatar: string;
}

export interface UserProfileResponse {
  code: number;
  message: string;
  user_profile: UserProfile;
}

export interface UpdateProfileResponse {
  code: number;
  message: string;
}
