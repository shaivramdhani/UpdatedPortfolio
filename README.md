# Shaiv Portfolio

A lightweight, content-first portfolio built with Astro, TypeScript, and Tailwind CSS.

## Why This Stack

- Astro keeps the site fast and simple for a mostly static portfolio.
- TypeScript gives the content schemas and site config a clear typed shape.
- Tailwind keeps styling local and maintainable without building a large component framework.

## Structure

```text
src/
  components/
  content/
    experience/
    projects/
    config.ts
  data/
    site.ts
  layouts/
  pages/
  styles/
public/
EXAMPLE_PROJECT.md
EXAMPLE_EXPERIENCE.md
```

## Content Model

- Projects live in `src/content/projects/` as Markdown files with frontmatter plus Markdown body content.
- Experience entries live in `src/content/experience/` as Markdown files with frontmatter plus Markdown body content.
- Collection schemas are defined in `src/content/config.ts`.
- Site-wide profile and navigation data lives in `src/data/site.ts`.

This keeps the pages content-driven and makes new entries easy to add without touching page components.

## Add A New Project

1. Create a new Markdown file in `src/content/projects/`, for example `src/content/projects/new-platform.md`.
2. Copy the shape from `EXAMPLE_PROJECT.md`.
3. Add a thumbnail or hero image to `public/`.
4. Write the long-form project story in Markdown under the frontmatter.

Example:

```md
---
title: "New Platform"
summary: "Short summary of the project."
role: "Full-stack engineering"
date: "2026-03"
featured: true
tags: ["Web", "Systems"]
tools: ["Astro", "TypeScript", "Tailwind"]
thumbnail: "/images/projects/new-platform/cover.webp"
links:
  github: "https://github.com/example/repo"
  demo: "https://example.com"
---

## Overview

Describe the project clearly.

## My contribution

Focus on what you personally owned and delivered.
```

## Add A New Experience Entry

1. Create a new Markdown file in `src/content/experience/`, for example `src/content/experience/new-role.md`.
2. Copy the shape from `EXAMPLE_EXPERIENCE.md`.
3. Keep the frontmatter concise and put bullet points in the Markdown body.

Example:

```md
---
organization: "New Company"
title: "Software Engineer"
timeframe: "2026"
location: "Vancouver, BC"
featured: true
summary: "Optional one-line summary."
---

- Shipped a user-facing feature from design through production
- Improved reliability, tooling, or team velocity in a concrete way
```

## Update Site-Wide Info

Edit `src/data/site.ts` to update:

- name, title, headline, and summary
- location, email, navigation, and social links
- SEO and resume metadata

## Add Or Replace Resume

The contact page reads resume data from `src/data/site.ts`:

- `resume.href`
- `resume.label`

Current placeholder file:

- `public/resume/shaiv-ramdhani-resume-placeholder.txt`

To switch to your real resume PDF:

1. Add your file to `public/resume/shaiv-ramdhani-resume.pdf`.
2. Edit `src/data/site.ts` and set `resume.href` to `"/resume/shaiv-ramdhani-resume.pdf"`.
3. Update `resume.label` to `Download Resume (PDF)`.

## Development

```bash
npm install
npm run dev
```

Verification commands:

```bash
npm run lint
npm run check
npm run build
```

## Notes

- `EXAMPLE_PROJECT.md` and `EXAMPLE_EXPERIENCE.md` are templates for the supported authoring format.
- The current sample entries are intentionally marked as placeholder content.
- The design favors clarity, credibility, maintainability, and responsive performance over decorative effects.
