import { Question } from "./types/question.types";

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
    LIST: `/users`,
    PROFILE: (username: string): string => `${API_BASE_URL}/users/profile/${username}`,
    UPDATE_PROFILE: `/users/update-profile`,
    PROGRESS: (username: string): string => `${API_BASE_URL}/users/progress/${username}`,
    BAN: (username: string): string => `${API_BASE_URL}/users/update-user-ban-state?username=${username}`,
    DELETE: (username: string): string => `${API_BASE_URL}/users/delete?username=${username}`,
    PROGRESS_LIST: (): string => `${API_BASE_URL}/users/progress-list`
  },
  QUESTIONS: {
    LIST: '/questions',
    DELETE: (id: string): string => `${API_BASE_URL}/question?id=${id}`,
    UPLOAD: '/questions',
  }
} as const;

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
  },
  FILE: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    TYPE_CSV: 'Only CSV files are allowed.'
  }
} as const;

export const MESSAGES = {
  UPLOAD_STATUS: {
    PENDING: 'Pending',
    READY: 'Ready to upload',
    UPLOADING: 'Uploading...',
    COMPLETED: 'Upload completed',
    FAILED: 'Upload failed'
  },
  SUCCESS: {
    SIGNUP: 'Your account has been created!',
    PROFILE_UPDATE: 'Profile updated successfully',
    QUESTION_DELETE: 'Question deleted successfully',
    NO_CHANGES: 'No changes were made to the profile',
    GENERAL_SUCCESS_SUMMARY: 'Success',
    UPLOAD_SUCCESS_SUMMARY: 'Upload Success',
    UPLOAD_SUCCESS_DETAIL: 'Your file was successfully uploaded.',
    USER_DELETE: 'User deleted successfully'
  },
  ERROR: {
    SIGNUP_FAILED: 'Signup failed. Please try again.',
    PROFILE_UPDATE_FAILED: 'Failed to update profile',
    PROGRESS_FETCH_FAILED: 'Failed to fetch progress',
    QUESTION_DELETE_FAILED: 'Failed to delete question',
    QUESTION_STATUS_FAILED: 'Failed to load question status',
    LOADING_PROFILE: 'Failed to load profile',
    VALIDATION_ERROR: 'Please check all required fields',
    PLATFORM_FETCH_FAILED: 'Failed to fetch platform statistics',
    FILE_TYPE: VALIDATION_RULES.FILE.TYPE_CSV,
    FILE_SIZE: `File size exceeds the maximum allowed limit of ${VALIDATION_RULES.FILE.MAX_SIZE_BYTES / (1024 * 1024)} MB.`,
    MISSING_COLUMNS: 'The following required columns are missing',
    EXTRA_COLUMNS: 'The following extra columns are present',
    NO_DATA_ROWS: 'The CSV file has no data rows.',
    CSV_VALIDATION_ERROR_SUMMARY: 'CSV Validation Error',
    CSV_VALIDATION_ERROR_DETAIL: 'Please check the file and try again.',
    FILE_READ_ERROR: 'Error reading the file.',
    GENERAL_ERROR_SUMMARY: 'Error',
    FIX_VALIDATION_ERRORS: 'Please fix the validation errors and try again.',
    UPLOAD_FAILED: 'File upload failed.',
    USER_DELETE_FAILED: 'Failed to delete user',
    USER_UPDATE_FAILED: 'Failed to update user',
    LOADING_AVATAR: 'Failed to load avatar',
    INVALID_EMAIL_FORMAT: "Enter a valid email",
    OTP_GENERATION_FAILED: "An error occurred. Please try again later.",
    RESET_PASSWORD_FAILED: "Password reset failed. Please try again later.",
  },
  INFO: {
    NO_CHANGES: 'No changes were made to the profile',
    STATUS_UPDATED: 'Status Updated'
  },
  CONFIRM: {
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to cancel?',
    DELETE_USER: (username: string): string => `Are you sure you want to delete user "${username}"?`,
    DELETE_HEADER: 'Delete Confirmation',
    DELETE_QUESTION: (question: Question): string => `Are you sure you want to delete the question "${question.question_title}"?`
  }
} as const;

export const UI_CONSTANTS = {
  BUTTON_STYLES: {
    DANGER_TEXT: 'p-button-danger p-button-text',
    TEXT: 'p-button-text p-button-text'
  },
  ICONS: {
    NONE: 'none',
    INFO_CIRCLE: 'pi pi-info-circle'
  }
} as const;

export const FILTER_OPTIONS = {
  USER_STATES: [
    { name: 'Banned' },
    { name: 'Active' },
  ]
};


export const FILE_LIMITS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024
};

export const AddQuestionConstants = {
  ADD_QUESTION_TITLE: 'Add Questions',
};

export const API_BASE_URL = 'http://localhost:8080';

export const AUTH_PATHS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  ROLE: `${API_BASE_URL}/auth/member/role`,
  LOGOUT: `${API_BASE_URL}/auth/member/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
};

export const PLATFORM_PATHS = {
  PLATFORM_STATS: `${API_BASE_URL}/platform-stats`,
};

export const USER_PROFILE_ENDPOINT = `${API_BASE_URL}/users/profile/`;
export const UPDATE_PROFILE_ENDPOINT = `${API_BASE_URL}/users/update-profile`;


export const VALIDATION_ERRORS = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, length: number) => `${field} must be at least ${length} characters`,
  invalidEmail: 'Please enter a valid email address'
};

export const DEFAULTS = {
  USER: {
    AVATAR: 'https://assets.leetcode.com/users/default_avatar.jpg'
  }
}
