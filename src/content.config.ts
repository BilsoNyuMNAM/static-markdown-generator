import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
    schema: z
      .object({
        title: z.string(),
        description: z.string().optional().default(''),
        date: z.string().or(z.date()).optional(),
        year: z.string().or(z.number()).optional().default('2026'),
        type: z.string().optional().default('Notes'),
        // Series & Pagination fields
        series: z.string().optional(),
        order: z.number().optional().default(1),
        // Tags
        tags: z.array(z.string()).optional().default([]),
      })
      .passthrough(),
  }),
};
