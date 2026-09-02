import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../../api/client';
import { CourseAIMessage, AIQuota } from '../../types';
import { Button } from '../shared/Button';

interface CourseAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const CourseAIChatDrawer: React.FC<CourseAIChatDrawerProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [messages, setMessages] = useState<CourseAIMessage[]>([]);
  const [quota, setQuota] = useState<AIQuota | null>(null);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      loadMessages();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch<{ messages: CourseAIMessage[]; quota: AIQuota }>(
        `/ai/courses/${courseId}/messages`
      );
      setMessages(res.messages || []);
      setQuota(res.quota || null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mensajes del Copiloto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isSending) return;

    const userMessage: CourseAIMessage = {
      id: 'temp-' + Date.now(),
      courseId,
      userId: 'me',
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsSending(true);
    setError(null);

    try {
      const res = await apiFetch<{
        reply: string;
        userMessage: CourseAIMessage;
        assistantMessage: CourseAIMessage;
        quota: AIQuota;
      }>(`/ai/courses/${courseId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ prompt: text.trim() }),
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMessage.id),
        res.userMessage,
        res.assistantMessage,
      ]);
      setQuota(res.quota);
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con el Copiloto de IA');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'Generar estructura de 4 módulos pedagógicos',
    'Crear lección interactiva con diagrama Mermaid',
    'Diseñar un Quiz de evaluación de 3 preguntas',
  ];

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen min-w-full flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#121212] h-full shadow-2xl flex flex-col border-l border-[#E0E0E0] dark:border-[#2D2D2D] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                  Copiloto de IA
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  Workers AI
                </span>
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-1">
                {courseTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quota && (
              <span
                title="Consultas restantes para hoy"
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-300 flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{quota.remaining}/{quota.dailyLimit}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#242424] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-gray-400">Cargando conversación...</div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <Bot className="w-10 h-10 mx-auto opacity-30 text-purple-500" />
              <p className="font-medium text-[#1A1A1A] dark:text-white">
                ¡Hola! Soy tu Asistente de Creación de Cursos
              </p>
              <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                Pídeme estructurar lecciones, diseñar diagramas Mermaid, generar quizzes o explicar conceptos complejos.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#0066CC] text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-gray-100 border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-bl-none'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-white bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black transition"
                      title="Copiar contenido"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))
          )}

          {isSending && (
            <div className="flex gap-2.5 items-center text-gray-400 text-xs animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-gray-100 dark:bg-[#1E1E1E] p-3 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D]">
                Generando respuesta pedagógica con Workers AI...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 bg-gray-50/50 dark:bg-[#181818] border-t border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-gray-400 shrink-0">Sugerencias:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              disabled={isSending}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-[#222222] border border-[#E0E0E0] dark:border-[#333333] hover:border-purple-400 hover:text-purple-600 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#141414]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Pregúntale al Copiloto de IA sobre tu curso..."
              disabled={isSending}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#1E1E1E] border border-[#E0E0E0] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputPrompt.trim() || isSending}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
