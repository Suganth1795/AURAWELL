import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

export const RESPONSE_TYPES = [
  'single_choice',
  'multi_choice',
  'rating',
  'boolean',
  'short_text',
] as const;

export type QuestionResponseType = (typeof RESPONSE_TYPES)[number];

/**
 * Question definitions are stored as data (not embedded in page components) so
 * the same assessment can serve different age groups with adapted wording.
 */
const optionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    emoji: { type: String },
    /** Weighted tags feed the deterministic interpretation engine. */
    tags: { type: [String], default: [] },
    weight: { type: Number, default: 1 },
  },
  { _id: false },
);

const ageVariantSchema = new Schema(
  {
    text: { type: String },
    helpText: { type: String },
    options: { type: [optionSchema], default: undefined },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    helpText: { type: String },
    responseType: { type: String, enum: RESPONSE_TYPES, required: true },
    required: { type: Boolean, default: true },
    maxSelections: { type: Number },
    /** Value substituted when an unanswered optional question is omitted. */
    default: { type: Schema.Types.Mixed, default: undefined },
    ratingMin: { type: Number, default: 1 },
    ratingMax: { type: Number, default: 5 },
    ratingLabels: { type: [String] },
    maxLength: { type: Number, default: 300 },
    options: { type: [optionSchema], default: [] },
    ageVariants: {
      child: { type: ageVariantSchema, default: undefined },
      teen: { type: ageVariantSchema, default: undefined },
      older_adult: { type: ageVariantSchema, default: undefined },
    },
    conditional: {
      type: new Schema(
        {
          dependsOnQuestionId: { type: String, required: true },
          showWhenOptionIds: { type: [String], default: [] },
        },
        { _id: false },
      ),
      default: undefined,
    },
    /** For rating questions: transparent mapping from value ranges to tags. */
    ratingRules: {
      type: [
        new Schema(
          {
            min: { type: Number },
            max: { type: Number },
            tags: { type: [String], default: [] },
            weight: { type: Number, default: 1 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    tags: { type: [String], default: [] },
  },
  { _id: false },
);

const interpretationRuleSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    allTags: { type: [String], default: [] },
    anyTags: { type: [String], default: [] },
    minWeight: { type: Number, default: 0 },
    priority: { type: Number, default: 100 },
    summary: { type: String, required: true },
    priorities: { type: [String], default: [] },
    recommend: {
      games: { type: [String], default: [] },
      habits: { type: [String], default: [] },
      journalPrompts: { type: [String], default: [] },
      activities: { type: [String], default: [] },
      reflections: { type: [String], default: [] },
    },
    planTemplate: {
      type: {
        days: [
          {
            day: { type: Number },
            focus: { type: String },
            actions: [{ type: String }],
          },
        ],
      },
      default: undefined,
    },
  },
  { _id: false },
);

const assessmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    version: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'emotional',
        'sleep',
        'focus',
        'habits',
        'activity',
        'social',
        'digital',
        'strengths',
        'lifestyle',
        'reflection',
      ],
      required: true,
    },
    ageGroups: {
      type: [{ type: String, enum: ['child', 'teen', 'adult', 'older_adult'] }],
      required: true,
    },
    estimatedMinutes: { type: Number, default: 5 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    intro: { type: String, required: true },
    outro: { type: String },
    disclaimer: {
      type: String,
      default:
        'These are project-developed wellness reflection questions, not a clinical diagnostic tool.',
    },
    questions: { type: [questionSchema], required: true },
    interpretationRules: { type: [interpretationRuleSchema], default: [] },
  },
  { timestamps: true },
);

assessmentSchema.index({ status: 1, category: 1 });

export type AssessmentDoc = HydratedDocument<InferSchemaType<typeof assessmentSchema>>;
export type AssessmentQuestion = InferSchemaType<typeof questionSchema>;
export type AssessmentDefinition = InferSchemaType<typeof assessmentSchema>;

export const Assessment = model('Assessment', assessmentSchema);
