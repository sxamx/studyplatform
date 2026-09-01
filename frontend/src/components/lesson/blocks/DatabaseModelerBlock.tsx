import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Plus,
  Link as LinkIcon,
  Trash2,
  Key,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DatabaseModelerBlock as IDatabaseModelerBlock,
  EntityDefinition,
  EntityAttribute,
  RelationshipDefinition,
} from '../../../types';
import { Button } from '../../shared/Button';
import { Badge } from '../../shared/Badge';
import { Modal } from '../../shared/Modal';
import { Input } from '../../shared/Input';

interface DatabaseModelerBlockProps {
  block: IDatabaseModelerBlock;
  savedAnswer?: any;
  onAnswerChange?: (answer: any, isCorrect: boolean) => void;
}

export const DatabaseModelerBlock: React.FC<DatabaseModelerBlockProps> = ({
  block,
  savedAnswer,
  onAnswerChange,
}) => {
  // Persistence key
  const storageKey = `studyplatform_er_${block.id}`;

  // Initial State from block or savedAnswer
  const getInitialEntities = (): EntityDefinition[] => {
    if (savedAnswer?.entities) return savedAnswer.entities;
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.entities) return parsed.entities;
      } catch {}
    }
    return block.initialEntities || [
      {
        id: `ent_1`,
        name: 'Entidad1',
        position: { x: 40, y: 40 },
        attributes: [{ name: 'id', type: 'INTEGER', isPk: true }],
      },
    ];
  };

  const getInitialRelationships = (): RelationshipDefinition[] => {
    if (savedAnswer?.relationships) return savedAnswer.relationships;
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.relationships) return parsed.relationships;
      } catch {}
    }
    return [];
  };

  const [entities, setEntities] = useState<EntityDefinition[]>(getInitialEntities);
  const [relationships, setRelationships] = useState<RelationshipDefinition[]>(getInitialRelationships);
  const [showHint, setShowHint] = useState(false);
  const [showScenario, setShowScenario] = useState(true);

  // Validation state
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    score: number;
    messages: { text: string; passed: boolean }[];
  } | null>(null);

  // Modals state
  const [isAddEntityModalOpen, setIsAddEntityModalOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');

  const [isAddAttrModalOpen, setIsAddAttrModalOpen] = useState(false);
  const [selectedEntityIdForAttr, setSelectedEntityIdForAttr] = useState<string | null>(null);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('VARCHAR(100)');
  const [newAttrIsPk, setNewAttrIsPk] = useState(false);
  const [newAttrIsFk, setNewAttrIsFk] = useState(false);

  const [isAddRelModalOpen, setIsAddRelModalOpen] = useState(false);
  const [relSourceId, setRelSourceId] = useState('');
  const [relTargetId, setRelTargetId] = useState('');
  const [relCardinality, setRelCardinality] = useState<'1:1' | '1:N' | 'N:M'>('1:N');

  // Dragging state
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-save to localStorage & parent
  useEffect(() => {
    const dataToSave = { entities, relationships };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [entities, relationships, storageKey]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, entity: EntityDefinition) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    const currentPos = entity.position || { x: 40, y: 40 };
    dragOffsetRef.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    };
    setDraggingEntityId(entity.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingEntityId) return;
    const newX = Math.max(10, Math.min(800, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(600, e.clientY - dragOffsetRef.current.y));

    setEntities((prev) =>
      prev.map((ent) => (ent.id === draggingEntityId ? { ...ent, position: { x: newX, y: newY } } : ent))
    );
  };

  const handleMouseUp = () => {
    setDraggingEntityId(null);
  };

  // Add Entity
  const handleAddEntitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    const id = `ent_${Date.now()}`;
    const newEnt: EntityDefinition = {
      id,
      name: newEntityName.trim(),
      position: { x: 50 + (entities.length % 3) * 220, y: 60 + Math.floor(entities.length / 3) * 160 },
      attributes: [{ name: `${newEntityName.toLowerCase().replace(/\s+/g, '_')}_id`, type: 'INTEGER', isPk: true }],
    };

    setEntities([...entities, newEnt]);
    setNewEntityName('');
    setIsAddEntityModalOpen(false);
  };

  // Delete Entity
  const handleDeleteEntity = (entId: string) => {
    setEntities(entities.filter((e) => e.id !== entId));
    setRelationships(relationships.filter((r) => r.sourceEntityId !== entId && r.targetEntityId !== entId));
  };

  // Add Attribute
  const handleAddAttributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityIdForAttr || !newAttrName.trim()) return;

    const newAttr: EntityAttribute = {
      name: newAttrName.trim().toLowerCase().replace(/\s+/g, '_'),
      type: newAttrType,
      isPk: newAttrIsPk,
      isFk: newAttrIsFk,
    };

    setEntities(
      entities.map((ent) => {
        if (ent.id === selectedEntityIdForAttr) {
          return { ...ent, attributes: [...ent.attributes, newAttr] };
        }
        return ent;
      })
    );

    setNewAttrName('');
    setNewAttrIsPk(false);
    setNewAttrIsFk(false);
    setIsAddAttrModalOpen(false);
  };

  // Delete Attribute
  const handleDeleteAttribute = (entId: string, attrIndex: number) => {
    setEntities(
      entities.map((ent) => {
        if (ent.id === entId) {
          return {
            ...ent,
            attributes: ent.attributes.filter((_, idx) => idx !== attrIndex),
          };
        }
        return ent;
      })
    );
  };

  // Add Relationship
  const handleAddRelationshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relSourceId || !relTargetId || relSourceId === relTargetId) {
      alert('Selecciona dos entidades distintas para relacionar');
      return;
    }

    const newRel: RelationshipDefinition = {
      id: `rel_${Date.now()}`,
      sourceEntityId: relSourceId,
      targetEntityId: relTargetId,
      cardinality: relCardinality,
    };

    setRelationships([...relationships, newRel]);
    setIsAddRelModalOpen(false);
  };

  // Delete Relationship
  const handleDeleteRelationship = (relId: string) => {
    setRelationships(relationships.filter((r) => r.id !== relId));
  };

  // Reset Model
  const handleReset = () => {
    if (!window.confirm('¿Deseas reiniciar el diagrama al estado inicial?')) return;
    localStorage.removeItem(storageKey);
    setEntities(block.initialEntities || []);
    setRelationships([]);
    setValidationResults(null);
  };

  // Validation Logic against expectedModel
  const handleValidateModel = () => {
    const expected = block.expectedModel;
    if (!expected) {
      setValidationResults({
        isValid: true,
        score: 100,
        messages: [{ text: '¡Diagrama modelado correctamente!', passed: true }],
      });
      onAnswerChange?.({ entities, relationships }, true);
      return;
    }

    const messages: { text: string; passed: boolean }[] = [];
    let passedCount = 0;
    let totalChecks = 0;

    // 1. Check Expected Entities
    if (expected.entities) {
      expected.entities.forEach((expEnt) => {
        totalChecks++;
        const found = entities.find((e) => e.name.toLowerCase() === expEnt.name.toLowerCase());
        if (found) {
          passedCount++;
          messages.push({ text: `Entidad "${expEnt.name}" presente en el modelo.`, passed: true });

          // Check attributes
          if (expEnt.attributes) {
            expEnt.attributes.forEach((expAttr) => {
              totalChecks++;
              const attrFound = found.attributes.find(
                (a) => a.name.toLowerCase() === expAttr.name.toLowerCase()
              );
              if (attrFound) {
                if (expAttr.isPk && !attrFound.isPk) {
                  messages.push({
                    text: `El atributo "${expAttr.name}" en "${expEnt.name}" debe ser Clave Primaria (PK).`,
                    passed: false,
                  });
                } else if (expAttr.isFk && !attrFound.isFk) {
                  messages.push({
                    text: `El atributo "${expAttr.name}" en "${expEnt.name}" debe ser Clave Foránea (FK).`,
                    passed: false,
                  });
                } else {
                  passedCount++;
                  messages.push({
                    text: `Atributo "${expAttr.name}" configurado correctamente en "${expEnt.name}".`,
                    passed: true,
                  });
                }
              } else {
                messages.push({
                  text: `Falta el atributo "${expAttr.name}" en la tabla "${expEnt.name}".`,
                  passed: false,
                });
              }
            });
          }
        } else {
          messages.push({ text: `Falta la entidad "${expEnt.name}".`, passed: false });
        }
      });
    }

    // 2. Check Expected Relationships
    if (expected.relationships) {
      expected.relationships.forEach((expRel) => {
        totalChecks++;
        const relFound = relationships.find((r) => {
          const s = entities.find((e) => e.id === r.sourceEntityId);
          const t = entities.find((e) => e.id === r.targetEntityId);
          if (!s || !t) return false;
          const matchDirect =
            s.name.toLowerCase() === expRel.source.toLowerCase() &&
            t.name.toLowerCase() === expRel.target.toLowerCase();
          const matchInverse =
            s.name.toLowerCase() === expRel.target.toLowerCase() &&
            t.name.toLowerCase() === expRel.source.toLowerCase();
          return (matchDirect || matchInverse) && r.cardinality === expRel.cardinality;
        });

        if (relFound) {
          passedCount++;
          messages.push({
            text: `Relación ${expRel.source} ⟷ ${expRel.target} (${expRel.cardinality}) establecida.`,
            passed: true,
          });
        } else {
          messages.push({
            text: `Falta relación entre "${expRel.source}" y "${expRel.target}" con cardinalidad ${expRel.cardinality}.`,
            passed: false,
          });
        }
      });
    }

    const score = totalChecks > 0 ? Math.round((passedCount / totalChecks) * 100) : 100;
    const isValid = score >= 80;

    setValidationResults({
      isValid,
      score,
      messages,
    });

    onAnswerChange?.({ entities, relationships }, isValid);
  };

  return (
    <div className="space-y-4 my-6">
      {/* Block Header */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#0f1f33] dark:to-[#141d2e] border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#0066CC] text-white shadow-sm">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF]">
                Lienzo de Modelado ER (Data Modeler)
              </span>
              <h3 className="text-lg font-extrabold text-[#1A1A1A] dark:text-white leading-tight">
                {block.title}
              </h3>
            </div>
          </div>

          <Badge variant="primary" size="sm">
            <Layers className="w-3 h-3 mr-1 inline" /> {entities.length} Tablas
          </Badge>
        </div>

        <p className="text-xs text-[#666666] dark:text-[#B0B0B0] leading-relaxed">
          {block.instructions}
        </p>

        {/* Scenario toggle */}
        {block.scenario && (
          <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/40">
            <button
              type="button"
              onClick={() => setShowScenario(!showScenario)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0066CC] dark:text-[#4D94FF]"
            >
              <span>{showScenario ? 'Ocultar enunciado' : 'Ver enunciado del problema'}</span>
              {showScenario ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showScenario && (
              <p className="mt-2 p-3 bg-white/70 dark:bg-black/30 rounded-xl text-xs text-gray-800 dark:text-gray-200 leading-relaxed italic border border-blue-100 dark:border-blue-900/30">
                "{block.scenario}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddEntityModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Añadir Entidad (Tabla)
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={entities.length < 2}
            onClick={() => {
              if (entities.length >= 2) {
                setRelSourceId(entities[0].id);
                setRelTargetId(entities[1].id);
                setIsAddRelModalOpen(true);
              }
            }}
            leftIcon={<LinkIcon className="w-4 h-4" />}
          >
            Crear Relación
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-gray-500" />}
            title="Reiniciar modelo"
          >
            Reiniciar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {block.hint && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              leftIcon={<HelpCircle className="w-4 h-4 text-amber-500" />}
            >
              {showHint ? 'Ocultar Pista' : 'Pista'}
            </Button>
          )}

          <Button
            variant="success"
            size="sm"
            onClick={handleValidateModel}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Validar Modelo
          </Button>
        </div>
      </div>

      {/* Hint Box */}
      {showHint && block.hint && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>{block.hint}</span>
        </div>
      )}

      {/* Interactive ER Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-[520px] bg-slate-50 dark:bg-[#0c0c0c] border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl overflow-hidden select-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #88888825 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* SVG Connectors for Relationships */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {relationships.map((rel) => {
            const source = entities.find((e) => e.id === rel.sourceEntityId);
            const target = entities.find((e) => e.id === rel.targetEntityId);
            if (!source || !target) return null;

            const sX = (source.position?.x || 40) + 110;
            const sY = (source.position?.y || 40) + 70;
            const tX = (target.position?.x || 240) + 110;
            const tY = (target.position?.y || 40) + 70;

            const midX = (sX + tX) / 2;
            const midY = (sY + tY) / 2;

            return (
              <g key={rel.id}>
                <line
                  x1={sX}
                  y1={sY}
                  x2={tX}
                  y2={tY}
                  stroke="#0066CC"
                  strokeWidth="2.5"
                  strokeDasharray={rel.cardinality === 'N:M' ? '4 4' : undefined}
                />
                <circle cx={sX} cy={sY} r="4" fill="#0066CC" />
                <circle cx={tX} cy={tY} r="4" fill="#0066CC" />
                {/* Cardinality Badge on center */}
                <rect
                  x={midX - 18}
                  y={midY - 10}
                  width="36"
                  height="20"
                  rx="6"
                  fill="#0066CC"
                  className="shadow-sm"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {rel.cardinality}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Entity Cards */}
        {entities.map((entity) => {
          const posX = entity.position?.x ?? 40;
          const posY = entity.position?.y ?? 40;

          return (
            <div
              key={entity.id}
              onMouseDown={(e) => handleMouseDown(e, entity)}
              style={{ transform: `translate(${posX}px, ${posY}px)` }}
              className="absolute w-56 bg-white dark:bg-[#181818] border-2 border-[#0066CC] dark:border-[#4D94FF] rounded-xl shadow-lg z-10 cursor-move transition-shadow hover:shadow-xl"
            >
              {/* Entity Table Header */}
              <div className="p-2.5 bg-[#0066CC] dark:bg-[#1a4a80] text-white rounded-t-[10px] flex items-center justify-between">
                <span className="font-bold text-xs truncate max-w-[140px] tracking-wide">
                  {entity.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteEntity(entity.id)}
                  className="p-1 hover:bg-white/20 rounded transition text-white"
                  title="Eliminar entidad"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Attributes / Columns List */}
              <div className="p-2 space-y-1 text-xs max-h-44 overflow-y-auto">
                {entity.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1 bg-gray-50 dark:bg-[#202020] rounded border border-[#E0E0E0] dark:border-[#2D2D2D]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {attr.isPk && (
                        <span title="Clave Primaria (PK)">
                          <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        </span>
                      )}
                      {attr.isFk && (
                        <span title="Clave Foránea (FK)">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-[#1A1A1A] dark:text-white truncate">
                        {attr.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500">{attr.type}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttribute(entity.id, idx)}
                        className="text-gray-400 hover:text-rose-500 p-0.5"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Column Button */}
              <div className="p-1.5 border-t border-[#E0E0E0] dark:border-[#2D2D2D] bg-gray-50/50 dark:bg-[#141414] rounded-b-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEntityIdForAttr(entity.id);
                    setIsAddAttrModalOpen(true);
                  }}
                  className="w-full py-1 text-[10px] font-bold text-[#0066CC] dark:text-[#4D94FF] hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" /> Añadir Columna
                </button>
              </div>
            </div>
          );
        })}

        {/* Relationships List Badge in Corner */}
        {relationships.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md p-2 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] z-20 text-[11px] space-y-1">
            <span className="font-bold text-gray-700 dark:text-gray-300 block text-[10px] uppercase">Relaciones:</span>
            {relationships.map((rel) => {
              const s = entities.find((e) => e.id === rel.sourceEntityId)?.name || 'E1';
              const t = entities.find((e) => e.id === rel.targetEntityId)?.name || 'E2';
              return (
                <div key={rel.id} className="flex items-center justify-between gap-2 text-gray-600 dark:text-gray-400">
                  <span>{s} ⟷ {t} ({rel.cardinality})</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteRelationship(rel.id)}
                    className="text-rose-500 hover:underline"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Validation Checklist Panel */}
      {validationResults && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            validationResults.isValid
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {validationResults.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
              <h4 className="font-extrabold text-sm text-[#1A1A1A] dark:text-white">
                {validationResults.isValid
                  ? '¡Excelente! Modelo Entidad-Relación Correcto'
                  : 'Revisión del Modelo: Faltan Ajustes'}
              </h4>
            </div>
            <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-white dark:bg-black/40">
              Puntaje: {validationResults.score}%
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {validationResults.messages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={msg.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {msg.passed ? '✓' : '✗'}
                </span>
                <span className="text-[#1A1A1A] dark:text-white">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Nueva Entidad */}
      <Modal isOpen={isAddEntityModalOpen} onClose={() => setIsAddEntityModalOpen(false)} title="Nueva Entidad (Tabla)">
        <form onSubmit={handleAddEntitySubmit} className="space-y-4">
          <Input
            label="Nombre de la Entidad"
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            placeholder="Ej. Estudiante, Libro, Factura"
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddEntityModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Crear Entidad
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Añadir Columna / Atributo */}
      <Modal isOpen={isAddAttrModalOpen} onClose={() => setIsAddAttrModalOpen(false)} title="Añadir Atributo (Columna)">
        <form onSubmit={handleAddAttributeSubmit} className="space-y-4">
          <Input
            label="Nombre del Atributo"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="Ej. email, fecha_nacimiento, total"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Tipo de Dato SQL
            </label>
            <select
              value={newAttrType}
              onChange={(e) => setNewAttrType(e.target.value)}
              className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            >
              <option value="INTEGER">INTEGER (Entero)</option>
              <option value="VARCHAR(100)">VARCHAR(100) (Texto corto)</option>
              <option value="TEXT">TEXT (Texto largo)</option>
              <option value="DATE">DATE (Fecha)</option>
              <option value="DATETIME">DATETIME (Fecha y Hora)</option>
              <option value="DECIMAL(10,2)">DECIMAL(10,2) (Moneda / Decimal)</option>
              <option value="BOOLEAN">BOOLEAN (Verdadero / Falso)</option>
            </select>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={newAttrIsPk}
                onChange={(e) => setNewAttrIsPk(e.target.checked)}
                className="w-4 h-4 text-[#0066CC] rounded"
              />
              🔑 Clave Primaria (PK)
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={newAttrIsFk}
                onChange={(e) => setNewAttrIsFk(e.target.checked)}
                className="w-4 h-4 text-[#0066CC] rounded"
              />
              🔗 Clave Foránea (FK)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddAttrModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Añadir Atributo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Crear Relación */}
      <Modal isOpen={isAddRelModalOpen} onClose={() => setIsAddRelModalOpen(false)} title="Crear Relación entre Entidades">
        <form onSubmit={handleAddRelationshipSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Entidad Origen
              </label>
              <select
                value={relSourceId}
                onChange={(e) => setRelSourceId(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              >
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
                Entidad Destino
              </label>
              <select
                value={relTargetId}
                onChange={(e) => setRelTargetId(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
              >
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Cardinalidad
            </label>
            <select
              value={relCardinality}
              onChange={(e) => setRelCardinality(e.target.value as any)}
              className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            >
              <option value="1:N">1:N (Uno a Muchos - Ejemplo: 1 Autor tiene N Libros)</option>
              <option value="1:1">1:1 (Uno a Uno)</option>
              <option value="N:M">N:M (Muchos a Muchos - Requiere tabla intermedia)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddRelModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Establecer Relación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
