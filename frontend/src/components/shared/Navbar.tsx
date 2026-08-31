import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ShieldCheck, LogOut, BookOpen, User, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#2D2D2D] transition-colors">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#0066CC] dark:bg-[#4D94FF] text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#1A1A1A] dark:text-white leading-none">
              StudyPlatform
            </span>
            <span className="text-[10px] text-[#666666] dark:text-[#999999] font-medium tracking-wide uppercase mt-0.5">
              Aprende
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive('/')
                ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0066CC] dark:text-[#4D94FF]'
                : 'text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mis Cursos</span>
          </Link>

          <Link
            to="/marketplace"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive('/marketplace')
                ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0066CC] dark:text-[#4D94FF]'
                : 'text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Marketplace</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/wizard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/admin/wizard')
                    ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0066CC] dark:text-[#4D94FF]'
                    : 'text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Asistente de Curso</span>
              </Link>
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0066CC] dark:text-[#4D94FF]'
                    : 'text-[#666666] hover:text-[#1A1A1A] dark:text-[#B0B0B0] dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#E0E0E0] dark:border-[#2D2D2D]">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-[#1A1A1A] dark:text-white leading-tight">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-[#0066CC] dark:text-[#4D94FF] font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-[#242424] border border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-center text-sm font-bold text-[#1A1A1A] dark:text-white">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-2 text-[#666666] hover:text-[#DC3545] dark:text-[#B0B0B0] dark:hover:text-[#FF6B6B] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
