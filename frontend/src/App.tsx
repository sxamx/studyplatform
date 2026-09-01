import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Navbar } from './components/shared/Navbar';
import { Footer } from './components/shared/Footer';
import { MobileBottomNav } from './components/shared/MobileBottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPage } from './pages/LessonPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UploadJSONPage } from './pages/UploadJSONPage';
import { CourseWizardPage } from './pages/CourseWizardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MarketplaceDetailPage } from './pages/MarketplaceDetailPage';
import { CourseCurriculumPage } from './pages/CourseCurriculumPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F0F] text-[#1A1A1A] dark:text-white transition-colors duration-200 overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<MarketplaceDetailPage />} />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/wizard"
              element={
                <AdminRoute>
                  <CourseWizardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/upload-json"
              element={
                <AdminRoute>
                  <UploadJSONPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses/:id/curriculum"
              element={
                <AdminRoute>
                  <CourseCurriculumPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default App;
