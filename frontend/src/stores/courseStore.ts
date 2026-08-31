import { create } from 'zustand';
import { Course, CourseDetail, LessonDetail } from '../types';
import { apiFetch } from '../api/client';

interface CourseState {
  courses: Course[];
  activeCourse: CourseDetail | null;
  activeLesson: LessonDetail | null;
  isLoading: boolean;
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
  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const data = await apiFetch<{ courses: Course[] }>('/courses');
      set({ courses: data.courses, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },
  fetchCourseById: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch<CourseDetail>(`/courses/${id}`);
      set({ activeCourse: data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },
  fetchLessonById: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch<LessonDetail>(`/lessons/${id}`);
      set({ activeLesson: data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },
  submitProgress: async (lessonId: string, answers: Record<string, any>, score = 100) => {
    await apiFetch('/progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId, answers, score }),
    });

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
