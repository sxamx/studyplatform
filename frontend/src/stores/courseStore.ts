import { create } from 'zustand';
import { Course, CourseDetail, LessonDetail } from '../types';
import { apiFetch } from '../api/client';

interface CourseState {
  courses: Course[];
  activeCourse: CourseDetail | null;
  activeLesson: LessonDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  fetchLessonById: (id: string) => Promise<void>;
  submitProgress: (lessonId: string, answers: Record<string, any>, score?: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  activeCourse: null,
  activeLesson: null,
  isLoading: false,
  error: null,
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<{ courses: Course[] }>('/courses');
      set({
        courses: Array.isArray(data?.courses) ? data.courses : [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        courses: [],
        isLoading: false,
        error: err.message || 'No se pudieron cargar los cursos del servidor.',
      });
    }
  },
  fetchCourseById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<CourseDetail>(`/courses/${id}`);
      set({ activeCourse: data || null, isLoading: false, error: null });
    } catch (err: any) {
      set({
        activeCourse: null,
        isLoading: false,
        error: err.message || 'No se pudo cargar el curso.',
      });
    }
  },
  fetchLessonById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<LessonDetail>(`/lessons/${id}`);
      set({ activeLesson: data || null, isLoading: false, error: null });
    } catch (err: any) {
      set({
        activeLesson: null,
        isLoading: false,
        error: err.message || 'No se pudo cargar la lección.',
      });
    }
  },
  submitProgress: async (lessonId: string, answers: Record<string, any>, score = 100) => {
    try {
      await apiFetch('/progress', {
        method: 'POST',
        body: JSON.stringify({ lessonId, answers, score }),
      });
    } catch (err: any) {
      console.error('Error saving progress:', err);
    }

    const activeLesson = get().activeLesson;
    if (activeLesson && activeLesson.id === lessonId) {
      set({
        activeLesson: {
          ...activeLesson,
          progress: {
            completed: true,
            completedAt: new Date().toISOString(),
            score,
            answers,
          },
        },
      });
    }
  },
}));
