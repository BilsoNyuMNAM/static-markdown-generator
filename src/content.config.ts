import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
    schema: z
      .object({
        title: z.string().optional().default('Untitled Note'),
        description: z.string().optional().default(''),
        date: z.string().or(z.date()).optional(),
        year: z.string().or(z.number()).optional().default('2026'),
        type: z.string().optional().default('Notes'),
        // Series & Pagination fields
        series: z.string().optional(),
        order: z.number().or(z.string().transform((v) => Number(v) || 1)).optional().default(1),
        // Tags: accepts [tag1, tag2] or "tag1, tag2" or single "tag"
        tags: z
          .union([
            z.array(z.string()),
            z.string().transform((s) => s.split(',').map((t) => t.trim())),
          ])
          .optional()
          .default([]),
      })
      .passthrough(),
  }),
};
