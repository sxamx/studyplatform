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
  Edit2,
  FileText,
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
  const storageKey = `studyplatform_er_${block.id}`;

  const getInitialEntities = (): EntityDefinition[] => {
    if (savedAnswer?.entities) return savedAnswer.entities;
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.entities && parsed.entities.length > 0) return parsed.entities;
      } catch {}
    }
    return block.initialEntities || [
      {
        id: `ent_1`,
        name: 'Entidad1',
        position: { x: 30, y: 30 },
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
  // 1. Add / Edit Entity
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [entityFormName, setEntityFormName] = useState('');
  const [entityFormNotes, setEntityFormNotes] = useState('');

  // 2. Add / Edit Attribute
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [selectedEntityIdForAttr, setSelectedEntityIdForAttr] = useState<string | null>(null);
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);
  const [attrFormName, setAttrFormName] = useState('');
  const [attrFormType, setAttrFormType] = useState('VARCHAR(100)');
  const [attrFormIsPk, setAttrFormIsPk] = useState(false);
  const [attrFormIsFk, setAttrFormIsFk] = useState(false);

  // 3. Add / Edit Relationship
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [editingRelId, setEditingRelId] = useState<string | null>(null);
  const [relSourceId, setRelSourceId] = useState('');
  const [relTargetId, setRelTargetId] = useState('');
  const [relCardinality, setRelCardinality] = useState<'1:1' | '1:N' | 'N:M'>('1:N');

  // Dragging state (Mouse & Touch)
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-save
  useEffect(() => {
    const dataToSave = { entities, relationships };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [entities, relationships, storageKey]);

  // Unified drag coordinate calculation with BOUNDS protection
  const updateEntityPosition = (clientX: number, clientY: number) => {
    if (!draggingEntityId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentX = clientX - canvasRect.left - dragOffsetRef.current.x;
    const currentY = clientY - canvasRect.top - dragOffsetRef.current.y;

    const maxX = Math.max(10, canvasRef.current.clientWidth - 230);
    const maxY = Math.max(10, canvasRef.current.clientHeight - 180);

    const boundedX = Math.max(10, Math.min(maxX, currentX));
    const boundedY = Math.max(10, Math.min(maxY, currentY));

    setEntities((prev) =>
      prev.map((ent) => (ent.id === draggingEntityId ? { ...ent, position: { x: boundedX, y: boundedY } } : ent))
    );
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent, entity: EntityDefinition) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentPos = entity.position || { x: 30, y: 30 };
    dragOffsetRef.current = {
      x: e.clientX - canvasRect.left - currentPos.x,
      y: e.clientY - canvasRect.top - currentPos.y,
    };
    setDraggingEntityId(entity.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingEntityId) return;
    updateEntityPosition(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setDraggingEntityId(null);
  };

  // Touch Drag Handlers (Mobile & Tablets)
  const handleTouchStart = (e: React.TouchEvent, entity: EntityDefinition) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    if (!canvasRef.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentPos = entity.position || { x: 30, y: 30 };
    dragOffsetRef.current = {
      x: touch.clientX - canvasRect.left - currentPos.x,
      y: touch.clientY - canvasRect.top - currentPos.y,
    };
    setDraggingEntityId(entity.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingEntityId || e.touches.length === 0) return;
    e.preventDefault(); // Prevent page scrolling during entity drag
    updateEntityPosition(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setDraggingEntityId(null);
  };

  // Add / Edit Entity Submit
  const handleOpenAddEntity = () => {
    setEditingEntityId(null);
    setEntityFormName('');
    setEntityFormNotes('');
    setIsEntityModalOpen(true);
  };

  const handleOpenEditEntity = (entity: EntityDefinition) => {
    setEditingEntityId(entity.id);
    setEntityFormName(entity.name);
    setEntityFormNotes(entity.notes || '');
    setIsEntityModalOpen(true);
  };

  const handleEntitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityFormName.trim()) return;

    if (editingEntityId) {
      // Edit existing entity
      setEntities((prev) =>
        prev.map((ent) =>
          ent.id === editingEntityId
            ? { ...ent, name: entityFormName.trim(), notes: entityFormNotes.trim() || undefined }
            : ent
        )
      );
    } else {
      // Create new entity
      const id = `ent_${Date.now()}`;
      const maxX = canvasRef.current ? Math.max(10, canvasRef.current.clientWidth - 240) : 300;
      const maxY = canvasRef.current ? Math.max(10, canvasRef.current.clientHeight - 200) : 250;
      const posX = Math.min(maxX, 30 + (entities.length % 3) * 210);
      const posY = Math.min(maxY, 40 + Math.floor(entities.length / 3) * 160);

      const newEnt: EntityDefinition = {
        id,
        name: entityFormName.trim(),
        notes: entityFormNotes.trim() || undefined,
        position: { x: posX, y: posY },
        attributes: [
          { name: `${entityFormName.toLowerCase().replace(/\s+/g, '_')}_id`, type: 'INTEGER', isPk: true },
        ],
      };
      setEntities([...entities, newEnt]);
    }

    setIsEntityModalOpen(false);
  };

  const handleDeleteEntity = (entId: string) => {
    setEntities(entities.filter((e) => e.id !== entId));
    setRelationships(relationships.filter((r) => r.sourceEntityId !== entId && r.targetEntityId !== entId));
  };

  // Add / Edit Attribute Submit
  const handleOpenAddAttr = (entityId: string) => {
    setSelectedEntityIdForAttr(entityId);
    setEditingAttrIndex(null);
    setAttrFormName('');
    setAttrFormType('VARCHAR(100)');
    setAttrFormIsPk(false);
    setAttrFormIsFk(false);
    setIsAttrModalOpen(true);
  };

  const handleOpenEditAttr = (entityId: string, attr: EntityAttribute, index: number) => {
    setSelectedEntityIdForAttr(entityId);
    setEditingAttrIndex(index);
    setAttrFormName(attr.name);
    setAttrFormType(attr.type);
    setAttrFormIsPk(Boolean(attr.isPk));
    setAttrFormIsFk(Boolean(attr.isFk));
    setIsAttrModalOpen(true);
  };

  const handleAttrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityIdForAttr || !attrFormName.trim()) return;

    const newAttr: EntityAttribute = {
      name: attrFormName.trim().toLowerCase().replace(/\s+/g, '_'),
      type: attrFormType,
      isPk: attrFormIsPk,
      isFk: attrFormIsFk,
    };

    setEntities((prev) =>
      prev.map((ent) => {
        if (ent.id === selectedEntityIdForAttr) {
          if (editingAttrIndex !== null) {
            const updatedAttrs = [...ent.attributes];
            updatedAttrs[editingAttrIndex] = newAttr;
            return { ...ent, attributes: updatedAttrs };
          } else {
            return { ...ent, attributes: [...ent.attributes, newAttr] };
          }
        }
        return ent;
      })
    );

    setIsAttrModalOpen(false);
  };

  const handleDeleteAttribute = (entId: string, attrIndex: number) => {
    setEntities((prev) =>
      prev.map((ent) => {
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

  // Add / Edit Relationship Submit
  const handleOpenAddRelationship = () => {
    if (entities.length < 2) return;
    setEditingRelId(null);
    setRelSourceId(entities[0].id);
    setRelTargetId(entities[1].id);
    setRelCardinality('1:N');
    setIsRelModalOpen(true);
  };

  const handleOpenEditRelationship = (rel: RelationshipDefinition) => {
    setEditingRelId(rel.id);
    setRelSourceId(rel.sourceEntityId);
    setRelTargetId(rel.targetEntityId);
    setRelCardinality(rel.cardinality);
    setIsRelModalOpen(true);
  };

  const handleRelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relSourceId || !relTargetId || relSourceId === relTargetId) {
      alert('Selecciona dos entidades distintas para relacionar');
      return;
    }

    if (editingRelId) {
      setRelationships((prev) =>
        prev.map((r) =>
          r.id === editingRelId
            ? { ...r, sourceEntityId: relSourceId, targetEntityId: relTargetId, cardinality: relCardinality }
            : r
        )
      );
    } else {
      const newRel: RelationshipDefinition = {
        id: `rel_${Date.now()}`,
        sourceEntityId: relSourceId,
        targetEntityId: relTargetId,
        cardinality: relCardinality,
      };
      setRelationships([...relationships, newRel]);
    }

    setIsRelModalOpen(false);
  };

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
    <div className="space-y-4 my-6 select-none">
      {/* Block Header */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#0f1f33] dark:to-[#141d2e] border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-[#0066CC] text-white shadow-sm shrink-0">
              <Database className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066CC] dark:text-[#4D94FF] block truncate">
                Lienzo de Modelado ER (Data Modeler)
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1A1A1A] dark:text-white leading-tight truncate">
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

      {/* Responsive Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddEntity}
            leftIcon={<Plus className="w-4 h-4" />}
            className="whitespace-nowrap"
          >
            Añadir Entidad (Tabla)
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={entities.length < 2}
            onClick={handleOpenAddRelationship}
            leftIcon={<LinkIcon className="w-4 h-4" />}
            className="whitespace-nowrap"
          >
            Crear Relación
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-gray-500" />}
            title="Reiniciar modelo"
            className="whitespace-nowrap"
          >
            Reiniciar
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {block.hint && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              leftIcon={<HelpCircle className="w-4 h-4 text-amber-500" />}
              className="whitespace-nowrap"
            >
              {showHint ? 'Ocultar Pista' : 'Pista'}
            </Button>
          )}

          <Button
            variant="success"
            size="sm"
            onClick={handleValidateModel}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            className="whitespace-nowrap"
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
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[520px] bg-slate-50 dark:bg-[#0c0c0c] border-2 border-dashed border-[#E0E0E0] dark:border-[#2D2D2D] rounded-2xl overflow-hidden touch-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #88888825 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* SVG Connectors with Crow's Foot Notation (Oracle Data Modeler style) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {relationships.map((rel) => {
            const source = entities.find((e) => e.id === rel.sourceEntityId);
            const target = entities.find((e) => e.id === rel.targetEntityId);
            if (!source || !target) return null;

            const sX = (source.position?.x ?? 30) + 110;
            const sY = (source.position?.y ?? 30) + 70;
            const tX = (target.position?.x ?? 240) + 110;
            const tY = (target.position?.y ?? 30) + 70;

            const midX = (sX + tX) / 2;
            const midY = (sY + tY) / 2;

            // Angle for crow's foot prongs calculation
            const angle = Math.atan2(tY - sY, tX - sX);
            const prongLength = 14;

            return (
              <g key={rel.id}>
                {/* Main line */}
                <line
                  x1={sX}
                  y1={sY}
                  x2={tX}
                  y2={tY}
                  stroke="#0066CC"
                  strokeWidth="2.5"
                />

                {/* Crow's foot notation (Patas de gallo) at target if Many (1:N or N:M) */}
                {(rel.cardinality === '1:N' || rel.cardinality === 'N:M') && (
                  <g>
                    {/* 3 prongs radiating towards target entity */}
                    <line
                      x1={tX}
                      y1={tY}
                      x2={tX - Math.cos(angle - 0.5) * prongLength}
                      y2={tY - Math.sin(angle - 0.5) * prongLength}
                      stroke="#0066CC"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={tX}
                      y1={tY}
                      x2={tX - Math.cos(angle + 0.5) * prongLength}
                      y2={tY - Math.sin(angle + 0.5) * prongLength}
                      stroke="#0066CC"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={tX}
                      y1={tY}
                      x2={tX - Math.cos(angle) * prongLength}
                      y2={tY - Math.sin(angle) * prongLength}
                      stroke="#0066CC"
                      strokeWidth="2.5"
                    />
                  </g>
                )}

                {/* Crow's foot at source if N:M */}
                {rel.cardinality === 'N:M' && (
                  <g>
                    <line
                      x1={sX}
                      y1={sY}
                      x2={sX + Math.cos(angle - 0.5) * prongLength}
                      y2={sY + Math.sin(angle - 0.5) * prongLength}
                      stroke="#0066CC"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={sX}
                      y1={sY}
                      x2={sX + Math.cos(angle + 0.5) * prongLength}
                      y2={sY + Math.sin(angle + 0.5) * prongLength}
                      stroke="#0066CC"
                      strokeWidth="2.5"
                    />
                  </g>
                )}

                {/* Perpendicular tick mark at source for '1' */}
                {rel.cardinality === '1:N' && (
                  <circle cx={sX} cy={sY} r="4" fill="#0066CC" />
                )}

                {/* Central Clickable Cardinality Badge */}
                <g
                  className="cursor-pointer pointer-events-auto"
                  onClick={() => handleOpenEditRelationship(rel)}
                >
                  <rect
                    x={midX - 18}
                    y={midY - 10}
                    width="36"
                    height="20"
                    rx="6"
                    fill="#0066CC"
                    className="hover:fill-[#0052A3] transition-colors shadow-md"
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
              </g>
            );
          })}
        </svg>

        {/* Entity Cards */}
        {entities.map((entity) => {
          const posX = entity.position?.x ?? 30;
          const posY = entity.position?.y ?? 30;

          return (
            <div
              key={entity.id}
              style={{ transform: `translate(${posX}px, ${posY}px)` }}
              className="absolute w-56 bg-white dark:bg-[#181818] border-2 border-[#0066CC] dark:border-[#4D94FF] rounded-xl shadow-lg z-10 transition-shadow hover:shadow-xl"
            >
              {/* Entity Table Header (Draggable via Mouse & Touch) */}
              <div
                onMouseDown={(e) => handleMouseDown(e, entity)}
                onTouchStart={(e) => handleTouchStart(e, entity)}
                className="p-2.5 bg-[#0066CC] dark:bg-[#1a4a80] text-white rounded-t-[10px] flex items-center justify-between cursor-move touch-none"
              >
                <span className="font-bold text-xs truncate max-w-[130px] tracking-wide">
                  {entity.name}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditEntity(entity)}
                    className="p-1 hover:bg-white/20 rounded transition text-white"
                    title="Editar entidad y notas"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEntity(entity.id)}
                    className="p-1 hover:bg-white/20 rounded transition text-white"
                    title="Eliminar entidad"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Entity Description / Notes Banner if available */}
              {entity.notes && (
                <div className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/40 text-[10px] text-amber-800 dark:text-amber-300 italic truncate flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{entity.notes}</span>
                </div>
              )}

              {/* Attributes / Columns List */}
              <div className="p-2 space-y-1 text-xs max-h-44 overflow-y-auto">
                {entity.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1 bg-gray-50 dark:bg-[#202020] rounded border border-[#E0E0E0] dark:border-[#2D2D2D] hover:border-[#0066CC] transition-colors"
                  >
                    {/* Clickable attribute to edit */}
                    <div
                      onClick={() => handleOpenEditAttr(entity.id, attr, idx)}
                      className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer"
                    >
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
                        title="Eliminar atributo"
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
                  onClick={() => handleOpenAddAttr(entity.id)}
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
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-black/90 backdrop-blur-md p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#2D2D2D] z-20 text-[11px] space-y-1 max-w-[220px]">
            <span className="font-bold text-gray-700 dark:text-gray-300 block text-[10px] uppercase">
              Relaciones ({relationships.length}):
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {relationships.map((rel) => {
                const s = entities.find((e) => e.id === rel.sourceEntityId)?.name || 'E1';
                const t = entities.find((e) => e.id === rel.targetEntityId)?.name || 'E2';
                return (
                  <div key={rel.id} className="flex items-center justify-between gap-2 text-gray-600 dark:text-gray-400">
                    <span
                      onClick={() => handleOpenEditRelationship(rel)}
                      className="truncate cursor-pointer hover:text-[#0066CC] font-mono text-[10px]"
                    >
                      {s} ⟷ {t} ({rel.cardinality})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRelationship(rel.id)}
                      className="text-rose-500 hover:underline p-0.5 font-bold"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
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

      {/* Modal: Añadir / Editar Entidad */}
      <Modal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        title={editingEntityId ? 'Editar Entidad (Tabla)' : 'Nueva Entidad (Tabla)'}
      >
        <form onSubmit={handleEntitySubmit} className="space-y-4">
          <Input
            label="Nombre de la Entidad / Tabla"
            value={entityFormName}
            onChange={(e) => setEntityFormName(e.target.value)}
            placeholder="Ej. Estudiante, Libro, Factura"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Notas / Descripción de la Tabla (Opcional)
            </label>
            <textarea
              value={entityFormNotes}
              onChange={(e) => setEntityFormNotes(e.target.value)}
              placeholder="Notas de modelado, reglas de negocio o comentarios..."
              rows={3}
              className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-xl text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsEntityModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingEntityId ? 'Actualizar Entidad' : 'Crear Entidad'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Añadir / Editar Atributo (Columna) */}
      <Modal
        isOpen={isAttrModalOpen}
        onClose={() => setIsAttrModalOpen(false)}
        title={editingAttrIndex !== null ? 'Editar Atributo (Columna)' : 'Añadir Atributo (Columna)'}
      >
        <form onSubmit={handleAttrSubmit} className="space-y-4">
          <Input
            label="Nombre del Atributo"
            value={attrFormName}
            onChange={(e) => setAttrFormName(e.target.value)}
            placeholder="Ej. email, fecha_prestamo, total"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white mb-1">
              Tipo de Dato SQL
            </label>
            <select
              value={attrFormType}
              onChange={(e) => setAttrFormType(e.target.value)}
              className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            >
              <option value="INTEGER">INTEGER (Entero)</option>
              <option value="VARCHAR(100)">VARCHAR(100) (Texto corto)</option>
              <option value="VARCHAR(20)">VARCHAR(20) (Identificador / Código)</option>
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
                checked={attrFormIsPk}
                onChange={(e) => setAttrFormIsPk(e.target.checked)}
                className="w-4 h-4 text-[#0066CC] rounded"
              />
              🔑 Clave Primaria (PK)
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={attrFormIsFk}
                onChange={(e) => setAttrFormIsFk(e.target.checked)}
                className="w-4 h-4 text-[#0066CC] rounded"
              />
              🔗 Clave Foránea (FK)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAttrModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingAttrIndex !== null ? 'Actualizar Atributo' : 'Añadir Atributo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Crear / Editar Relación */}
      <Modal
        isOpen={isRelModalOpen}
        onClose={() => setIsRelModalOpen(false)}
        title={editingRelId ? 'Editar Relación' : 'Crear Relación entre Entidades'}
      >
        <form onSubmit={handleRelSubmit} className="space-y-4">
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
              Cardinalidad (Notación Crow's Foot)
            </label>
            <select
              value={relCardinality}
              onChange={(e) => setRelCardinality(e.target.value as any)}
              className="w-full h-11 px-3 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2D2D2D] rounded-lg text-xs text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#0066CC]"
            >
              <option value="1:N">1:N (Uno a Muchos — Pata de gallo al destino)</option>
              <option value="1:1">1:1 (Uno a Uno)</option>
              <option value="N:M">N:M (Muchos a Muchos — Patas de gallo en ambos lados)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsRelModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingRelId ? 'Actualizar Relación' : 'Establecer Relación'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
