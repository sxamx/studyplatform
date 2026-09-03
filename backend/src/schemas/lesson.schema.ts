import { z } from 'zod';

export const SUPPORTED_LANGUAGES = [
  'java', 'python', 'javascript', 'typescript', 'sql',
  'c', 'cpp', 'csharp', 'html', 'css', 'json', 'yaml',
  'xml', 'bash', 'rust', 'go'
] as const;

// 1. Text Block
export const TextBlockSchema = z.object({
  type: z.literal('text'),
  id: z.string().min(1),
  content: z.string().max(10000, 'Content must be 10,000 characters or less'),
});

// 2. Heading Block
export const HeadingBlockSchema = z.object({
  type: z.literal('heading'),
  id: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  content: z.string().min(1),
});

// 3. Code Block
export const CodeBlockSchema = z.object({
  type: z.literal('code'),
  id: z.string().min(1),
  language: z.string().default('java'),
  code: z.string().max(3000, 'Code must be 3,000 characters or less'),
  copyable: z.boolean().default(true),
});

// 4. Image Block
export const ImageBlockSchema = z.object({
  type: z.literal('image'),
  id: z.string().min(1),
  url: z.string().url('Must be a valid image URL'),
  alt: z.string().min(1, 'Alt text is required for accessibility'),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// 5. Video Block
export const VideoBlockSchema = z.object({
  type: z.literal('video'),
  id: z.string().min(1),
  url: z.string().url('Must be a valid video URL'),
  title: z.string().min(1),
  duration: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

// 6. Question Choice Option & Block
export const QuestionChoiceOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const QuestionChoiceBlockSchema = z.object({
  type: z.literal('question_choice'),
  id: z.string().min(1),
  question: z.string().min(1),
  multiple: z.boolean().optional().default(false),
  options: z.array(QuestionChoiceOptionSchema)
    .min(2, 'Must have at least 2 options')
    .max(8, 'Cannot exceed 8 options')
    .refine(opts => opts.some(o => o.isCorrect), {
      message: 'At least one option must be marked as correct (isCorrect: true)',
    }),
  explanation: z.string().min(1, 'Explanation is required'),
  required: z.boolean().default(true),
});

// 7. Question Free Block
export const QuestionFreeBlockSchema = z.object({
  type: z.literal('question_free'),
  id: z.string().min(1),
  question: z.string().min(1),
  expectedAnswer: z.string().min(1),
  maxLength: z.number().default(500),
  language: z.string().optional(),
  hint: z.string().optional(),
  required: z.boolean().default(true),
});

// 8. Quiz Question & Block
export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.literal('choice'),
  question: z.string().min(1),
  options: z.array(QuestionChoiceOptionSchema).min(2).max(6),
  explanation: z.string().optional(),
});

export const QuizBlockSchema = z.object({
  type: z.literal('quiz'),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema).min(1, 'Quiz must have at least 1 question'),
  passingScore: z.number().min(0).max(100).default(70),
  required: z.boolean().default(true),
});

// 9. Info / Callout Block
export const InfoBlockSchema = z.object({
  type: z.literal('info'),
  id: z.string().min(1),
  level: z.enum(['info', 'warning', 'success', 'error', 'tip', 'note', 'danger']).default('info'),
  title: z.string().optional(),
  message: z.string().min(1),
});

// 10. Table Block (Freeform N-columns / N-rows)
export const TableBlockSchema = z.object({
  type: z.literal('table'),
  id: z.string().min(1),
  title: z.string().optional(),
  headers: z.array(z.string()).min(1, 'Table must have at least 1 column header'),
  rows: z.array(z.array(z.string())).min(1, 'Table must have at least 1 row'),
});

// 11. Diagram Block (Mermaid.js vector diagrams)
export const DiagramBlockSchema = z.object({
  type: z.literal('diagram'),
  id: z.string().min(1),
  title: z.string().optional(),
  syntax: z.string().min(1, 'Mermaid syntax is required'),
  caption: z.string().optional(),
});

// 12. Math Formula Block (LaTeX / KaTeX)
export const MathBlockSchema = z.object({
  type: z.literal('math'),
  id: z.string().min(1),
  expression: z.string().min(1, 'LaTeX expression is required'),
  title: z.string().optional(),
  inline: z.boolean().optional().default(false),
  explanation: z.string().optional(),
});

// 13. Tabs Block (Notion/VS Code style interactive code/view tabs)
export const TabItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  content: z.string().min(1),
  language: z.string().optional(),
});

