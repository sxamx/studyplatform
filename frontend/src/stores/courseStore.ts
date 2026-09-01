import { create } from 'zustand';
import { Course, CourseDetail, LessonDetail } from '../types';
import { apiFetch } from '../api/client';

interface CourseState {
  courses: Course[];
  activeCourse: CourseDetail | null;
  activeLesson: LessonDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: (all?: boolean) => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  fetchLessonById: (id: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  submitProgress: (lessonId: string, answers: Record<string, any>, score?: number, completed?: boolean) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  activeCourse: null,
  activeLesson: null,
  isLoading: false,
  error: null,
  fetchCourses: async (all = false) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = all ? '/courses?all=true' : '/courses';
      const data = await apiFetch<{ courses: Course[] }>(endpoint);
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
  enrollCourse: async (courseId: string) => {
    try {
      await apiFetch(`/courses/${courseId}/enroll`, { method: 'POST' });
      await get().fetchCourses();
    } catch (err: any) {
      console.error('Error enrolling course:', err);
      throw err;
    }
  },
  submitProgress: async (lessonId: string, answers: Record<string, any>, score = 100, completed = true) => {
    try {
      await apiFetch('/progress', {
        method: 'POST',
        body: JSON.stringify({ lessonId, answers, score, completed }),
      });
    } catch (err: any) {
      console.error('Error saving progress to backend:', err);
    }

    const state = get();
    const activeLesson = state.activeLesson;
    if (activeLesson && activeLesson.id === lessonId) {
      set({
        activeLesson: {
          ...activeLesson,
          progress: {
            completed: completed ? true : Boolean(activeLesson.progress?.completed),
            completedAt: completed ? new Date().toISOString() : activeLesson.progress?.completedAt,
            score,
            answers,
          },
        },
      });
    }

    // Proactively update activeCourse state if loaded
    const activeCourse = state.activeCourse;
    if (activeCourse && completed) {
      const updatedLessons = (activeCourse.lessons || []).map((l) =>
        l.id === lessonId ? { ...l, isCompleted: true, score } : l
      );
      const updatedModules = (activeCourse.modules || []).map((m) => ({
        ...m,
        lessons: (m.lessons || []).map((l) =>
          l.id === lessonId ? { ...l, isCompleted: true, score } : l
        ),
      }));
      const completedCount = updatedLessons.filter((l) => l.isCompleted).length;
      const totalCount = updatedLessons.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      set({
        activeCourse: {
          ...activeCourse,
          lessons: updatedLessons,
          modules: updatedModules,
          completedLessons: completedCount,
          progressPercent,
        },
      });
    }
  },
}));
