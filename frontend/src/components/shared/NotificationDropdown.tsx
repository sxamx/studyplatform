import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Settings,
  Sparkles,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { apiFetch } from '../../api/client';
import { AppNotification } from '../../types';
import { NotificationSettingsModal } from './NotificationSettingsModal';

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (_) {
      // Graceful silence for polling / network hiccup
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds for background notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PATCH' });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (_) {}
    }

    if (notif.linkUrl) {
      setIsOpen(false);
      navigate(notif.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'creator_app':
        return <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'course_review':
        return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'course_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'course_rejected':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'direct_message':
        return <MessageSquare className="w-4 h-4 text-[#0066CC] dark:text-[#4D94FF]" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);

    if (diffMin < 2) return 'Ahora';
    if (diffMin < 60) return `${diffMin} min`;
    if (diffHours < 24) return `${diffHours} h`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campanita Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        title="Notificaciones"
        className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#161616] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn text-xs">
          {/* Header */}
          <div className="p-3.5 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gray-50/70 dark:bg-[#1E1E1E]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#0066CC] text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Marcar todas como leídas"
                  className="p-1 rounded-lg text-gray-500 hover:text-[#0066CC] dark:hover:text-[#4D94FF] hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                title="Ajustes de Notificación"
                className="p-1 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E0E0E0] dark:divide-[#242424]">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400">Cargando alertas...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <span>No tienes notificaciones</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n)}
                  className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                    n.isRead
                      ? 'bg-white dark:bg-[#161616] hover:bg-gray-50 dark:hover:bg-[#202020]'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-gray-100 dark:bg-[#282828] shrink-0 mt-0.5">
                    {getIconForType(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-[#1A1A1A] dark:text-white truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                      {n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
