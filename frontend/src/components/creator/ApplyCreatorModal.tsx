import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  Link as LinkIcon,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../../api/client';
import { CreatorApplication, ApplicationMessage } from '../../types';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { useAuthStore } from '../../stores/authStore';

interface ApplyCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

export const ApplyCreatorModal: React.FC<ApplyCreatorModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { user } = useAuthStore();
  const [application, setApplication] = useState<CreatorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [motivation, setMotivation] = useState('');

  const loadApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch<{ application: CreatorApplication | null }>('/creator/application');
      if (data.application) {
        setApplication(data.application);
        setBio(data.application.bio || '');
        setPortfolioUrl(data.application.portfolioUrl || '');
        setMotivation(data.application.motivation || '');
      } else {
        setApplication(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tu postulación.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadApplication();
    }
  }, [isOpen]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio.trim() || !motivation.trim()) {
      setError('La biografía y motivación son obligatorias.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await apiFetch('/creator/apply', {
        method: 'POST',
        body: JSON.stringify({
          bio: bio.trim(),
          portfolioUrl: portfolioUrl.trim(),
          motivation: motivation.trim(),
        }),
      });
      await loadApplication();
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      setError(err.message || 'Error al enviar la postulación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !application) return;

    try {
      setIsSendingMessage(true);
      const res = await apiFetch<{ message: ApplicationMessage }>('/creator/application/messages', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: application.id,
          message: newMessage.trim(),
        }),
      });

      setApplication((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), res.message],
        };
      });
      setNewMessage('');
    } catch (err: any) {
      alert(err.message || 'Error al enviar mensaje');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen min-w-full flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-transparent dark:from-blue-950/20 dark:via-purple-950/10 dark:to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#7B2CBF] text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                Postulación a Creador de Cursos
              </h2>
              <p className="text-xs text-[#666666] dark:text-[#808080]">
                Comparte tus conocimientos y publica tus propios cursos en el Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#242424] transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Cargando estado de tu postulación...</p>
            </div>
          ) : application ? (
            /* Existing Application Review & Chat */
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="p-5 rounded-2xl border bg-gray-50/70 dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {application.status === 'approved' ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : application.status === 'rejected' ? (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <XCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Estado de la Solicitud
                    </span>
                    <div className="text-base font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2 mt-0.5">
                      {application.status === 'approved' && '¡Felicidades! Postulación Aprobada'}
                      {application.status === 'rejected' && 'Postulación Rechazada'}
                      {application.status === 'pending' && 'En Revisión por el Administrador'}
                      <Badge
                        variant={
                          application.status === 'approved'
                            ? 'success'
                            : application.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {application.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {application.status === 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      window.location.href = '/creator';
                    }}
                  >
                    Ir al Panel de Creador
                  </Button>
                )}
              </div>

              {/* Direct Chat with Admin */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4 text-[#0066CC]" />
                  <span>Chat Directo con el Administrador</span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl min-h-[160px] max-h-[220px] overflow-y-auto space-y-3">
                  {application.messages && application.messages.length > 0 ? (
                    application.messages.map((m) => {
                      const isMe = m.senderId === user?.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1">
                            <span className="font-semibold">
                              {isMe ? 'Tú' : m.senderName || 'Administrador'}
                            </span>
                            <span>•</span>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs ${
                              isMe
                                ? 'bg-[#0066CC] text-white rounded-tr-none'
                                : 'bg-white dark:bg-[#242424] text-[#1A1A1A] dark:text-white border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-tl-none shadow-sm'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No hay mensajes todavía. Escribe un mensaje si necesitas añadir detalles.
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje al Administrador..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSendingMessage || !newMessage.trim()}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Enviar
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* First Time Application Form */
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>Biografía y Experiencia Docente o Técnica *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos brevemente sobre tu experiencia (ej: Desarrollador Java con 4 años de experiencia, estudiante de informática, etc.)."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>Portafolio, GitHub o LinkedIn (Opcional)</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/tu-usuario o https://linkedin.com/in/tu-perfil"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>¿Qué cursos o temas te gustaría enseñar y por qué? *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Ej: Quiero crear un curso modular de Programación en Java y estructuras de datos con ejercicios interactivos para ayudar a mis compañeros."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
