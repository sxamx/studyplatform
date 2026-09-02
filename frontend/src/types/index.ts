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
  | 'table'
  | 'diagram'
  | 'math'
  | 'tabs'
  | 'accordion'
  | 'stepper'
  | 'divider'
  | 'resource'
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
  multiple?: boolean;
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
  level?: 'info' | 'warning' | 'success' | 'error' | 'tip' | 'note' | 'danger';
  title?: string;
  message: string;
}

// 10. Table Block (Freeform N-columns / N-rows)
export interface TableBlock {
  type: 'table';
  id: string;
  title?: string;
  headers: string[];
  rows: string[][];
}

// 11. Diagram Block (Mermaid.js vector diagrams)
export interface DiagramBlock {
  type: 'diagram';
  id: string;
  title?: string;
  syntax: string;
  caption?: string;
}

// 12. Math Formula Block (LaTeX / KaTeX)
export interface MathBlock {
  type: 'math';
  id: string;
  expression: string;
  title?: string;
  inline?: boolean;
  explanation?: string;
}

// 13. Tabs Block (Notion / VS Code multi-tab container)
export interface TabItem {
  id: string;
  label: string;
  content: string;
  language?: string;
}

export interface TabsBlock {
  type: 'tabs';
  id: string;
  title?: string;
  tabs: TabItem[];
}

// 14. Accordion Block (Collapsible hint / deep explanation)
export interface AccordionBlock {
  type: 'accordion';
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}

// 15. Stepper Block (Step-by-step numbered guide)
export interface StepItem {
  title: string;
  description: string;
  code?: string;
  language?: string;
}

export interface StepperBlock {
  type: 'stepper';
  id: string;
  title?: string;
  steps: StepItem[];
}

// 16. Divider Block (Visual section separator)
export interface DividerBlock {
  type: 'divider';
  id: string;
  label?: string;
}

// 17. Resource Block (Downloadable files / attachments)
export interface ResourceBlock {
  type: 'resource';
  id: string;
  title: string;
  description?: string;
  url: string;
  fileType?: string;
  fileSize?: string;
}

// 18. Database Modeler Block (ER Diagram)
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
  | TableBlock
  | DiagramBlock
  | MathBlock
  | TabsBlock
  | AccordionBlock
  | StepperBlock
  | DividerBlock
  | ResourceBlock
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
  role: 'ADMIN' | 'CREATOR' | 'USER';
  themePreference: 'light' | 'dark' | 'system';
  canUseAi?: boolean;
  aiDailyLimit?: number;
}

export interface CourseAIMessage {
  id: string;
  courseId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIQuota {
  canUseAi: boolean;
  dailyLimit: number;
  usedToday: number;
  remaining: number;
}

export interface CreatorApplication {
  id: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  bio: string;
  portfolioUrl?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  messages?: ApplicationMessage[];
}

export interface ApplicationMessage {
  id: string;
  applicationId: string;
  senderId: string;
  senderName?: string;
  senderRole?: 'ADMIN' | 'CREATOR' | 'USER';
  message: string;
  createdAt: string;
}

export interface CreatorStats {
  totalCourses: number;
  totalLessons: number;
  totalStudents: number;
  averageCompletionRate: number;
  totalCompletions: number;
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
  isLocked?: boolean;
  score: number;
}

export type ApprovalStatus = 'draft' | 'pending_review' | 'pending_update' | 'approved' | 'rejected';

export interface CourseReview {
  id: string;
  courseId: string;
  courseTitle?: string;
  creatorId: string;
  creatorName?: string;
  creatorEmail?: string;
  reviewType: 'new_course' | 'course_update';
  status: 'pending' | 'approved' | 'rejected';
  proposedData: CourseSnapshot;
  currentData?: CourseSnapshot | null;
  adminFeedback?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseSnapshot {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    sequentialUnlock?: boolean;
  };
  modules: Array<{
    id: string;
    title: string;
    description?: string;
    order: number;
  }>;
  lessons: Array<{
    id: string;
    moduleId?: string | null;
    title: string;
    description?: string;
    order: number;
    estimatedMinutes?: number;
    blocksCount?: number;
    blocks?: any[];
  }>;
}

export interface Course {
  id: string;
  trackId?: string | null;
  title: string;
  description: string;
  slug?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  approvalStatus?: ApprovalStatus;
  createdBy?: string;
  creatorName?: string;
  sequentialUnlock?: boolean;
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
  isEnrolled?: boolean;
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

export interface AppNotification {
  id: string;
  userId: string;
  type: 'creator_app' | 'course_review' | 'direct_message' | 'course_approved' | 'course_rejected' | 'system';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  notifyCreatorApps: boolean;
  notifyCourseReviews: boolean;
  notifyDirectMessages: boolean;
  notifyStudentEnrolled: boolean;
}
