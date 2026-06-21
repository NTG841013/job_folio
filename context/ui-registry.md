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
- **Classes**: `w-full bg-surface border-b border-border-muted h-16 flex items-center`, `flex items-center gap-2 text-sm font-medium text-text-dark hover:text-accent`, `.btn-primary`, `w-9 h-9 rounded-full bg-accent-light flex items-center justify-center text-accent text-sm font-bold border border-accent/20 hover:bg-accent/10 transition-all`, `text-text-dark hover:text-error transition-colors flex items-center gap-2`
- **Tokens**: `--color-text-darkest`, `--color-accent`, `--color-text-dark`, `--color-border-muted`, `--color-text-secondary`, `--color-error`

### Hero Section
- **Path**: `app/page.tsx`
- **Classes**: `text-[56px] md:text-[72px] font-bold text-text-darkest leading-[1.1] tracking-tight`, `text-lg md:text-xl text-text-secondary`, `.btn-dark`, `.btn-secondary`
- **Tokens**: `--color-text-darkest`, `--color-text-secondary`, `--color-border-muted`, `--color-text-primary`

### Feature Card (Hover/Focus)
- **Path**: `app/page.tsx`
- **Classes**: `p-6 bg-surface border border-border rounded-xl shadow-sm hover:border-accent transition-all`, `group-hover:text-accent`, `.card-premium`
- **Tokens**: `--color-accent`, `--color-border`, `--color-surface`

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

### Profile Page (Complete)
- **Path**: `app/profile/page.tsx`, `app/components/profile/`
- **Classes**: 
  - **Layout**: `max-w-7xl mx-auto px-6 pt-12 flex flex-col lg:flex-row gap-8 items-start`
  - **Form Sections**: `card-premium space-y-8`, `border-b border-border-light pb-4`
  - **Section Headings**: `text-base font-bold text-text-darkest`
  - **Field Labels**: `text-xs font-bold text-text-slate-medium uppercase tracking-wider`
  - **Inputs/Selects**: `w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm`
  - **Badges**: `px-2 py-0.5 bg-accent-muted text-accent text-xs font-medium rounded-full uppercase tracking-wider`
  - **Progress Ring**: `w-24 h-24 -rotate-90`, `stroke-accent`, `stroke-border-light`
  - **Sticky Bar**: `fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-border p-4 flex justify-center z-50`
  - **Sticky Sidebar**: `lg:sticky lg:top-24 space-y-6 pb-24`
  - **Connected Account Card**: `flex items-center justify-between p-4 bg-surface border border-border rounded-xl`
  - **Job Preferences Section**: Multi-select style input for job titles, locations, and industries using `info-muted`, `success-muted`, and `accent-muted` backgrounds respectively. Includes secondary controls for remote preference, salary, and tone.
  - **Form Layout**: 2-column grid for basic info, 3-column grid for compact preferences, full-width for list-based and long-text fields.
  - **Resume View Buttons**: `inline-flex items-center gap-2 px-5 py-2.5 bg-[#F1EEFE] hover:bg-[#E8E4FE] text-[#7C5CFC] text-sm font-bold rounded-xl transition-all border border-[#DED6FE]`
- **Tokens**: `--color-accent`, `--color-accent-muted`, `--color-border-light`, `--color-text-darkest`, `--color-surface-secondary`, `--color-text-slate-medium`

### Find Jobs Page
- **Path**: `app/find-jobs/page.tsx`
- **Classes**:
  - **Layout**: `max-w-7xl mx-auto px-6 pt-8 space-y-6`
  - **Search Card**: `bg-surface border border-border rounded-2xl p-6 shadow-sm`
  - **Inputs/Selects**: `w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all`
  - **Icons**: `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted` (Search, MapPin, Globe)
  - **Success Banner**: `bg-success-lightest border border-success-light rounded-lg px-4 py-3 text-sm font-medium text-success-darker animate-in fade-in slide-in-from-top-2`
  - **Loading State**: `Loader2` icon with `animate-spin` on search button and table body.
  - **Filter Bar**: `bg-surface border border-border rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4`
  - **Table**: `w-full text-left`, `border-b border-border bg-surface-secondary`, `hover:bg-surface-secondary transition-colors`
  - **Match Score Bar**: `flex-1 h-1.5 bg-border-light rounded-full overflow-hidden`, `h-full transition-all`
  - **Pagination**: `px-6 py-4 border-t border-border flex items-center justify-between bg-surface-secondary/50`
