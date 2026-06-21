# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 6 — Tailoring & Application
**Last completed:** 27 Fix: Job Details Card Layout (Overflow)
**Next:** Feature 19 Resume Tailoring (Currently Out of Scope)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage (Fixed Design System drift: replaced hardcoded hex values and raw Tailwind colors with tokens)
- [x] 02 Auth ✓ (Fixed: SDK API, Two-Pane UI, PKCE Flow, Session Refresh, Cookie Persistence, Client-Side Fallback Sync, and Redirect to Home; Applied Design System tokens for colors and error states)
- [x] 03 Profile Placeholder & Sign Out ✓ (Added Profile page and fixed Navbar redundancy/styling; Applied Design System tokens for destructive actions)
- [x] 04 PostHog Initialization ✓ (Integrated PostHog for event tracking: login starts, success/failure, user identification, and sign-out events)
- [x] 05 Build Fix: Server-Only Code Isolation ✓ (Resolved "next/headers" import error by isolating server code and converting Navbar to Client Component)
- [x] 06 Fix Sign Out: Forced UI Refresh ✓ (Resolved broken logout state on profile page by implementing full window reload after session clear)
- [x] 07 Fix Profile Redirect Loop ✓ (Resolved "reset to homepage" issue by removing conflicting client-side redirect and ensuring proxy/middleware is handling auth correctly)
- [x] 08 Fix: Restore middleware.ts ✓ (Resolved runtime error "middleware.ts not found" by renaming proxy.ts to middleware.ts to satisfy framework/SDK expectations)
- [x] 09 Profile & Navbar Sign Out Placeholder ✓ (Improved navigation with user avatar and sign-out link in Navbar; ensured clear sign-out placeholder exists)
- [x] 10 Fix: Rename middleware.ts to proxy.ts ✓ (Resolved deprecation warning by adopting "proxy" convention while maintaining auth logic)
- [x] 11 Fix: Proxy Default Export ✓ (Resolved build error "Proxy is missing expected function export name" by changing the proxy export to a default export)
- [x] 12 Fix: Profile Blank Screen ✓ (Resolved blank page issue on /profile by ensuring UI structure renders during loading and adding user data fallbacks)
- [x] 13 Fix: Auth Flow Stabilization ✓ (Resolved inconsistent login/logout state by standardizing cookie names and making landing page buttons auth-aware)
- [x] 14 Fix: Client-Side Auth Sync ✓ (Resolved issue where profile page didn't show logout by explicitly syncing session to client SDK via setSession and adding diagnostic logs)
- [x] 15 Fix: Refresh Token Error ✓ (Resolved "No refresh token provided" browser errors by standardizing cookie names in both hyphenated and underscore formats, adding session verification in callback, and implementing cookie-based retries in Navbar/Profile)
- [x] 16 Fix: Auth Synchronization ✓ (Resolved client-side "logged out" state by standardizing cookies and improving proxy propagation)
- [x] 17 Fix: SDK API Mismatch ✓ (Resolved TypeError by removing non-existent onAuthStateChange and switching to setAccessToken)
- [x] 18 Fix: Refresh Token Error ✓ (Resolved "No refresh token provided" browser errors by priming client SDK with server-side session via AuthInitializer)
- [x] 19 UI/UX: Auth Flow Optimization ✓ (Restored Navbar "Start for free" button, consolidated Sign Out to Profile page, and set post-login redirect to homepage)
- [x] 20 UI/UX: Navbar Consistency ✓ (Fixed "Start for free" button to always show and removed initials from Navbar as requested)
- [x] 21 Database Schema & Storage ✓ (Created normalized tables per architecture.md and 'resumes' storage bucket)

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI ✓ (Built with CompletionIndicator, ResumeUpload, and multi-section ProfileForm using mock data per build plan principle; Note: Connected Accounts section removed per user request)
- [x] 06 Profile Save & Resume Upload (Database Wired) ✓ (Fixed "Size is required" upload error and enabled secure resume viewing via authenticated proxy route)
- [x] 07 Profile: Added Job Preferences & Reorganized UI ✓ (Added job titles, locations, and industries; aligned with DB schema and implemented DB-Storage auto-sync logic)
- [x] 08 AI Profile Extraction from Resume ✓ (Implemented GPT-4o powered structured extraction from PDF resumes; text-based parsing with pdf-parse; merged data into profile form for review; supported multiple education fields)
- [x] 09 Resume PDF Generation from Profile ✓ (Integrated @react-pdf/renderer; implemented GPT-4o synthesis for professional summary and work experience bullets; added server-side generation API and UI controls to view both uploaded and generated resumes; Fixed 401 Auth error, renderToBuffer import, Storage size issues, and missing database column)

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI ✓ (Built complete search and discovery interface at app/find-jobs/page.tsx with mock data; implemented search controls, success banner, filter bar, jobs table with color-coded match scores, and pagination; 100% Design System compliant)
- [x] 10 Adzuna Job Discovery ✓ (Created Adzuna API wrapper in lib/adzuna.ts, AI matching agent in agent/matcher.ts, and discovery coordinator in agent/adzuna.ts; implemented app/api/agent/find/route.ts to trigger search; updated app/find-jobs/page.tsx to use real data from InsForge DB)
- [x] 11 Filter + Sort + Pagination ✓ (Implemented client-side filtering by company/title and match score; added toggle-based sorting by score and date; implemented functional pagination with "Showing X to Y" status; aligned thresholds with lib/utils.ts)

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI ✓ (Created `app/find-jobs/[id]/page.tsx` with dynamic routing; implemented real data fetching, AI match reasoning, and skills gap UI; linked from jobs list; Added "Show More" toggle and "View Full Posting" link for truncated Adzuna descriptions)
- [x] 13 Company Research Agent ✓ (Implemented background research using Browserbase and Stagehand V3; added GPT-4o synthesis to fuse research with job/profile data; implemented "Live Research Log" with real-time log polling in the UI; added detailed Dossier rendering component; 100% build-stable)
- [x] 22 UI Refinement: Card Consistency ✓ (Applied standard card styling—border and background—to homepage features and testimonials; updated all Company Research Dossier sections to use consistent `bg-accent-muted` backgrounds and `border-accent-light/30` borders for visual cohesion)

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI ✓ (Built complete dashboard interface at app/dashboard/page.tsx with mock data; implemented stat cards with trend indicators, recent activity list with type-specific color coding, and responsive charts using recharts: Research Activity, Jobs Found Over Time, and Match Score Distribution; added incomplete profile banner and sticky Navbar integration; 100% Design System compliant)
- [x] 15 Stats Bar — Real Data ✓ (Wired four stat cards to real InsForge DB data for current user; implemented real-time fetching for Total Jobs Found, Avg. Match Rate, Companies Researched, and Jobs Found This Week; production build verified)
- [x] 16 Recent Activity — Real Data ✓ (Connected Recent Activity feed to real agent_runs and jobs tables; implemented human-readable time-ago timestamps; added loading skeleton states and empty state handling; filtered out non-human readable internal agent runs; verified with production build)
- [x] 18 Activity Page — Full List ✓ (Created full-page activity feed at app/activity/page.tsx; implemented combined fetching for job searches and research with limit of 100 entries; added back navigation to dashboard; verified design consistency)
- [x] 17 Analytics Charts — PostHog Data ✓ (Implemented server-side API route at /api/analytics using HogQL to query PostHog for real-time job discovery and research trends; wired Dashboard charts to live data with loading skeleton states; protected credentials via server-side execution; 100% Design System compliant; Fixed missing 'job_found' event captures in agents; Added explicit error handling for Personal API Keys and identified users on client-side)
- [x] 19 Live Progress Fix ✓ (Resolved issue where company research logs weren't showing in real-time by synchronizing runId between frontend and backend; implemented auto-scrolling log view; added granular agent state logging; ensured SDK compliance for database inserts)
- [x] 20 Remove Debug Overlay ✓ (Removed the development-only debug panel from the homepage that tracked SDK user and session tokens, as requested by the user for a cleaner front-end experience)
- [x] 21 Logo Visibility Fix ✓ (Restored proper logo visibility across the site by removing destructive CSS filters like `invert` and `brightness-0` that forced the high-quality purple/white logo to appear solid black or white; simplified logo containers to allow the original image design to shine through)
- [x] 22 UI Refinement: Navbar Icons & Sign Out ✓ (Added icons to the main navbar links—Dashboard, Find Jobs, Profile—and implemented a "Sign out" button with an icon next to the user profile avatar; improved navigation clarity and consistency with the design system)
- [x] 23 Multi-Country Search Support ✓ (Expanded job search capabilities to support 16 international markets including UK, Canada, Germany, India, and Australia; implemented country selector UI in the Find Jobs page; updated backend agent and API to respect selected country; modified database schema to track country-specific search history in agent_runs)
- [x] 24 Resilience: Handle Missing Company Data ✓ (Fixed a runtime TypeError by adding defensive coding to the Find Jobs page, Dashboard, and Activity Feed; added safety checks in job discovery, matching, and research agents to prevent crashes when company information is missing from APIs or the database)
- [x] 25 Connectivity: Reliable Agent Progress ✓ (Fixed 401 Unauthorized errors in long-running research tasks by implementing proper cookie handlers for token refreshing in the InsForge server client; synchronized agent client state with API routes to ensure persistent connectivity during browser automation)
- [x] 26 Bug Fix: Server Client Initialization ✓ (Fixed a runtime TypeError `cookies.get is not a function` by correcting the `createServerClient` signature and providing the missing `get` method in the cookie wrapper; ensured all database inserts in the Adzuna agent follow the required array format)
- [x] 27 Fix: "No Refresh Token Provided" Error ✓ (Resolved recurring auth issues by standardizing on underscore cookie names, implementing a robust fallback in the server client's cookie handler, and ensuring the client SDK is primed with both access and refresh tokens during initialization; improved auth state consistency between server and client)
- [x] 28 Fix: Auth Race Condition & Hook Stability ✓ (Resolved "useEffect changed size" error and persistent "No refresh token provided" warnings by moving SDK priming to the render phase of AuthInitializer; ensured the client SDK is primed before child components mount and standardized hook dependency arrays)
- [x] 29 Fix: Canonical Cookie Naming ✓ (Standardized on the SDK's hyphenated cookie naming convention to resolve "No refresh token provided" and persistent login loops; removed conflicting cleanup logic that deleted hyphenated cookies; ensured consistency between server-side updateSession and client-side SDK priming)
- [x] 30 Fix: SDK Type Compliance & Build Stability ✓ (Resolved TypeScript build error "getAll does not exist in type Pick<CookieStore, 'get'>" by aligning `lib/insforge-server.ts` and `proxy.ts` with actual SDK interfaces; updated `architecture.md` and `library-docs.md` to correct stale API patterns; verified stability with successful production build)
- [x] 31 Multi-Currency Salary Support ✓ (Implemented `formatSalary` utility with currency mapping and USD conversion for all 16 supported countries; updated Adzuna agent to use local currency symbols and provide approximate USD equivalents in the "Salary Est." field, resolving "N/A" and hardcoded "$" issues)
- [x] 32 AI-Powered Salary Estimation & Retroactive Fix ✓ (Created `salary-estimator` agent using GPT-4o to provide realistic salary ranges when Adzuna data is missing; retroactively updated all "N/A" salary records in the database using a service-level script; integrated estimation fallback into the main discovery pipeline)

### Phase 6 — Tailoring & Application

- [x] 24 Cover Letter Generation UI ✓ (Created `app/components/job-details/CoverLetterModal.tsx` and `app/components/job-details/CoverLetterPDF.tsx`; implemented interactive modal with log progress polling and professional PDF template; integrated into Job Details page)
- [x] 25 Cover Letter Generation Logic (AI) ✓ (Created `agent/cover_letter.ts` with GPT-4o synthesis; implemented `/api/agent/cover-letter` route with real-time log feedback; grounded output in company research and user skills)
- [x] 26 Cover Letter: Edit & Persistence ✓ (Added real-time editing capabilities to the cover letter modal with database persistence; implemented save/cancel states and visual feedback)
- [x] 27 Fix: Job Details Card Layout (Overflow) ✓ (Standardized info card layout with `min-w-0`, `truncate`, and `title` to prevent long content like salaries from breaking the UI; updated registry with new standards)

---

## Decisions Made During Build

- **SDK Client Selection**: Use `createBrowserClient` from `@insforge/sdk/ssr` for client-side authentication and database access, ensuring consistent session management across the application.
- **Database Access Pattern**: Standardized on `insforge.database.from('table_name')` for all CRUD operations (on both client and server) to ensure consistency across the application and align with the SDK's internal client structure. This resolved the "insforge.from is not a function" errors encountered during Phase 06.
- **Profile Lazy Initialization**: Implemented a "lazy initialization" pattern for user profiles. Used `.maybeSingle()` for fetching to handle new users gracefully, and `.upsert()` in Server Actions to ensure the profile record is created on the first save or upload. This resolves the `PGRST116` ("The result contains 0 rows") error.
- **Mock Data First Strategy**: Following the core principle in `build-plan.md`, the Profile UI was populated with a comprehensive mock dataset (Alex Rivera) to verify the design reference and completion logic before wiring real database operations. Now transitioning to real data in Phase 06.
- **Dynamic Profile Completion**: Calculated based on four core pillars: Name, Title, Skills, and Experience. This provides immediate visual feedback to the user about their profile status.
- **Sticky Profile Sidebar**: Implemented a `sticky` sidebar for the profile page that scrolls naturally with the main content. This avoids accessibility issues where components were cut off by restrictive `max-height` constraints, while still keeping the completion indicator and resume tools visible as the user fills out the form.
- **AI Resume Buttons Styling**: Updated the "Extract from Resume" and "Generate Resume" buttons to match the design reference (5.png), using the specific purple accent color, rounded-full shape, and a circular refresh icon.
- **Account Actions Styling**: Updated the "Sign Out" button to match the AI action button style for visual consistency across the profile sidebar.
- **Personal Information Section**: Restored the 'Personal Information' section in the Profile form to ensure all core user details (Name, Email, Phone, Location) are captured above the connected accounts.
- **Connected Accounts Section**: Added a new UI section to the Profile form for linking LinkedIn and GitHub accounts (Removed per user request).
- **Login Network Error Resolution**: Diagnosed and resolved the "google/github login error: Network request failed" by identifying that the InsForge SDK was defaulting to `http://localhost:7130` when `NEXT_PUBLIC_INSFORGE_URL` was missing in the browser. Hardcoded the production URL and Anon Key as fail-safes and reverted to the standard SDK redirect behavior (removing `skipBrowserRedirect: true`) for maximum reliability. Added `X-Client-Info` header to the SDK client for better traceability.
- **Secure Storage Proxy**: Implemented an authenticated proxy route (`/api/resume/view`) to bypass 401 errors when accessing private PDF storage objects directly from the browser.
- **Automatic DB-Storage Sync**: Integrated a `HEAD` request check in the profile loading flow to verify if the file path stored in the database still exists in storage. If the file is missing (manually deleted), the database is automatically updated to nullify the stale path, keeping the UI accurate.
- **Async Form Data Sync**: Resolved "stale form state" issues by adding a `useEffect` to `ProfileForm` that re-initializes form values whenever the async `profile` prop changes.
- **Activity Feed Cleanup**: Filtered out internal agent runs (e.g., "Research: [UUID]") from the dashboard activity feed to ensure only human-readable information is displayed. Increased fetch limits to 10 for both runs and jobs to ensure a full feed of 5 activities after filtering.
- **Dashboard Code Quality**: Refactored the dashboard component to eliminate `any` types, resolve variable shadowing, and move synchronous state updates in effects to separate hooks to satisfy strict linting rules.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
