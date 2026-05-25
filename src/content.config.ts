import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    keyword: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    // Pillar/cluster interlinking. Posts in the same `cluster` auto-link to each other:
    // the one with isPillar:true is the hub; the rest link up to it, it lists them all.
    cluster: z.string().optional(),
    isPillar: z.boolean().default(false),
  }),
});

export const collections = { blog };
