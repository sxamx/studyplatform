import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Check, Sparkles, MessageSquare, BookOpen, Users, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { NotificationPreferences } from '../../types';
import { Button } from './Button';
import { useAuthStore } from '../../stores/authStore';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    notifyCreatorApps: true,
    notifyCourseReviews: true,
    notifyDirectMessages: true,
    notifyStudentEnrolled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch<{ preferences: NotificationPreferences }>('/notifications/preferences');
      if (res.preferences) {
        setPrefs(res.preferences);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar preferencias de notificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await apiFetch('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefs),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Error al guardar preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen min-w-full flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-sm animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0066CC] text-white flex items-center justify-center shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                Ajustes de Notificaciones
              </h2>
              <p className="text-[11px] text-[#666666] dark:text-[#808080]">
                Personaliza qué alertas internas deseas recibir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#242424] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">Cargando preferencias...</div>
          ) : (
            <div className="space-y-3">
              {/* Option 1: Direct Messages */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50/70 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#202020] transition">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#1A1A1A] dark:text-white block">
                      Mensajes Directos del Chat
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Alertas cuando el Admin o Creador te responda en el chat
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.notifyDirectMessages}
                  onChange={(e) => setPrefs({ ...prefs, notifyDirectMessages: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-[#0066CC] focus:ring-[#0066CC]"
                />
              </label>

              {/* Option 2: Course Reviews (Whitelist) */}
              <label className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50/70 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#202020] transition">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#1A1A1A] dark:text-white block">
                      Revisiones de Cursos (Whitelist)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {user?.role === 'ADMIN'
                        ? 'Nuevos cursos o actualizaciones enviadas a revisión'
                        : 'Cuando tu curso sea aprobado o reciba observaciones'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.notifyCourseReviews}
                  onChange={(e) => setPrefs({ ...prefs, notifyCourseReviews: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-[#0066CC] focus:ring-[#0066CC]"
                />
              </label>

              {/* Option 3: Creator Applications (For Admin) */}
              {user?.role === 'ADMIN' && (
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50/70 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#202020] transition">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1A1A1A] dark:text-white block">
                        Solicitudes de Nuevos Creadores
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Alertas cuando usuarios postulen para ser instructores
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.notifyCreatorApps}
                    onChange={(e) => setPrefs({ ...prefs, notifyCreatorApps: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-[#0066CC] focus:ring-[#0066CC]"
                  />
                </label>
              )}

              {/* Option 4: Student Enrollments */}
              {user?.role === 'CREATOR' && (
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50/70 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] cursor-pointer hover:bg-gray-100/50 dark:hover:bg-[#202020] transition">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1A1A1A] dark:text-white block">
                        Inscripciones a tus Cursos
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Alertas cuando un nuevo estudiante se inscriba en tus cursos
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.notifyStudentEnrolled}
                    onChange={(e) => setPrefs({ ...prefs, notifyStudentEnrolled: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-[#0066CC] focus:ring-[#0066CC]"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/40 dark:bg-[#181818] flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            leftIcon={savedSuccess ? <Check className="w-3.5 h-3.5" /> : undefined}
            className={savedSuccess ? 'bg-emerald-600' : ''}
          >
            {savedSuccess ? '¡Guardado!' : isSaving ? 'Guardando...' : 'Guardar Ajustes'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
