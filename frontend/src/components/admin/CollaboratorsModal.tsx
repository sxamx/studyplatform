import React, { useState, useEffect } from 'react';
import { Users, Mail, Plus, Trash2, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { Button } from '../shared/Button';

interface Collaborator {
  id: string;
  courseId: string;
  userId: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  email: string;
  fullName: string;
}

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      loadCollaborators();
      setStatusMessage(null);
      setEmailInput('');
    }
  }, [isOpen, courseId]);

  const loadCollaborators = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ collaborators: Collaborator[] }>(`/courses/${courseId}/collaborators`);
      setCollaborators(res.collaborators || []);
    } catch (err: any) {
      console.warn('Error fetching collaborators:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    setIsSending(true);
    setStatusMessage(null);
    try {
      const res = await apiFetch<{ message: string }>(`/courses/${courseId}/collaborators/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStatusMessage({ type: 'success', text: res.message || 'Invitación enviada exitosamente' });
      setEmailInput('');
      await loadCollaborators();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al enviar invitación' });
    } finally {
      setIsSending(false);
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas remover a ${name} de los colaboradores de este curso?`)) return;

    try {
      await apiFetch(`/courses/${courseId}/collaborators/${userId}`, {
        method: 'DELETE',
      });
      setStatusMessage({ type: 'success', text: 'Colaborador removido exitosamente' });
      await loadCollaborators();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al remover colaborador' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#161616] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gray-50/50 dark:bg-[#1B1B1B]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0066CC] dark:text-[#4D94FF] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white">
                Co-Mantenedores y Colaboradores
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-sm">
                Curso: <span className="font-semibold text-gray-700 dark:text-gray-300">{courseTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#1A1A1A] dark:text-[#E0E0E0]">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
          )}

          {/* Invitation Form */}
          <form onSubmit={handleInvite} className="space-y-2">
            <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0066CC]" />
              <span>Invitar Creador por Correo Electrónico:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] text-xs font-mono focus:outline-none focus:border-[#0066CC]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSending}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Invitar
              </Button>
            </div>
            <p className="text-[11px] text-gray-500">
              🛡️ El usuario recibirá una solicitud en su panel y deberá aceptarla para comenzar a editar juntos este curso.
            </p>
          </form>

          {/* Collaborators List */}
          <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-gray-700 dark:text-gray-300">
              Colaboradores del Curso ({collaborators.length})
            </h4>

            {isLoading ? (
              <div className="py-8 text-center text-gray-400">Cargando colaboradores...</div>
            ) : collaborators.length === 0 ? (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1E1E1E] text-center text-gray-400">
                Aún no hay colaboradores en este curso. Invita a otro creador para mantenerlo juntos.
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1B1B1B]/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0066CC] font-bold text-xs flex items-center justify-center">
                        {(c.fullName || c.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                          <span>{c.fullName || c.email}</span>
                          {c.status === 'accepted' ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Pendiente</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{c.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(c.userId, c.fullName || c.email)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Remover colaborador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/50 dark:bg-[#1B1B1B]/50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