export const TabsBlockSchema = z.object({
  type: z.literal('tabs'),
  id: z.string().min(1),
  title: z.string().optional(),
  tabs: z.array(TabItemSchema).min(1, 'Must contain at least 1 tab'),
});

// 14. Accordion Block (Collapsible Hint/Details)
export const AccordionBlockSchema = z.object({
  type: z.literal('accordion'),
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  defaultOpen: z.boolean().optional().default(false),
});

// 15. Stepper Block (Step-by-step numbered guide)
export const StepItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  code: z.string().optional(),
  language: z.string().optional(),
});

export const StepperBlockSchema = z.object({
  type: z.literal('stepper'),
  id: z.string().min(1),
  title: z.string().optional(),
  steps: z.array(StepItemSchema).min(1, 'Must contain at least 1 step'),
});

// 16. Divider Block (Visual section separator)
export const DividerBlockSchema = z.object({
  type: z.literal('divider'),
  id: z.string().min(1),
  label: z.string().optional(),
});

// 17. Resource Block (Downloadable files / attachments)
export const ResourceBlockSchema = z.object({
  type: z.literal('resource'),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().min(1),
  fileType: z.string().optional().default('file'),
  fileSize: z.string().optional(),
});

// 18. Database Modeler (ER Diagram Canvas) Block
export const EntityAttributeSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1).default('VARCHAR(100)'),
  isPk: z.boolean().optional(),
  isFk: z.boolean().optional(),
  isNullable: z.boolean().optional(),
});

export const EntityDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  notes: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  attributes: z.array(EntityAttributeSchema).default([]),
});

export const RelationshipDefinitionSchema = z.object({
  id: z.string().min(1),
  sourceEntityId: z.string().min(1),
  targetEntityId: z.string().min(1),
  cardinality: z.enum(['1:1', '1:N', 'N:M']),
  label: z.string().optional(),
});

export const ExpectedEntitySchema = z.object({
  name: z.string().min(1),
  attributes: z.array(z.object({
    name: z.string().min(1),
    isPk: z.boolean().optional(),
    isFk: z.boolean().optional(),
  })).optional(),
});

export const ExpectedRelationshipSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  cardinality: z.enum(['1:1', '1:N', 'N:M']),
});

export const DatabaseModelerBlockSchema = z.object({
  type: z.literal('database_modeler'),
  id: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().min(1),
  scenario: z.string().optional(),
  initialEntities: z.array(EntityDefinitionSchema).optional(),
  expectedModel: z.object({
    entities: z.array(ExpectedEntitySchema).optional(),
    relationships: z.array(ExpectedRelationshipSchema).optional(),
  }).optional(),
  hint: z.string().optional(),
  required: z.boolean().default(true),
});

// 19. Document Block
export const DocumentBlockSchema = z.object({
  type: z.literal('document'),
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().min(1),
  description: z.string().optional(),
  fileSize: z.string().optional(),
  fileType: z.enum(['pdf', 'doc', 'sheet', 'slide', 'archive', 'link']).optional().default('pdf'),
  downloadable: z.boolean().optional().default(true),
});

// Discriminated Union of all Blocks
export const BlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  HeadingBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  DocumentBlockSchema,
  QuestionChoiceBlockSchema,
  QuestionFreeBlockSchema,
  QuizBlockSchema,
  InfoBlockSchema,
  TableBlockSchema,
  DiagramBlockSchema,
  MathBlockSchema,
  TabsBlockSchema,
  AccordionBlockSchema,
  StepperBlockSchema,
  DividerBlockSchema,
  ResourceBlockSchema,
  DatabaseModelerBlockSchema,
]);

// Full Lesson Payload Schema
export const LessonJsonSchema = z.object({
  version: z.literal('1.0'),
  lesson: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    order: z.number().optional(),
    estimatedMinutes: z.number().optional().default(15),
    blocks: z.array(BlockSchema)
      .min(1, 'Lesson must contain at least one block')
      .refine(blocks => {
        const ids = blocks.map(b => b.id);
        return new Set(ids).size === ids.length;
      }, {
        message: 'All block IDs must be unique within the lesson',
      }),
  }),
});

export type Block = z.infer<typeof BlockSchema>;
export type LessonPayload = z.infer<typeof LessonJsonSchema>;
