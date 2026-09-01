import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, ShoppingBag, ShieldCheck, LogIn } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { DiscordIcon } from './SocialIcons';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0F0F0F]/95 backdrop-blur-lg border-t border-[#E0E0E0] dark:border-[#2D2D2D] px-2 py-1.5 shadow-lg transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Mis Cursos */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
            isActive('/')
              ? 'text-[#0066CC] dark:text-[#4D94FF] scale-105'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/') ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="mt-0.5">Cursos</span>
        </Link>

        {/* Marketplace */}
        <Link
          to="/marketplace"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
            isActive('/marketplace')
              ? 'text-[#0066CC] dark:text-[#4D94FF] scale-105'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/marketplace') ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="mt-0.5">Catálogo</span>
        </Link>

        {/* Admin Panel (If Admin) */}
        {user?.role === 'ADMIN' && (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
              isActive('/admin')
                ? 'text-[#0066CC] dark:text-[#4D94FF] scale-105'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive('/admin') ? 'bg-blue-50 dark:bg-blue-950/50' : ''}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="mt-0.5">Admin</span>
          </Link>
        )}

        {/* Discord Link */}
        <a
          href="https://discord.gg/Q6msQeMWaE"
          target="_blank"
          rel="noopener noreferrer"
          title="Comunidad Discord"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-bold text-[#5865F2] hover:opacity-80 transition-all"
        >
          <div className="p-1 rounded-lg bg-[#5865F2]/10">
            <DiscordIcon className="w-5 h-5" />
          </div>
          <span className="mt-0.5">Discord</span>
        </a>

        {/* Auth / Account Profile */}
        {user ? (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
              isActive('/admin')
                ? 'text-[#0066CC] dark:text-[#4D94FF]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#0066CC] text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
              {(user.fullName || user.email || 'U')[0]}
            </div>
            <span className="mt-0.5 truncate max-w-[60px]">
              {user.fullName ? user.fullName.split(' ')[0] : 'Cuenta'}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
              isActive('/login')
                ? 'text-[#0066CC] dark:text-[#4D94FF]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              <LogIn className="w-5 h-5" />
            </div>
            <span className="mt-0.5">Entrar</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
