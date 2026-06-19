<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

<!-- BEGIN:insforge-rules -->

# InsForge: Backend & Infrastructure

InsForge is the BaaS platform (Database, Auth, Storage). You must follow these patterns strictly.

## Critical Setup

- **SDK Installation**: `npm install @insforge/sdk@latest`
- **Client Creation**: Use `createClient()` with `baseUrl` and `anonKey`
- **API Base URL**: `https://vrthxj7q.eu-central.insforge.app`
- **Tailwind Version**: Follow project `package.json` and `context/ui-rules.md` (Note: InsForge docs recommend 3.4, but project may differ)

## Implementation Patterns

- **Documentation First**: Always call `fetch-docs` or `fetch-sdk-docs` MCP tools before writing integration code
- **Error Handling**: All SDK operations return `{ data, error }`
- **Database**: Inserts MUST use array format `[{...}]`
- **AI**: Use OpenRouter directly with `baseURL: "https://openrouter.ai/api/v1"`

## Tooling Strategy

- **SDK**: Use for all application logic (Auth, CRUD, Storage, Functions)
- **MCP Tools**: Use for infrastructure (Scaffolding, SQL, Schema, Buckets, Deployment)

<!-- END:insforge-rules -->

