# Evidence Quest: Multi-Framework Cyber Audit Simulator

## What changed
- Refactored to mission-based dynamic audit interview simulation with multi-select evidence, branching client responses, follow-up scoring, debrief cards, framework relevance, and fundamentals lessons.
- Added 18 domains with scalable structure (5 seed activities each).
- Added reusable framework mapping dictionary and sanitized assessment-observation template.

## Data structure
- `src/data/activities.json`: `domains[] -> activities[]` with mission schema.
- `src/data/frameworkMappings.json`: reusable mapping keys.
- `src/data/assessmentObservationTemplate.json`: helper for converting sanitized notes to missions.

## Add a new domain
1. Add a domain object in `src/data/activities.json` with unique `id`, `name`, and `activities` array.
2. Reuse mapping keys from `frameworkMappings.json` in each activity.

## Add a new activity
1. Create activity using current schema (`id`, `domain`, `missionName`, `scenarioType`, evidence options, debrief, fundamentals, mappings).
2. Include 5–7 evidence options with strong + weak/trap options and occasional unsafe/irrelevant options.
3. Provide unique `clientResponse` and `followUpChallenge` for each evidence option.

## Add framework mappings
- Extend `src/data/frameworkMappings.json` using only framework name, control ID, control/domain name, and short paraphrased relevance.
- Do not copy long official control text.

## Confidentiality and copyright safety rules
- Keep all scenarios fictional/sanitized.
- Never include real client names, system names, IDs, IPs, screenshots, or confidential details.
- Do not upload full framework text; use concise paraphrases only.

## Deployment (GitHub Pages)
- Build: `npm run build`
- Vite base path is automatically set in CI from repository name in `vite.config.js`.
