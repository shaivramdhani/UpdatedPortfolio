import { defineCollection, z } from "astro:content";

const projectLinksSchema = z
  .object({
    github: z.string().optional(),
    demo: z.string().optional(),
    article: z.string().optional(),
    resume: z.string().optional()
  })
  .optional();

const linkSchema = z.object({
  label: z.string(),
  href: z.string()
});

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    date: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    thumbnail: z.string(),
    heroImage: z.string().optional(),
    links: projectLinksSchema
  })
});

const experience = defineCollection({
  schema: z.object({
    organization: z.string(),
    title: z.string(),
    timeframe: z.string(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    summary: z.string().optional(),
    links: z.array(linkSchema).optional()
  })
});

export const collections = { projects, experience };
