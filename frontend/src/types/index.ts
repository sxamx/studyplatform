export type BlockType =
  | 'text'
  | 'heading'
  | 'code'
  | 'image'
  | 'video'
  | 'document'
  | 'question_choice'
  | 'question_free'
  | 'quiz'
  | 'info'
  | 'database_modeler';

export interface TextBlock {
  type: 'text';
  id: string;
  content: string;
}

export interface HeadingBlock {
  type: 'heading';
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface CodeBlock {
  type: 'code';
  id: string;
  language: string;
  code: string;
  copyable?: boolean;
}

export interface ImageBlock {
  type: 'image';
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface VideoBlock {
  type: 'video';
  id: string;
  url: string;
  title: string;
  duration?: string;
  thumbnail?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionChoiceBlock {
  type: 'question_choice';
  id: string;
  question: string;
  options: ChoiceOption[];
  explanation: string;
  required?: boolean;
}

export interface QuestionFreeBlock {
  type: 'question_free';
  id: string;
  question: string;
  expectedAnswer: string;
  maxLength?: number;
  language?: string;
  hint?: string;
  required?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'choice';
  question: string;
  options: ChoiceOption[];
  explanation?: string;
}

export interface QuizBlock {
  type: 'quiz';
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore?: number;
  required?: boolean;
}

export interface InfoBlock {
  type: 'info';
  id: string;
  level?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message: string;
}

// 10. Database Modeler Block (ER Diagram)
export interface EntityAttribute {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isNullable?: boolean;
}

export interface EntityDefinition {
  id: string;
  name: string;
  notes?: string;
  position?: { x: number; y: number };
  attributes: EntityAttribute[];
}

export interface RelationshipDefinition {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  cardinality: '1:1' | '1:N' | 'N:M';
  label?: string;
}

export interface DatabaseModelerBlock {
  type: 'database_modeler';
  id: string;
  title: string;
  instructions: string;
  scenario?: string;
  initialEntities?: EntityDefinition[];
  expectedModel?: {
    entities?: {
      name: string;
      attributes?: { name: string; isPk?: boolean; isFk?: boolean }[];
    }[];
    relationships?: {
      source: string;
      target: string;
      cardinality: '1:1' | '1:N' | 'N:M';
    }[];
  };
  hint?: string;
  required?: boolean;
}

export interface DocumentBlock {
  type: 'document';
  id: string;
  title: string;
  url: string;
  description?: string;
  fileSize?: string;
  fileType?: 'pdf' | 'doc' | 'sheet' | 'slide' | 'archive' | 'link';
  downloadable?: boolean;
}

export type Block =
  | TextBlock
  | HeadingBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | DocumentBlock
  | QuestionChoiceBlock
  | QuestionFreeBlock
  | QuizBlock
  | InfoBlock
  | DatabaseModelerBlock;

export interface LessonData {
  id: string;
  title: string;
  description?: string;
  order: number;
  estimatedMinutes?: number;
  blocks: Block[];
}

export interface LessonJSON {
  version: string;
  lesson: LessonData;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'ADMIN' | 'USER';
  themePreference: 'light' | 'dark' | 'system';
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  estimatedHours?: number;
  lessons?: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  moduleId?: string | null;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
  score: number;
}

export interface Course {
  id: string;
  trackId?: string | null;
  title: string;
  description: string;
  slug?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  totalLessons: number;
  totalModules?: number;
  completedLessons: number;
  progressPercent: number;
  preferenceStatus?: 'in_progress' | 'completed' | 'archived' | 'wishlisted';
  preferenceNotes?: string;
  createdAt?: string;
}

export interface CourseDetail extends Course {
  modules?: Module[];
  lessons: LessonSummary[];
}

export interface LessonDetail {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  content: LessonJSON;
  progress: {
    completed: boolean;
    completedAt?: string;
    score: number;
    answers?: Record<string, any>;
  } | null;
  nav: {
    prev: { id: string; title: string } | null;
    next: { id: string; title: string } | null;
  };
}

export interface MarketplaceCourse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  currency: string;
  purchaseCount: number;
  averageRating: number;
  totalLessons: number;
  creatorName: string;
  publishedAt: string;
  isPurchased?: boolean;
  reviews?: MarketplaceReview[];
}

export interface MarketplaceReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  activeUsersThisWeek: number;
  averageCompletionRate: number;
  completedLessonsTotal: number;
}
