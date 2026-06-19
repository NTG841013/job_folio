# Memory

## What was built
- **Foundation Phase (Phase 1)**:
  - **Homepage (Feature 01)**: Complete responsive landing page with Hero, Feature highlights, and CTA sections.
  - **Authentication (Feature 02)**: Implemented Two-Pane UI with Social Auth (Google/GitHub) via InsForge SDK. Fixed PKCE flow, session refresh, and cookie persistence.
  - **Profile Placeholder (Feature 03)**: Protected route displaying user information and functional Sign Out.
  - **Database Schema & Storage (Feature 21)**: Successfully established the core backend infrastructure. Created normalized PostgreSQL tables (`profiles`, `agent_runs`, `jobs`, `agent_logs`) as defined in `architecture.md`. Implemented strict Row Level Security (RLS) policies ensuring private data access (`auth.uid() = user_id`). Configured the `resumes` storage bucket for secure PDF management.
  - **Navbar & Auth UX (Feature 19-20)**: Finalized the navigation flow. The "Start for free" button is now permanently visible in the Navbar. Logout and user settings are centralized in the Profile page. Ensured all post-login redirects land on the homepage (`/`).
  - **PostHog Integration (Feature 18)**: Initialized PostHog with client-side provider. Implemented event tracking for `login_started`, `login_success`, `login_failed`, and `user_signout`. Added user identification via `posthog.identify()`.
  - **Sign Out Fix (Feature 06)**: Resolved an issue where the logout state was not correctly reflected in the UI. Implemented a full `window.location.href` reload after the `signOutAction` to ensure all client-side states (Navbar, cookies, PostHog) are fully reset.
  - **Profile Redirect Fix (Feature 07)**: Resolved the "reset to homepage" issue when clicking the profile page. Identified a conflict between server-side `proxy.ts` (middleware) and client-side `app/profile/page.tsx` redirect logic. Removed the aggressive client-side redirect to prevent the loop: `/profile` (client-side fail) -> `/login` (server-side auth success) -> `/`.
  - **Middleware Modernization**: Resolved the deprecation warning by renaming `middleware.ts` to `proxy.ts`. Fixed a subsequent build error "Proxy is missing expected function export name" by converting the `proxy` export to a `default` export. This aligns with Next.js 16.2.9 conventions while preserving the authentication and session management logic.
  - **Profile Blank Screen Fix (Feature 12)**: Resolved a critical issue where the profile page appeared as a blank white screen (seen in user screenshot). Updated `app/profile/page.tsx` to always render the `Navbar` and background gradients, even during loading states. Added a robust fallback UI for missing user data to prevent the component from returning `null`.
  - **Auth Flow Stabilization (Feature 13-18)**: Resolved persistent "No refresh token provided" browser errors and UI state mismatch. Implemented `AuthInitializer` to prime the client-side SDK with server-verified session data. Standardized on underscore-based cookie names (`insforge_access_token`, `insforge_refresh_token`) to align with the latest SDK.
  - **Navbar Enhancement (Feature 09)**: Improved the global navigation to include a user-specific section when authenticated. Replaced the generic "Start for free" button with a user avatar (linking to profile) and a "Sign Out" link, addressing the missing sign-out placeholder issue.
  - **Server Code Isolation (Build Fix)**: Resolved a critical build error caused by `next/headers` being imported in client contexts. Isolated `lib/insforge-server.ts` with `server-only`, converted `Navbar` to a Client Component, and ensured proper separation between client and server auth logic.
  - **UI System Alignment**: 100% Design System compliance across all components. Eliminated all hardcoded hex values and raw Tailwind colors in favor of semantic tokens.
- **UI Components**:
  - `app/components/Navbar.tsx`: Standardized navigation with auth state integration.
  - `app/globals.css`: Defined `.btn-primary`, `.btn-secondary`, `.btn-dark`, `.btn-ghost`, and `.card-premium` using Tailwind v4 `@layer components`.
  - `context/ui-registry.md`: Fully updated with all Phase 1 implementation patterns.

## Decisions made
- **Semantic Token Enforcement**: Strictly moved to CSS variables for all colors (e.g., `--color-accent`, `--color-surface`) to ensure theme consistency and avoid design system drift.
- **Two-Pane Auth Layout**: Adopted a high-converting two-pane layout for login, separating branding from functional auth forms.
- **Client/Server Auth Sync**: Implemented a robust auth sync strategy using InsForge SDK, combining server-side checks with client-side fallback to handle session persistence effectively.
- **Tailwind v4 Pattern**: Utilized `@layer components` for complex UI patterns while keeping utility classes for layout and spacing.

## Problems solved
- **Design System Drift**: Identified and fixed multiple instances of raw Tailwind colors (e.g., `bg-white`) and hardcoded hex codes by replacing them with system tokens.
- **Auth Flow Edge Cases**: Fixed PKCE and session refresh issues in the InsForge SDK integration to ensure stable social logins.
- **Navigation Redundancy**: Resolved duplicate navigation logic between home and profile pages by standardizing the `Navbar` component.

## Current state
- **Phase 1 (Foundation)**: Completed (Homepage, Auth, Profile Placeholder, PostHog, Database Schema, Storage).
- **Next Task**: Phase 2: Profile Page.
- **System Integrity**: All components are 100% aligned with `ui-tokens.md` and `ui-rules.md`.

## Missing context / Blockers
- **Assets**: Some placeholder images are referenced but not present in `public/` (skipped per user instruction for now).
- **External Links**: Footer and legal links are currently placeholders (`#`).