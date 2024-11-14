export const HeaderConstants = {
  LOGO_TEXT: 'Codesage',
  QUESTIONS: 'Questions',
  ADD_QUESTIONS: 'Add Questions',
  DELETE_QUESTION: 'Delete Question',
  PROGRESS: 'Progress',
  PLATFORM: 'Platform',
  USERS: 'Users',
  PROFILE: 'Profile',
  LOGOUT: 'Logout'
} as const;

export const LandingPageConstants = {
  TITLE: 'Codesage',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  INTRO_HEADING: 'Gearing up for technical interviews?',
  INTRO_BODY: 'Dive into our extensive collection of more than 1500+ free company-specific DSA questions with detailed progress analytics, tailored to prepare you for your desired roles.'
} as const;

export const LoginConstants = {
  LOGO_TEXT: 'Codesage',
  FORM_HEADING: 'Login to your account',
  USERNAME_LABEL: 'Username*',
  USERNAME_ERROR: 'Please enter your username',
  PASSWORD_LABEL: 'Password*',
  PASSWORD_ERROR: 'Please enter your password',
  LOGIN_BUTTON: 'Login',
  SIGNUP_PROMPT: "Don't have an account yet?",
  SIGNUP_TEXT: 'Signup',
  FORGOT_PASSWORD: 'Forgot password?',
} as const;


export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8080',
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login'
  },
  USERS: {
    PROFILE: (username: string) => `/users/profile/${username}`,
    UPDATE_PROFILE: '/users/update-profile',
    PROGRESS: (username: string) => `/users/progress/${username}`
  },
  QUESTIONS: {
    LIST: '/questions',
    DELETE: (id: string) => `/question?id=${id}`
  }
} as const;

// src/app/core/constants/validation.constants.ts
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    REQUIRED_MESSAGE: 'Username is required',
    MIN_LENGTH_MESSAGE: 'Username must be at least 3 characters'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRED_MESSAGE: 'Password is required',
    MIN_LENGTH_MESSAGE: 'Password must be at least 6 characters'
  },
  GENERAL: {
    REQUIRED_MESSAGE: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address'
  }
} as const;

// src/app/core/constants/message.constants.ts
export const MESSAGES = {
  SUCCESS: {
    SIGNUP: 'Your account has been created!',
    PROFILE_UPDATE: 'Profile updated successfully',
    QUESTION_DELETE: 'Question deleted successfully'
  },
  ERROR: {
    SIGNUP_FAILED: 'Signup failed. Please try again.',
    PROFILE_UPDATE_FAILED: 'Failed to update profile',
    PROGRESS_FETCH_FAILED: 'Failed to fetch progress',
    QUESTION_DELETE_FAILED: 'Failed to delete question'
  }
} as const;

export const AddQuestionConstants = {
  ADD_QUESTION_TITLE: 'Add Questions',
};

export const API_BASE_URL = 'http://localhost:8080';

export const AUTH_PATHS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  ROLE: `${API_BASE_URL}/auth/member/role`,
  LOGOUT: `${API_BASE_URL}/auth/member/logout`
};

export const PLATFORM_PATHS = {
  PLATFORM_STATS: `${API_BASE_URL}/platform-stats`,
};
