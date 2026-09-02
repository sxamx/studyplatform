import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  MessageSquare,
  XCircle,
  Send,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../../api/client';
import { CreatorApplication, ApplicationMessage } from '../../types';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';

interface CreatorApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationsChange?: () => void;
}

export const CreatorApplicationsModal: React.FC<CreatorApplicationsModalProps> = ({
  isOpen,
  onClose,
  onApplicationsChange,
}) => {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<CreatorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await apiFetch<{ applications: CreatorApplication[] }>('/admin/creator-applications');
      setApplications(res.applications || []);
      if (res.applications && res.applications.length > 0) {
        if (!selectedApp) {
          // Select first pending or first application
          const initial = res.applications.find((a) => a.status === 'pending') || res.applications[0];
          selectApplication(initial);
        } else {
          const updated = res.applications.find((a) => a.id === selectedApp.id);
          if (updated) selectApplication(updated);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const selectApplication = async (app: CreatorApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.adminNotes || '');
    // Fetch full application with messages
    try {
      const res = await apiFetch<{ application: CreatorApplication }>(`/creator/application?id=${app.id}`);
      if (res.application && res.application.messages) {
        setSelectedApp((prev) => (prev ? { ...prev, messages: res.application.messages } : null));
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedApp) return;
    try {
      setIsUpdatingStatus(true);
      await apiFetch(`/admin/creator-applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      });
      await loadApplications();
      if (onApplicationsChange) onApplicationsChange();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedApp) return;

    try {
      setIsSendingMessage(true);
      const res = await apiFetch<{ message: ApplicationMessage }>('/creator/application/messages', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: selectedApp.id,
          message: chatMessage.trim(),
        }),
      });

      setSelectedApp((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), res.message],
        };
      });
      setChatMessage('');
    } catch (err: any) {
      alert(err.message || 'Error al enviar mensaje');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!isOpen) return null;

  const filteredApps = applications.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-transparent dark:from-blue-950/20 dark:via-purple-950/10 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0066CC] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white tracking-tight flex items-center gap-2">
                <span>Solicitudes de Creador de Contenido</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#0066CC]/10 text-[#0066CC] dark:text-[#4D94FF]">
                  {applications.filter((a) => a.status === 'pending').length} pendientes
                </span>
              </h2>
              <p className="text-xs text-[#666666] dark:text-[#808080]">
                Revisa postulantes, chatea en directo con ellos y aprueba su acceso como Instructor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#242424] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-[#181818]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-2">Filtrar:</span>
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  filter === f
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-white dark:bg-[#242424] text-gray-600 dark:text-gray-300 border border-[#E0E0E0] dark:border-[#2D2D2D]'
                }`}
              >
                {f === 'pending' && 'Pendientes'}
                {f === 'approved' && 'Aprobadas'}
                {f === 'rejected' && 'Rechazadas'}
                {f === 'all' && 'Todas'}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Two-Column Layout: List & Detail/Chat */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: List of Applications */}
          <div className="w-full md:w-80 border-r border-[#E0E0E0] dark:border-[#2D2D2D] overflow-y-auto p-3 space-y-2 bg-gray-50/30 dark:bg-[#141414]">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">Cargando solicitudes...</div>
            ) : filteredApps.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No hay solicitudes con este filtro.
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => selectApplication(app)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-xs ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#0066CC] dark:border-[#4D94FF] shadow-sm'
                        : 'bg-white dark:bg-[#1A1A1A] border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#1A1A1A] dark:text-white truncate">
                        {app.userFullName || 'Postulante'}
                      </span>
                      <Badge
                        variant={
                          app.status === 'approved'
                            ? 'success'
                            : app.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate font-mono">{app.userEmail}</div>
                    <div className="text-[11px] text-gray-400 mt-2 line-clamp-1 italic">
                      "{app.motivation}"
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Application Detail & Direct Chat */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#171717]">
            {selectedApp ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Applicant Summary */}
                <div className="p-5 border-b border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/40 dark:bg-[#1A1A1A] flex flex-wrap items-center justify-between gap-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                        {selectedApp.userFullName || 'Postulante'}
                      </h3>
                      <Badge
                        variant={
                          selectedApp.status === 'approved'
                            ? 'success'
                            : selectedApp.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {selectedApp.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{selectedApp.userEmail}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {selectedApp.status !== 'approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus('approved')}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Aprobar como Creador
                      </Button>
                    )}
                    {selectedApp.status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdatingStatus}
                        onClick={() => handleUpdateStatus('rejected')}
                        className="text-rose-600 hover:text-rose-700"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Rechazar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Body: Bio & Motivation + Chat */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-1">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                        Biografía & Experiencia
                      </span>
                      <p className="text-gray-800 dark:text-gray-200">{selectedApp.bio}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#2D2D2D] space-y-1">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                        Motivación & Temas
                      </span>
                      <p className="text-gray-800 dark:text-gray-200">{selectedApp.motivation}</p>
                      {selectedApp.portfolioUrl && (
                        <div className="pt-2">
                          <a
                            href={selectedApp.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0066CC] dark:text-[#4D94FF] inline-flex items-center gap-1 font-bold hover:underline"
                          >
                            <span>Ver Portafolio / Enlace</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Chat Thread */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-1.5 font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#0066CC]" />
                      <span>Chat Directo con el Postulante</span>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl min-h-[140px] max-h-[200px] overflow-y-auto space-y-3">
                      {selectedApp.messages && selectedApp.messages.length > 0 ? (
                        selectedApp.messages.map((m) => {
                          const isAdminMsg = m.senderRole === 'ADMIN';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-0.5">
                                <span className="font-semibold">
                                  {isAdminMsg ? '👑 Tú (Admin)' : m.senderName || 'Postulante'}
                                </span>
                                <span>•</span>
                                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div
                                className={`px-3.5 py-2 rounded-2xl max-w-[85%] text-xs ${
                                  isAdminMsg
                                    ? 'bg-[#0066CC] text-white rounded-tr-none'
                                    : 'bg-white dark:bg-[#2C2C2C] text-[#1A1A1A] dark:text-white border border-[#E0E0E0] dark:border-[#3D3D3D] rounded-tl-none shadow-sm'
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-400">
                          Escribe un mensaje para solicitar más información o dar feedback al postulante.
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Escribe una respuesta o consulta al postulante..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#202020] text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isSendingMessage || !chatMessage.trim()}
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                      >
                        Enviar
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-gray-400">
                Selecciona una solicitud en la lista izquierda para ver detalles y chatear.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
