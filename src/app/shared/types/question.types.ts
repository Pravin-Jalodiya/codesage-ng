export interface Question {
  question_id: string;
  question_title_slug: string
  question_title: string;
  difficulty: string;
  question_link: string;
  topic_tags: string[];
  company_tags: string[];
}

export interface FilterOption {
  name: string;
}

export interface QuestionsResponse {
  code: number;
  message: string;
  questions: Question[];
  total: number;
}

export interface NoBodyResponse {
  code: number;
  message: string;
}
