
export type Screen =
  | 'SPLASH'
  | 'WELCOME'
  | 'LOGIN'
  | 'SIGNUP'
  | 'FORGOT_PASSWORD'
  | 'RESET_PASSWORD'
  | 'OTP'
  | 'HOME'
  | 'LEARN'
  | 'PRACTICE'
  | 'EXPLORE'
  | 'CHAT'
  | 'COMPILER'
  | 'QUIZ'
  | 'QUIZ_RESULT'
  | 'CHALLENGES'
  | 'LEADERBOARD'
  | 'PROFILE'
  | 'SETTINGS'
  | 'PROGRESS'
  | 'ANALYTICS'
  | 'LESSONS'
  | 'LESSON_VIEW'
  | 'SUBSCRIPTION'
  | 'BILLING'
  | 'MOCK_INTERVIEW'
  | 'CONTACT';

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  provider?: 'google' | 'github' | 'email';
  lessonsCompleted: number;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
  createdAt: Date;
  onboardingCompleted: boolean;
  avatar?: string;
  streak?: number;
  xp?: number;
  lastActiveAt?: string;
  activity_log?: string[];
  activity_history?: ActivityItem[];
  isPro?: boolean;
  role?: string;
  skills?: string[];
  username?: string;
  joinedDate?: string;
  lastLoginBonusAt?: string;
}

export interface ActivityItem {
  id: string;
  type: 'lesson' | 'practice' | 'project' | 'challenge' | 'login_bonus';
  title: string;
  date: string;
  xp?: number;
  executionTime?: string;
  language?: string;
  itemId?: string;
  score?: number;
}

// Ensure the module is treated as a valid ESM even if only types are exported
export const APP_TYPES_VERSION = '1.0.0';

export type DummyExport = never;
