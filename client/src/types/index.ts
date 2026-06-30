/* ==========================================
   TypeScript Interfaces for MindShare
   ========================================== */

// ---- User ----
export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ---- Study Groups ----
export interface StudyGroup {
  id: string;
  title: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  createdBy?: User;
  _count?: {
    members: number;
    materials: number;
  };
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  user?: User;
}

// ---- Study Materials ----
export interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  groupId: string | null;
  aiSummary: string | null;
  aiTags: string[];
  createdAt: string;
  uploadedBy?: User;
  group?: StudyGroup;
}

// ---- Forum ----
export interface ForumQuestion {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  author?: User;
  _count?: {
    answers: number;
  };
  answers?: ForumAnswer[];
}

export interface ForumAnswer {
  id: string;
  content: string;
  userId: string;
  questionId: string;
  isAiGenerated: boolean;
  createdAt: string;
  author?: User;
  _count?: {
    votes: number;
  };
  voteScore?: number;
  userVote?: number | null;
}

export interface Vote {
  id: string;
  value: number; // 1 or -1
  userId: string;
  answerId: string;
}

// ---- API Responses ----
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ---- Search ----
export interface SearchResult {
  type: 'group' | 'material' | 'question';
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface GlobalSearchResponse {
  success: boolean;
  data: {
    groups: StudyGroup[];
    materials: StudyMaterial[];
    questions: ForumQuestion[];
  };
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  groupsCount: number;
  materialsCount: number;
  questionsCount: number;
}
