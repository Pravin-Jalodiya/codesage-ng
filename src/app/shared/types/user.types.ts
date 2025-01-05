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

export interface UserProgressResponse {
  code: number;
  message: string;
  leetcodeStats: LeetcodeStats;
  codesageStats: CodesageStats;
}

export interface LeetcodeStats {
  TotalQuestionsCount: number;
  TotalQuestionsDoneCount: number;
  TotalEasyCount: number;
  TotalMediumCount: number;
  TotalHardCount: number;
  EasyDoneCount: number;
  MediumDoneCount: number;
  HardDoneCount: number;
  recent_ac_submission_title: string[];
  recent_ac_submissions_title_slugs: string[];
  recent_ac_submission_ids: string[];
}

export interface CodesageStats {
  TotalQuestionsCount: number;
  TotalQuestionsDoneCount: number;
  TotalEasyCount: number;
  TotalMediumCount: number;
  TotalHardCount: number;
  EasyDoneCount: number;
  MediumDoneCount: number;
  HardDoneCount: number;
  CompanyWiseStats: Record<string, number>;
  TopicWiseStats: Record<string, number>;
}

export interface UserProgressListResponse {
  code: number;
  message: string;
  progress_list: string[];
}