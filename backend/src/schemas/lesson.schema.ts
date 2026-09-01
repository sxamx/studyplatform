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
  options: z.array(QuestionChoiceOptionSchema)
    .min(2, 'Must have at least 2 options')
    .max(6, 'Cannot exceed 6 options')
    .refine(opts => opts.filter(o => o.isCorrect).length === 1, {
      message: 'Exactly one option must be marked as correct (isCorrect: true)',
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

// 9. Info Block
export const InfoBlockSchema = z.object({
  type: z.literal('info'),
  id: z.string().min(1),
  level: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  title: z.string().optional(),
  message: z.string().min(1),
});

// 10. Database Modeler (ER Diagram Canvas) Block
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

// Discriminated Union of all 10 Blocks
export const BlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  HeadingBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  QuestionChoiceBlockSchema,
  QuestionFreeBlockSchema,
  QuizBlockSchema,
  InfoBlockSchema,
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
