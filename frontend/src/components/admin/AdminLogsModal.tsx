import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Shield, Copy, Check } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  userAgent?: string;
  error?: string;
}

interface AdminLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLogsModal: React.FC<AdminLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'errors' | 'success'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ logs: LogEntry[] }>('/admin/logs');
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const handleClearLogs = async () => {
    if (!window.confirm('¿Deseas vaciar el historial de logs en memoria?')) return;
    try {
      await apiFetch('/admin/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      alert('Error al vaciar logs');
    }
  };

  const handleCopyLog = async (log: LogEntry) => {
    await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'errors') return log.statusCode >= 400;
    if (filter === 'success') return log.statusCode < 400;
    return true;
  });

  const getStatusBadge = (code: number) => {
    if (code >= 500) {
      return (
        <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          {code} ERROR
        </span>
      );
    }
    if (code >= 400) {
      return (
        <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {code} WARN
        </span>
      );
    }
    return (
      <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        {code} OK
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📜 Registro de Logs y Eventos del Sistema"
      size="full"
    >
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-[#141414] rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Filtrar:</span>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'all'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-white dark:bg-[#202020] text-gray-600 dark:text-gray-400'
              }`}
            >
              Todos ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('errors')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'errors'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-[#202020] text-rose-600 dark:text-rose-400'
              }`}
            >
              Errores ({logs.filter((l) => l.statusCode >= 400).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('success')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-[#202020] text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Éxitos ({logs.filter((l) => l.statusCode < 400).length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Actualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLogs}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            >
              Vaciar
            </Button>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white dark:bg-[#181818] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl flex items-center justify-between gap-3 text-xs font-mono hover:border-[#0066CC] transition-colors overflow-x-auto"
              >
                <div className="flex items-center gap-2.5 min-w-0 shrink-0">
                  {getStatusBadge(log.statusCode)}
                  <span className="font-bold text-gray-800 dark:text-gray-200 uppercase shrink-0">
                    {log.method}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {log.path}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-gray-400 font-sans">
                    {log.durationMs}ms
                  </span>
                  <span className="text-[10px] text-gray-400 hidden sm:inline font-sans">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLog(log)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 transition"
                    title="Copiar JSON del log"
                  >
                    {copiedId === log.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl text-xs text-gray-400">
              No hay logs registrados con este filtro.
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#E0E0E0] dark:border-[#2D2D2D] text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#0066CC]" />
            Logs de auditoría protegidos por autenticación de administrador
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
