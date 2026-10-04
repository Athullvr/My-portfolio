import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      outcome: z.string(),
      order: z.number(),
      award: z.object({ rank: z.string(), event: z.string() }).optional(),
      timeframe: z.string(),
      role: z.string(),
      team: z.string(),
      repo: z.string().url(),
      demo: z.string().url().optional(),
      video: z.string().url().optional(),
      tldr: z.array(z.string()).length(3),
      stack: z.array(z.string()).min(1),
      card: z
        .object({
          summary: z.string().optional(),
          metric: z.object({ value: z.string(), label: z.string() }).optional(),
          metricTodo: z.string().optional(),
        })
        .default({}),
      photos: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
    }),
});

export const collections = { projects };
