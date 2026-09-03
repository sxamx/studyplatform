import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Save, X, Cpu, ExternalLink } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { Button } from '../shared/Button';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIConfigData {
  provider: 'groq' | 'gemini' | 'openai' | 'openrouter';
  modelId: string;
  apiKeyMasked: string;
  maxTokens: number;
  temperature: number;
  isActive: number | boolean;
}

const PROVIDER_MODELS: Record<string, Array<{ id: string; name: string; desc: string }>> = {
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B (Recomendado)', desc: 'Ultra rápido (<350ms), 100% Gratis en Groq Cloud' },
    { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant', desc: 'Latencia mínima (<150ms), ideal para tareas breves' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B 32k', desc: 'Gran ventana de contexto y alta precisión técnica' },
  ],
  gemini: [
    { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash', desc: 'Modelo insignia rápido con cuota gratuita de Google' },
    { id: 'gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', desc: 'Generación multimodal de última generación' },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Económico y capaz para código y esquemas pedagógicos' },
    { id: 'gpt-4o', name: 'GPT-4o Completo', desc: 'Máxima capacidad analítica' },
  ],
  openrouter: [
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta LLaMA 3.3 70B', desc: 'Vía OpenRouter' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', desc: 'Excelente costo-beneficio' },
  ],
};

const PROVIDER_LINKS: Record<string, { label: string; url: string }> = {
  groq: { label: 'Obtener Key Gratis en console.groq.com', url: 'https://console.groq.com/keys' },
  gemini: { label: 'Obtener Key Gratis en Google AI Studio', url: 'https://aistudio.google.com/app/apikey' },
  openai: { label: 'Obtener Key en platform.openai.com', url: 'https://platform.openai.com/api-keys' },
  openrouter: { label: 'Obtener Key en openrouter.ai', url: 'https://openrouter.ai/keys' },
};

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AIConfigData>({
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    apiKeyMasked: '',
    maxTokens: 1500,
    temperature: 0.7,
    isActive: 1,
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setStatusMessage(null);
      setApiKeyInput('');
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const res = await apiFetch<{ config: AIConfigData }>('/admin/ai-config');
      if (res?.config) {
        setConfig(res.config);
      }
    } catch (err: any) {
      console.warn('Error loading AI config:', err);
    }
  };

  const handleProviderChange = (newProvider: 'groq' | 'gemini' | 'openai' | 'openrouter') => {
    const models = PROVIDER_MODELS[newProvider] || [];
    setConfig((prev) => ({
      ...prev,
      provider: newProvider,
      modelId: models[0]?.id || '',
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await apiFetch('/admin/ai-config', {
        method: 'PUT',
        body: JSON.stringify({
          provider: config.provider,
          modelId: config.modelId,
          apiKey: apiKeyInput.trim() || undefined,
          maxTokens: Number(config.maxTokens),
          temperature: Number(config.temperature),
          isActive: Boolean(config.isActive),
        }),
      });

      setStatusMessage({ type: 'success', text: '¡Configuración de IA guardada exitosamente!' });
      setApiKeyInput('');
      await loadConfig();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al guardar configuración' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentModels = PROVIDER_MODELS[config.provider] || [];
  const helperLink = PROVIDER_LINKS[config.provider];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#161616] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex items-center justify-between bg-gray-50/50 dark:bg-[#1B1B1B]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white flex items-center gap-2">
                <span>Configuración de IA (BYOK)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                  Universal API Key
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Usa tu propia API Key (Groq, Gemini, OpenAI) sin depender de Cloudflare Workers AI
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

        {/* Body */}
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
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
          )}

          {/* Active Switch */}
          <div className="flex items-center justify-between p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-2xl">
            <div>
              <div className="font-bold text-sm text-purple-900 dark:text-purple-200">
                Habilitar Copiloto con API Externa
              </div>
              <div className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                Al activar esta opción, el chat de cursos responderá con el modelo neuronal seleccionado
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(config.isActive)}
                onChange={(e) => setConfig((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700 dark:text-gray-300">Proveedor de Inferencia:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['groq', 'gemini', 'openai', 'openrouter'] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => handleProviderChange(prov)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    config.provider === prov
                      ? 'border-[#0066CC] dark:border-[#4D94FF] bg-blue-50/60 dark:bg-blue-950/40 text-[#0066CC] dark:text-[#4D94FF] font-bold shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-xs capitalize">{prov === 'groq' ? '⚡ Groq (Gratis)' : prov}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700 dark:text-gray-300">Modelo Neuronal:</label>
            <select
              value={config.modelId}
              onChange={(e) => setConfig((prev) => ({ ...prev, modelId: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] text-xs font-semibold focus:outline-none focus:border-[#0066CC]"
            >
              {currentModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.desc}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>API Key de {config.provider.toUpperCase()}:</span>
              </label>
              {helperLink && (
                <a
                  href={helperLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#0066CC] dark:text-[#4D94FF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>{helperLink.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="password"
              placeholder={config.apiKeyMasked ? `Clave actual: ${config.apiKeyMasked} (deja en blanco para conservar)` : 'Pega aquí tu API Key (ej. gsk_...)'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] text-xs font-mono focus:outline-none focus:border-[#0066CC]"
            />
            <p className="text-[11px] text-gray-500 italic">
              🔒 Tu clave se guarda cifrada en la base de datos D1 y nunca se expone a los alumnos.
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Tokens Máximos:</label>
              <input
                type="number"
                min="256"
                max="4096"
                value={config.maxTokens}
                onChange={(e) => setConfig((prev) => ({ ...prev, maxTokens: Number(e.target.value) }))}
                className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-600 dark:text-gray-400">Temperatura (Creatividad):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1.5"
                value={config.temperature}
                onChange={(e) => setConfig((prev) => ({ ...prev, temperature: Number(e.target.value) }))}
                className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#202020] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/50 dark:bg-[#1B1B1B]/50 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  );
};