- **Tokens**: `--color-surface`, `--color-border`, `--color-success-lightest`, `--color-success-darker`, `--color-accent`, `--color-accent-light`, `--color-info`, `--color-warning`

### Job Details Page
- **Path**: `app/find-jobs/[id]/page.tsx`
- **Classes**:
  - **Job Details Page**
  - **Layout**: `max-w-4xl mx-auto px-6 pt-8 space-y-6 pb-56`
  - **Section Cards**: `bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4`
  - **Info Cards (Grid)**: `bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm`
  - **Info Card Content**: `min-w-0` (container), `truncate` (text), `title` (hover tooltip for full content)
  - **Icon Containers**: `w-8 h-8 rounded-lg flex items-center justify-center` (used in section headers), `w-10 h-10 rounded-lg flex items-center justify-center` (used in info cards)
  - **Section Headings**: `text-[10px] font-bold text-text-muted uppercase tracking-wider`
  - **Match Badges**: `bg-success-lightest text-success border-success-light/30` (You have), `bg-accent-muted text-accent border-accent-light/30` (Gap skills)
  - **Job Description Section**: 
    - **Expandable Container**: `relative`, `max-h-32 overflow-hidden` (when collapsed), `bg-gradient-to-t from-surface to-transparent` (fade overlay)
    - **Toggle Button**: `text-xs font-bold text-accent hover:underline`
    - **Footer Info**: `pt-4 border-t border-border-light flex justify-between items-center`
    - **Full Posting Link**: `inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-tertiary hover:bg-border rounded-lg text-xs font-bold transition-colors border border-border`
  - **Company Research Card**: `bg-surface border border-border rounded-2xl overflow-hidden shadow-sm`
  - **Apply Button (Sticky)**: `fixed bottom-0 left-0 right-0 px-6 pb-8 pt-12 bg-gradient-to-t from-background via-background/90 to-transparent`
- **Tokens**: `--color-success-lightest`, `--color-accent-muted`, `--color-accent`, `--color-text-muted`, `--color-surface-tertiary`, `--color-info-lightest`, `--color-warning-lightest`, `--color-error-lightest`

### Company Research Dossier
- **Path**: `app/components/CompanyResearchDossier.tsx`
- **Classes**:
  - **Dossier Container**: `space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500`
  - **Dossier Card**: `bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3`
  - **Section Headings**: `text-sm font-bold text-text-primary flex items-center gap-2`, `text-xs font-bold text-text-muted uppercase tracking-wider`
  - **Grid Layout**: `grid grid-cols-1 md:grid-cols-2 gap-6`
  - **List Items**: `text-sm text-text-slate flex items-start gap-2`, `mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0`
  - **Badges/Tags**: `px-2 py-1 bg-surface-tertiary text-text-secondary rounded text-[11px] font-medium border border-border`
- **Tokens**: `--color-accent`, `--color-accent-muted`, `--color-text-primary`, `--color-text-slate`, `--color-success`, `--color-info`

### Live Research Log
- **Path**: `app/find-jobs/[id]/page.tsx`, `app/components/job-details/CoverLetterModal.tsx`
- **Classes**:
  - **Log Container**: `bg-surface border border-border rounded-xl overflow-hidden`, `bg-overlay` (body)
  - **Log Header**: `bg-surface-tertiary px-4 py-2 border-b border-border flex items-center justify-between`
  - **Log Body**: `p-4 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px] bg-overlay`
  - **Log Entries**: `flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300`, `text-text-muted shrink-0`
- **Tokens**: `--color-surface-tertiary`, `--color-overlay`, `--color-text-muted`, `--color-success`, `--color-error`, `--color-warning`

