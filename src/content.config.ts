import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
    schema: z
      .object({
        title: z.string().nullable().optional().default('Untitled Note'),
        description: z
          .string()
          .nullable()
          .optional()
          .transform((v) => v ?? '')
          .default(''),
        date: z.string().or(z.date()).nullable().optional(),
        year: z.string().or(z.number()).nullable().optional().default('2026'),
        type: z
          .string()
          .nullable()
          .optional()
          .transform((v) => v ?? 'Notes')
          .default('Notes'),
        // Series & Pagination fields
        series: z.string().nullable().optional(),
        order: z
          .number()
          .or(z.string().transform((v) => Number(v) || 1))
          .nullable()
          .optional()
          .default(1),
        // Tags: accepts [tag1, tag2] or "tag1, tag2" or single "tag"
        tags: z
          .union([
            z.array(z.string()),
            z.string().transform((s) => s.split(',').map((t) => t.trim())),
          ])
          .nullable()
          .optional()
          .transform((v) => v ?? [])
          .default([]),
      })
      .passthrough(),
  }),
};
