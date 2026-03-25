# AGENTS.md

## Project goal
This repository is a personal portfolio website for Shaiv Ramdhani.
The primary goal is hirability.
The site should make a recruiter or hiring manager quickly understand:
- who I am professionally
- what kinds of engineering projects I work on
- what I personally contributed
- why I would be valuable on a team

## Product priorities
Optimize for:
1. clarity
2. credibility
3. maintainability
4. speed
5. clean responsive design

Do not optimize for flashy animations, novelty, or unnecessary complexity.

## Design direction
The visual style should feel:
- technical
- polished
- minimal
- modern
- confident

Avoid:
- overly artistic layouts
- excessive motion
- clutter
- generic startup-looking gradients everywhere
- heavy text blocks

## Content architecture
The site must be content-driven.
Projects and experiences must be stored as structured content files, not hardcoded into page components.

Each project should support:
- title
- short summary
- role
- date or timeframe
- tags
- tools / technologies
- featured flag
- thumbnail / hero image
- optional links
- body content

Each experience entry should support:
- organization
- title
- timeframe
- short summary
- bullet points
- optional links

## Code requirements
Prefer simple, readable structure.
Use reusable components.
Use strong typing where applicable.
Do not add unnecessary dependencies.
Do not add a CMS unless explicitly asked.
Document how to add a new project and a new experience entry in the README.

## Quality bar
Before finishing:
- run the build
- run lint if configured
- make sure the site is responsive
- ensure placeholder content is clearly marked
- do not leave dead code or unused scaffolding