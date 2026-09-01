import React from 'react';
import {
  Type,
  Heading,
  Code,
  Image as ImageIcon,
  Video,
  FileText,
  HelpCircle,
  Edit3,
  ListChecks,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Database,
} from 'lucide-react';
import { Block, BlockType } from '../../../types';
import { Badge } from '../../shared/Badge';
import { Button } from '../../shared/Button';

interface BlockCardProps {
  block: Block;
  index: number;
  totalBlocks: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (block: Block, index: number) => void;
  onDelete: (index: number) => void;
}

const getBlockTypeMeta = (type: BlockType) => {
  switch (type) {
    case 'heading':
      return { label: 'Encabezado', icon: Heading, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' };
    case 'text':
      return { label: 'Texto', icon: Type, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40' };
    case 'code':
      return { label: 'Código', icon: Code, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    case 'document':
      return { label: 'Documento / PDF', icon: FileText, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' };
    case 'image':
      return { label: 'Imagen', icon: ImageIcon, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/40' };
    case 'video':
      return { label: 'Video', icon: Video, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' };
    case 'question_choice':
      return { label: 'Selección Múltiple', icon: HelpCircle, color: 'text-[#0066CC] dark:text-[#4D94FF]', bg: 'bg-blue-50 dark:bg-blue-950/40' };
    case 'question_free':
      return { label: 'Pregunta Libre / Código', icon: Edit3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' };
    case 'quiz':
      return { label: 'Cuestionario (Quiz)', icon: ListChecks, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40' };
    case 'info':
      return { label: 'Alerta / Nota', icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' };
    case 'database_modeler':
      return { label: 'Lienzo ER (Data Modeler)', icon: Database, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' };
    default:
      return { label: 'Bloque', icon: Type, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  index,
  totalBlocks,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}) => {
  const meta = getBlockTypeMeta(block.type);
  const Icon = meta.icon;

  const renderSummary = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="font-bold text-base text-[#1A1A1A] dark:text-white">
            <span className="text-xs text-[#0066CC] dark:text-[#4D94FF] mr-2">H{block.level}</span>
            {block.content || <span className="italic text-gray-400">(Sin contenido)</span>}
          </div>
        );
      case 'text':
        return (
          <p className="text-xs text-[#666666] dark:text-[#B0B0B0] line-clamp-2">
            {block.content || <span className="italic text-gray-400">(Texto vacío)</span>}
          </p>
        );
      case 'code':
        return (
          <div className="text-xs font-mono bg-gray-50 dark:bg-black/40 p-2 rounded border border-[#E0E0E0] dark:border-[#2D2D2D] line-clamp-2 text-[#1A1A1A] dark:text-gray-300">
            <span className="text-[10px] text-emerald-600 font-bold uppercase mr-2">[{block.language}]</span>
            {block.code}
          </div>
        );
      case 'document':
        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-[#1A1A1A] dark:text-white">📄 {block.title || 'Documento / PDF'}</p>
            <p className="text-[11px] text-gray-400 font-mono truncate">{block.url}</p>
          </div>
        );
      case 'image':
        return (
          <div className="flex items-center gap-3">
            {block.url ? (
              <img src={block.url} alt={block.alt} className="w-12 h-12 object-cover rounded border border-[#E0E0E0] dark:border-[#2D2D2D]" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400 text-xs">Sin URL</div>
            )}
            <div className="text-xs">
              <p className="font-medium text-[#1A1A1A] dark:text-white truncate max-w-xs">{block.alt || 'Sin descripción'}</p>
              {block.caption && <p className="text-[#666666] dark:text-[#B0B0B0] italic text-[11px]">{block.caption}</p>}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-[#1A1A1A] dark:text-white">{block.title || 'Video sin título'}</p>
            <p className="text-[11px] text-gray-400 truncate">{block.url}</p>
          </div>
        );
      case 'question_choice':
        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-[#1A1A1A] dark:text-white">❓ {block.question}</p>
            <p className="text-[11px] text-[#666666] dark:text-[#B0B0B0]">
              {block.options?.length || 0} opciones ({block.options?.find((o) => o.isCorrect)?.text || 'Ninguna correcta seleccionada'})
            </p>
          </div>
        );
      case 'question_free':
        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-[#1A1A1A] dark:text-white">✍️ {block.question}</p>
            <p className="text-[11px] text-gray-400 font-mono">Esperado: {block.expectedAnswer}</p>
          </div>
        );
      case 'quiz':
        return (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-[#1A1A1A] dark:text-white">📝 {block.title}</p>
            <p className="text-[11px] text-[#666666] dark:text-[#B0B0B0]">{block.questions?.length || 0} preguntas en total</p>
          </div>
        );
      case 'info':
        return (
          <div className="text-xs space-y-0.5">
            {block.title && <p className="font-semibold text-[#1A1A1A] dark:text-white">[{block.level || 'info'}] {block.title}</p>}
            <p className="text-[#666666] dark:text-[#B0B0B0] line-clamp-1">{block.message}</p>
          </div>
        );
      case 'database_modeler':
        return (
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-[#1A1A1A] dark:text-white">🗄️ {block.title}</p>
            <p className="text-[#666666] dark:text-[#B0B0B0] line-clamp-1">{block.instructions}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl shadow-sm hover:border-[#0066CC] dark:hover:border-[#4D94FF] transition-all gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2.5 rounded-lg shrink-0 ${meta.bg} ${meta.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-gray-400">#{index + 1}</span>
            <Badge variant="primary" size="sm">
              {meta.label}
            </Badge>
            <span className="text-[10px] font-mono text-gray-400">ID: {block.id}</span>
          </div>
          {renderSummary()}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="p-1.5 text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-[#252525] transition"
          title="Mover arriba"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <button
          onClick={() => onMoveDown(index)}
          disabled={index === totalBlocks - 1}
          className="p-1.5 text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white disabled:opacity-30 rounded hover:bg-gray-100 dark:hover:bg-[#252525] transition"
          title="Mover abajo"
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(block, index)}
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
        >
          Editar
        </Button>

        <button
          onClick={() => onDelete(index)}
          className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          title="Eliminar bloque"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
