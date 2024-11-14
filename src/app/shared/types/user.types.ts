export interface FilterOption {
  name: string;
}

export interface UsersListResponse {
  code: number;
  message: string;
  total: number;
  users: User[];
}

export interface UserBanToggleResponse {
  code: number,
  message: string;
}

export interface User {
  role: string,
  username: string,
  name: string,
  email: string,
  organisation: string,
  country: string,
  is_banned: boolean,
  leetcode_id: string,
  last_seen: Date
}
