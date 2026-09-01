import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { DocumentBlock as IDocumentBlock } from '../../../types';
import { Button } from '../../shared/Button';

interface DocumentBlockProps {
  block: IDocumentBlock;
}

// 🛡️ Strict URL sanitizer against Prompt Injection & XSS (allows ONLY http/https)
function sanitizeUrl(rawUrl: string): { safeUrl: string; isValid: boolean; errorReason?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safeUrl: '', isValid: false, errorReason: 'URL no proporcionada.' };
  }

  const trimmed = rawUrl.trim();

  // Block malicious pseudo-protocols immediately
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'blob:', 'file:', 'about:'];
  const lower = trimmed.toLowerCase();
  for (const proto of dangerousProtocols) {
    if (lower.startsWith(proto)) {
      return {
        safeUrl: '',
        isValid: false,
        errorReason: `Protocolo no seguro detectado (${proto}). Por seguridad, solo se admiten enlaces https://`,
      };
    }
  }

  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return {
      safeUrl: '',
      isValid: false,
      errorReason: 'La URL debe comenzar con https:// o http://',
    };
  }

  return { safeUrl: trimmed, isValid: true };
}

// Convert various cloud links (Google Drive, Docs, etc.) into safe embeddable sandbox URLs
function getEmbeddableViewerUrl(url: string): { embedUrl: string; isPdf: boolean } {
  const lower = url.toLowerCase();

  // Google Drive File View -> Preview
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return {
        embedUrl: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`,
        isPdf: true,
      };
    }
  }

  // Google Docs / Sheets / Slides
  if (url.includes('docs.google.com/document/d/') || url.includes('docs.google.com/presentation/d/')) {
    const clean = url.split('/edit')[0].split('/view')[0];
    return {
      embedUrl: `${clean}/preview`,
      isPdf: false,
    };
  }

  // Direct PDF URL -> Render via Google Docs Embedded Viewer for 100% cross-browser safe sandbox
  if (lower.endsWith('.pdf') || lower.includes('.pdf?') || url.includes('/pdf/')) {
    return {
      embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
      isPdf: true,
    };
  }

  // Default fallback: direct URL
  return {
    embedUrl: url,
    isPdf: lower.endsWith('.pdf') || lower.includes('pdf'),
  };
}

export const DocumentBlock: React.FC<DocumentBlockProps> = ({ block }) => {
  const [showPreview, setShowPreview] = useState(true);
  const { safeUrl, isValid, errorReason } = sanitizeUrl(block.url);
  const { embedUrl, isPdf } = getEmbeddableViewerUrl(safeUrl);

  if (!isValid) {
    return (
      <div className="my-5 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Enlace de recurso bloqueado por seguridad</p>
          <p className="text-[11px] opacity-90">{errorReason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl border border-[#E0E0E0] dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A] overflow-hidden shadow-sm transition-all hover:border-[#0066CC]/50">
      {/* Header Bar */}
      <div className="p-4 bg-gray-50 dark:bg-[#141414] border-b border-[#E0E0E0] dark:border-[#2D2D2D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#0066CC]/10 dark:bg-[#4D94FF]/20 text-[#0066CC] dark:text-[#4D94FF] shrink-0">
            {isPdf ? <FileText className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                {block.title || 'Documento de Estudio / PDF'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0066CC]/10 text-[#0066CC] dark:bg-[#4D94FF]/20 dark:text-[#4D94FF] uppercase tracking-wider">
                {isPdf ? 'Documento PDF' : 'Recurso Web'}
              </span>
            </div>
            {block.description && (
              <p className="text-xs text-[#666666] dark:text-[#B0B0B0] mt-0.5">
                {block.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          >
            {showPreview ? 'Ocultar Lector' : 'Abrir Lector'}
          </Button>

          {/* Download Button */}
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066CC] text-white hover:bg-[#0052A3] text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar</span>
          </a>

          {/* Open in New Window */}
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title="Abrir en pestaña completa"
            className="p-2 text-gray-500 hover:text-[#1A1A1A] dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#252525] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Sandboxed Viewer */}
      {showPreview && (
        <div className="space-y-1">
          <div className="relative w-full h-[520px] bg-gray-100 dark:bg-[#0F0F0F] border-b border-[#E0E0E0] dark:border-[#2D2D2D]">
            <iframe
              src={embedUrl}
              title={block.title || 'Visor Seguro de Documento'}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>

          {/* Security & Sandbox indicator footer */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-[#141414] flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Visor Aislado en Sandbox (Protección activa contra scripts externos)</span>
            </span>
            {block.fileSize && <span>Tamaño: {block.fileSize}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