### Cover Letter Generator
- **Path**: `app/components/job-details/CoverLetterModal.tsx`
- **Classes**:
  - **Modal Container**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm`
  - **Modal Surface**: `bg-surface border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden`
  - **Header**: `p-6 border-b border-border bg-surface-secondary/50`
  - **Letter Body**: `bg-surface-tertiary/50 border border-border rounded-2xl p-8 font-serif text-sm text-text-slate leading-relaxed shadow-inner transition-all`
  - **Edit Mode**: `ring-2 ring-accent/20 border-accent/30`
  - **Textarea**: `w-full bg-transparent border-none focus:ring-0 p-0 font-serif text-sm text-text-slate leading-relaxed min-h-[400px] resize-none outline-none`
  - **Action Buttons**:
    - **Edit**: `bg-info-lightest text-info-foreground border-info-light rounded-xl`
    - **Copy**: `bg-accent-muted text-accent border-accent-light rounded-xl`
    - **Primary (Save/PDF)**: `.btn-primary rounded-xl`
    - **Neutral (Cancel)**: `bg-surface-tertiary text-text-secondary rounded-xl`
- **Tokens**: `--color-accent-muted`, `--color-surface-tertiary`, `--color-text-slate`, `--color-overlay`

### Cover Letter PDF
- **Path**: `app/components/job-details/CoverLetterPDF.tsx`
- **Styles**: `@react-pdf/renderer` StyleSheet.
- **Layout**: Formal business letter (Helvetica, 11pt body, 10pt contact info).
- **Colors**: Accent (#7C5CFC) for name, Slate (#333) for body, Gray (#666) for contact.

### Resume Template (Generated PDF)
- **Path**: `app/components/profile/ResumeTemplate.tsx`
- **Styles**: `@react-pdf/renderer` StyleSheet.
- **Colors**: Header/Titles: `#7C5CFC` (Accent), Text: `#1a1a1a`, Sub-text: `#4a4a4a`.
- **Typography**: Helvetica (standard PDF), Font sizes: Name (24), Section Titles (12), Main Text (10), Contact/Dates (9).
- **Layout**: Single-page A4, 40px padding, flex-based columns for experience headers.

### Dashboard
- **Path**: `app/dashboard/page.tsx`, `app/activity/page.tsx`, `app/components/dashboard/`
- **Classes**:
  - **Activity Page Layout**: `max-w-3xl mx-auto px-6 py-12`, `bg-surface border border-border rounded-2xl shadow-sm overflow-hidden`
  - **Back Button**: `w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all`
  - **Incomplete Profile Banner**: `p-4 bg-accent-muted border border-accent/20 rounded-2xl flex items-center justify-between shadow-sm`
  - **Stat Card**: `bg-surface border border-border rounded-2xl p-6 shadow-sm`, `text-[30px] font-bold text-text-primary leading-none`, `bg-success-lightest text-success-darker text-[12px] font-medium rounded-sm`
  - **Activity Item**: `w-2.5 h-2.5 rounded-full border-2 border-surface shadow-xs z-10`, `absolute w-4 h-4 rounded-full border border-white/50`
  - **Activity Skeleton**: `flex gap-4 animate-pulse`, `w-3 h-3 rounded-full bg-border`, `h-4 bg-border rounded w-3/4`, `h-3 bg-border rounded w-1/4`
  - **Chart Skeleton**: `bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col animate-pulse`, `h-6 bg-border rounded w-1/3 mb-6`, `flex-1 bg-border/50 rounded-xl`
  - **Empty State**: `flex flex-col items-center justify-center h-full py-8 text-center`, `text-sm text-text-secondary`
### Dashboard Charts

File: `app/components/dashboard/`
Last updated: 2026-06-20

| Property         | Class                                     |
| ---------------- | ----------------------------------------- |
| Background       | `bg-surface`                              |
| Border           | `border border-border`                    |
| Border radius    | `rounded-2xl`                             |
| Text — primary   | `text-lg font-bold text-text-primary`     |
| Text — secondary | `text-xs font-bold text-text-muted`       |
| Spacing          | `p-6`, `mb-6`                             |
| Hover state      | `cursor={{ fill: '#F9FAF7' }}` (Recharts) |
| Shadow           | `shadow-sm`                               |
| Accent usage     | `#7C5CFC` (Jobs), `#10B981` (Match Score), `#61A8FF` (Research) |

**Pattern notes:**
- Charts are wrapped in a standard card container (`bg-surface`, `border-border`, `rounded-2xl`).
- Grid lines use `strokeDasharray="3 3"` and color `#E7EAF3` (dashed-border-light).
- XAxis and YAxis use `axisLine={false}` and `tickLine={false}` for a clean, modern look.
- Loading states use a skeleton card with `animate-pulse` and `bg-border/50` for the chart area.

### Chart Skeleton

File: `app/dashboard/page.tsx`
Last updated: 2026-06-20

| Property      | Class                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Container     | `bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col animate-pulse` |
| Title Bar     | `h-6 bg-border rounded w-1/3 mb-6`                                    |
| Chart Area    | `flex-1 bg-border/50 rounded-xl`                                      |

**Pattern notes:**
- Skeleton replaces the entire chart card during loading to prevent layout shift.
- Uses `animate-pulse` for a smooth transition.
- Chart area mimics the shape of the Recharts responsive container.
