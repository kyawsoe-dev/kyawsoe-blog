import { defineCollection, z } from 'astro:content';

// Define schema for docs content (this handles all content in src/content/docs/* including blog, courses, etc.)
const docs = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date().optional(), // For blog posts and courses
      author: z.string().optional(), // For blog posts and courses
      heroImage: image().optional(), // For blog posts and courses
      tags: z.array(z.string()).optional().default([]),
      category: z.string().optional(),
      technology: z.string().optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      course: z.string().optional(),
      lessonNumber: z.number().optional(),
      draft: z.boolean().optional().default(false),
      head: z.array(z.object({
        tag: z.string(),
        attrs: z.record(z.string()).optional(),
        content: z.string().optional(),
      })).optional(),
    }),
});

export const collections = {
  docs,
};

