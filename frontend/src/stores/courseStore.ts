import { create } from 'zustand';
import { Course, CourseDetail, LessonDetail } from '../types';
import { apiFetch } from '../api/client';
import { fallbackCourses, fallbackCourseDetails, fallbackLessonDetails } from '../data/fallbackCourses';

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
  courses: fallbackCourses,
  activeCourse: null,
  activeLesson: null,
  isLoading: false,
  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const data = await apiFetch<{ courses: Course[] }>('/courses');
      if (data && Array.isArray(data.courses) && data.courses.length > 0) {
        set({ courses: data.courses, isLoading: false });
      } else {
        set({ courses: fallbackCourses, isLoading: false });
      }
    } catch (err) {
      // Fallback seamlessly to embedded courses if API is offline
      set({ courses: fallbackCourses, isLoading: false });
    }
  },
  fetchCourseById: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch<CourseDetail>(`/courses/${id}`);
      if (data && data.id) {
        set({ activeCourse: data, isLoading: false });
      } else {
        set({ activeCourse: fallbackCourseDetails[id] || null, isLoading: false });
      }
    } catch (err) {
      set({ activeCourse: fallbackCourseDetails[id] || null, isLoading: false });
    }
  },
  fetchLessonById: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch<LessonDetail>(`/lessons/${id}`);
      if (data && data.id) {
        set({ activeLesson: data, isLoading: false });
      } else {
        set({ activeLesson: fallbackLessonDetails[id] || null, isLoading: false });
      }
    } catch (err) {
      set({ activeLesson: fallbackLessonDetails[id] || null, isLoading: false });
    }
  },
  submitProgress: async (lessonId: string, answers: Record<string, any>, score = 100) => {
    try {
      await apiFetch('/progress', {
        method: 'POST',
        body: JSON.stringify({ lessonId, answers, score }),
      });
    } catch {
      // Offline fallback: save progress locally in store
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
