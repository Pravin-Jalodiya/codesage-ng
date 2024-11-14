export interface DifficultyWiseQuestionsCount {
  easy: number;
  medium: number;
  hard: number;
}

export interface PlatformStats {
  ActiveUserInLast24Hours: number;
  TotalQuestionsCount: number;
  DifficultyWiseQuestionsCount: DifficultyWiseQuestionsCount;
  TopicWiseQuestionsCount: Record<string, number>;
  CompanyWiseQuestionsCount: Record<string, number>;
}

export interface PlatformStatsResponse {
  code: number;
  message: string;
  stats: PlatformStats;
}
