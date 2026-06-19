# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Buttons
- **Styles**: Defined in `globals.css` under `@layer components`.
- **Primary**: `.btn-primary` (Accent background)
- **Secondary**: `.btn-secondary` (White background, border)
- **Dark**: `.btn-dark` (Darkest text background)
- **Ghost**: `.btn-ghost` (Transparent, hover background)
- **Interaction**: All buttons include `active:scale-[0.98]` for tactile feedback.

### Cards
- **Premium**: `.card-premium` (Surface background, standard border, 16px radius).

### Navbar
- **Path**: `app/components/Navbar.tsx`
- **Classes**: `w-full bg-surface border-b border-border-muted h-16 flex items-center`, `text-sm font-medium text-text-dark hover:text-accent`, `.btn-primary`, `w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold border border-accent/20 hover:bg-accent/20 transition-all`
- **Tokens**: `--color-text-darkest`, `--color-accent`, `--color-text-dark`, `--color-border-muted`, `--color-text-secondary`, `--color-error`

### Hero Section
- **Path**: `app/page.tsx`
- **Classes**: `text-[56px] md:text-[72px] font-bold text-text-darkest leading-[1.1] tracking-tight`, `text-lg md:text-xl text-text-secondary`, `.btn-dark`, `.btn-secondary`
- **Tokens**: `--color-text-darkest`, `--color-text-secondary`, `--color-border-muted`, `--color-text-primary`

### Feature Card (Hover/Focus)
- **Path**: `app/page.tsx`
- **Classes**: `p-6 border-l-2 border-transparent hover:border-accent transition-all`, `group-hover:text-accent`, `.card-premium`
- **Tokens**: `--color-accent`, `--color-border-muted`

### Testimonial
- **Path**: `app/page.tsx`
- **Classes**: `text-xs font-bold text-accent uppercase tracking-widest`, `text-2xl md:text-3xl font-medium text-text-darkest italic`
- **Tokens**: `--color-accent`, `--color-text-darkest`

### Login Page (Two-Pane)
- **Path**: `app/login/page.tsx`
- **Classes**: 
  - **Container**: `min-h-screen flex bg-background`
  - **Left Pane (Branding)**: `lg:flex lg:w-1/2 bg-accent p-12 text-accent-foreground`
  - **Right Pane (Auth)**: `w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-24 bg-surface`
  - **Buttons**: `w-full flex items-center justify-center gap-3 py-3 border border-border rounded-lg font-medium transition-all active:scale-[0.98]`
  - **Inputs**: `w-full px-4 py-3 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent`
- **Tokens**: `--color-accent`, `--color-accent-foreground`, `--color-background`, `--color-surface`, `--color-text-primary`, `--color-border`, `--radius-lg`

### Profile Page (Placeholder)
- **Path**: `app/profile/page.tsx`
- **Classes**: 
  - **Container**: `relative min-h-screen flex flex-col items-center`
  - **Card**: `.card-premium`, `p-8`
  - **Avatar**: `w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold border border-accent/20`
  - **Sign Out Button**: `btn-secondary px-6 py-2.5 rounded-lg font-semibold shadow-xs active:scale-[0.98] transition-all text-error hover:text-error-foreground hover:bg-error border-error/20`
- **Tokens**: `--color-accent`, `--color-text-darkest`, `--color-text-secondary`, `--color-border-muted`
