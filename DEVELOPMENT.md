# Development Planning Documentation

## Table of Contents
1. [Project Structure](#project-structure)
2. [UI/UX Design Decisions](#uiux-design-decisions)
3. [Component Architecture](#component-architecture)
4. [Real-time Synchronization Flow](#real-time-synchronization-flow)

---

## Project Structure

```
agnos-registration/
├── src/
│   ├── app/                        ← Next.js App Router
│   │   ├── [locale]/               ← Dynamic locale segment (en / th)
│   │   │   ├── layout.tsx          ← Wraps all pages with NextIntlClientProvider
│   │   │   │                         and PWAInstallBanner
│   │   │   ├── page.tsx            ← Home page — navigation to patient/staff
│   │   │   ├── patient/
│   │   │   │   └── page.tsx        ← Patient registration route
│   │   │   ├── staff/
│   │   │   │   └── page.tsx        ← Staff dashboard route
│   │   │   ├── not-found.tsx       ← Locale-level 404 with own provider
│   │   │   └── error.tsx           ← Error boundary (static text, no provider)
│   │   ├── not-found.tsx           ← Root-level 404 fallback for unmatched URLs
│   │   ├── layout.tsx              ← Root HTML shell (lang, body, fonts)
│   │   └── globals.css             ← Global styles + animation keyframes
│   │
│   ├── components/
│   │   ├── patient/                ← All patient-facing form components
│   │   │   ├── PatientForm.tsx     ← Root form component — owns session logic,
│   │   │   │                         React Hook Form context, Supabase sync,
│   │   │   │                         submit/edit state machine
│   │   │   ├── PersonalSection.tsx ← Name, DOB, gender fields
│   │   │   ├── ContactSection.tsx  ← Phone (with searchable country code),
│   │   │   │                         email, address
│   │   │   ├── AdditionalSection.tsx ← Nationality, language, religion
│   │   │   │                          (all searchable dropdowns)
│   │   │   └── EmergencySection.tsx  ← Optional emergency contact fields
│   │   │
│   │   ├── staff/                  ← All staff dashboard components
│   │   │   ├── StaffDashboard.tsx  ← Root dashboard — owns Supabase realtime
│   │   │   │                         subscription, session state, filters,
│   │   │   │                         auto-expire logic, toast integration
│   │   │   ├── PatientCard.tsx     ← Card view of a single session — shows
│   │   │   │                         all fields, status, timer, actions
│   │   │   ├── PatientTable.tsx    ← Table view with responsive column hiding
│   │   │   ├── DashboardFilters.tsx ← Search + gender + nationality filters
│   │   │   ├── SessionActions.tsx  ← Expire and delete buttons with
│   │   │   │                         confirm dialogs per session
│   │   │   ├── SessionTimer.tsx    ← Live elapsed time since session created,
│   │   │   │                         updates every second
│   │   │   └── FieldRow.tsx        ← Single label/value row in PatientCard
│   │   │
│   │   └── ui/                     ← Shared, reusable UI primitives
│   │       ├── FormInput.tsx       ← Labeled input with error state
│   │       ├── SearchableSelect.tsx ← Custom dropdown with search filter,
│   │       │                          keyboard navigation, outside-click close
│   │       ├── StatusBadge.tsx     ← Colored pill badge for session status
│   │       ├── ProgressBar.tsx     ← Form completion percentage bar
│   │       ├── LanguageSwitcher.tsx ← EN/TH toggle using hard navigation
│   │       ├── ConfirmDialog.tsx   ← Modal confirmation dialog for
│   │       │                         destructive actions
│   │       ├── Toast.tsx           ← Toast notification system with
│   │       │                         auto-dismiss and progress bar
│   │       └── PWAInstallBanner.tsx ← Install prompt with dismiss persistence
│   │
│   ├── hooks/
│   │   ├── useToast.ts             ← Toast state management (add/remove)
│   │   └── usePWAInstall.ts        ← beforeinstallprompt event capture,
│   │                                  standalone detection, install trigger
│   │
│   ├── lib/
│   │   ├── supabase.ts             ← Typed Supabase client singleton
│   │   ├── validation.ts           ← Zod schema with libphonenumber-js
│   │   │                             validation per country
│   │   ├── sessionActions.ts       ← markSessionExpired(), deleteSession()
│   │   │                             helper functions
│   │   └── utils.ts                ← generateSessionId(), getSessionId(),
│   │                                  getActivityStatus(), calculateProgress(),
│   │                                  formatDateTime(), formatElapsed()
│   │
│   └── types/
│       ├── patient.ts              ← PatientSession interface,
│       │                             PatientStatus union type,
│       │                             PatientFormData type
│       └── database.ts             ← Auto-generated Supabase types
│                                     (matches DB schema exactly)
│
├── messages/
│   ├── en.json                     ← English translations (nav, patient,
│   │                                 staff, status, common, toast)
│   └── th.json                     ← Thai translations (same structure)
│
├── public/
│   ├── manifest.json               ← PWA manifest (name, icons, theme color,
│   │                                 start_url, display: standalone)
│   └── icons/
│       ├── icon-192.png            ← PWA icon for Android home screen
│       └── icon-512.png            ← PWA icon for splash screen
│
├── i18n.ts                         ← next-intl request config — loads messages
│                                     directly from JSON to avoid getMessages()
│                                     issues with dynamic locale params
├── middleware.ts                   ← next-intl routing middleware — redirects
│                                     / to /en, validates locale segments
└── next.config.ts                  ← Chains withNextIntl and withPWA plugins
```

### Key structural decisions

**`[locale]` routing** — Wrapping all routes in a `[locale]` dynamic segment lets Next.js pass the locale to server components. `next-intl` middleware handles redirect from `/` to `/en` automatically.

**Separation of patient and staff components** — Patient components are completely isolated from staff components. They share only types and lib utilities. This makes it easy to reason about what each side does and prevents accidental coupling.

**`ui/` as a primitive layer** — Shared components like `SearchableSelect`, `FormInput`, and `Toast` have no knowledge of the domain (patients, sessions). They only accept props and emit callbacks, making them reusable across both sides.

**`lib/` for side effects** — All Supabase calls and business logic live in `lib/`, not inside components. Components call lib functions and handle the result. This keeps components focused on rendering.

---

## UI/UX Design Decisions

### Design Language
The interface uses a clean healthcare aesthetic — blue (`#2563EB`) as the primary color, white backgrounds, rounded corners (`rounded-xl`, `rounded-2xl`), and subtle shadows. The goal is professional but approachable, reducing anxiety for patients filling in medical information.

### Patient Form — All Screen Sizes

**Single column, scrollable layout** — The patient form uses a single max-width container (`max-w-2xl`) centered on the page. On all screen sizes, fields stack vertically. This avoids confusion about reading order and works well on mobile where patients are most likely to be using a tablet or kiosk.

**Sticky header with progress bar** — The header stays at the top while scrolling so patients always see their completion percentage. This reduces abandonment by making progress visible.

**Section cards** — Each form section (Personal, Contact, Additional, Emergency) is wrapped in a white card with a numbered section heading. This breaks a long form into digestible chunks and gives a sense of progress.

**Searchable dropdowns instead of native selects** — Native `<select>` elements cannot be styled consistently across browsers and do not support search. A custom `SearchableSelect` component is used for nationality, country code, gender, religion, and language — allowing patients to type the first letter to filter options. This is especially important for country lists with 30+ entries.

**Two-column grid inside sections** — On screens wider than `sm` (640px), fields inside each section use a `grid-cols-2` layout. On mobile they collapse to single column. This reduces scrolling on larger screens while staying readable on phones.

**Post-submit editing** — After submission, a success screen is shown with an "Edit my information" button. Clicking it reopens the form with all data prefilled and an editing banner at the top. The submit button changes to "Save changes". This avoids the frustration of being permanently locked out after a typo.

### Staff Dashboard — Responsive Design

**Table view on desktop, cards on mobile** — The table view shows the most information density on wide screens. On mobile (`< 768px`), users can still switch to table but it uses progressive column hiding:

| Screen | Visible columns |
|---|---|
| Mobile (< 640px) | Patient, Status, Phone, Actions |
| Small (≥ 640px) | + Last Activity |
| Medium (≥ 768px) | + Nationality, Language |
| Large (≥ 1024px) | + Session Time, Submitted At |

**Sticky header** — The header is sticky so filters and view controls are always accessible when scrolling through many sessions.

**Session status color coding** — Each status has a distinct color system applied consistently across badges, card headers, and card borders:
- Filling → Blue (active, attention)
- Inactive → Orange (warning, needs attention)
- Expired → Gray (resolved, collapsed by default)
- Submitted → Green (complete, positive)

**Expired sessions collapsed** — Expired sessions are hidden behind a toggle by default. This keeps the dashboard focused on active patients and reduces visual noise. Staff can expand the expired section when needed.

**Filter bar always visible** — Filters sit above the session list and are always visible, not behind a toggle. For staff managing many patients, instant filtering by name or nationality is a frequent action.

**Confirmation dialogs for destructive actions** — Expire and delete buttons open a modal confirmation dialog before executing. The expire dialog uses orange (warning) and the delete dialog uses red (destructive) to communicate severity.

**Toast notifications** — Non-blocking toasts appear in the top-right corner for all notable events. They auto-dismiss after 4 seconds with a shrinking progress bar. Staff can still interact with the dashboard while toasts are visible.

### Language Switching

Language switching uses hard navigation (`window.location.href`) rather than Next.js soft navigation. This is because `NextIntlClientProvider` loads messages at server render time — a soft navigation does not re-run the server component and therefore does not reload the translated messages. Hard navigation forces a full server render with the new locale, which correctly loads the new message file.

---

## Component Architecture

### Patient Side

```
PatientForm (root)
├── owns: useForm(), sessionId ref, formState, syncToSupabase
├── provides: FormProvider context to all children
│
├── PersonalSection
│   ├── FormInput (first_name, middle_name, last_name, date_of_birth)
│   └── SearchableSelect (gender)
│
├── ContactSection
│   ├── SearchableSelect (country code — local state, not in form schema)
│   ├── Controller + input (phone — merges countryCode + digits)
│   ├── FormInput (email)
│   └── FormInput (address)
│
├── AdditionalSection
│   ├── SearchableSelect via Controller (nationality)
│   ├── SearchableSelect via Controller (preferred_language)
│   └── SearchableSelect via Controller (religion)
│
└── EmergencySection
    ├── FormInput (emergency_name)
    └── FormInput (emergency_relationship)
```

**FormProvider pattern** — `PatientForm` wraps all sections in React Hook Form's `FormProvider`. Child sections call `useFormContext()` to access `register`, `control`, and `formState.errors` without prop drilling.

**Controller for custom inputs** — Native inputs use `register()`. Custom components like `SearchableSelect` use `Controller` which provides `field.value` and `field.onChange` in a controlled pattern.

**Session state machine** — `PatientForm` manages a `formState` variable with three states:
- `loading` — checking Supabase for existing session
- `filling` — form is active (new or restored session)
- `submitted` — patient has submitted (shows success screen or edit mode)

### Staff Side

```
StaffDashboard (root)
├── owns: sessions[], filters, viewMode, showExpired
├── owns: Supabase realtime subscription
├── owns: auto-expire interval (60s)
├── owns: useToast()
│
├── DashboardFilters
│   └── emits: onChange(FilterState) → parent applies filters
│
├── PatientCard[] (card view)
│   ├── SessionTimer (independent, updates every 1s)
│   ├── FieldRow[] (label/value pairs)
│   ├── StatusBadge
│   └── SessionActions
│       └── ConfirmDialog (expire or delete)
│
└── PatientTable (table view)
    └── TableRowActions[] (per row)
        └── SessionActions
            └── ConfirmDialog (expire or delete)
```

**Lifting state to StaffDashboard** — All session data lives in `StaffDashboard`. Child components receive sessions as props and emit callbacks (`onExpired`, `onDeleted`). When a staff action succeeds, the parent updates its local state immediately — no re-fetch needed. The Supabase realtime subscription also updates the same state, keeping everything in sync.

**Filtering in memory** — Filters are applied client-side using `Array.filter()` against the in-memory sessions array. This avoids a round-trip to Supabase on every keystroke and keeps the filter instant. Since the number of concurrent sessions in a clinic is bounded (typically under 100), client-side filtering is appropriate.

**SessionTimer isolation** — Each `SessionTimer` component manages its own `setInterval` independently. It receives only `createdAt` as a prop and computes elapsed time locally. This avoids the parent component re-rendering every second for every active session.

### Shared UI Components

**SearchableSelect** — A fully custom dropdown built without any third-party component library. It manages its own open/close state, search input, and keyboard events. It is positioned `absolute` so it overlays content without pushing layout. Outside-click detection uses a `mousedown` event listener on `document` with a `ref` check.

**Toast system** — `useToast` is a custom hook that manages an array of `ToastMessage` objects. `ToastContainer` renders them in a fixed portal at the top-right. Each individual `Toast` manages its own dismiss timer using `useEffect`. The `animate-shrink` CSS animation on the progress bar is tied to the same 4-second duration.

**ConfirmDialog** — A modal with a backdrop. The backdrop click calls `onCancel`. It uses `role="dialog"` and `aria-modal="true"` for accessibility. The confirm button style changes between orange (warning) and red (destructive) based on the `confirmDestructive` prop.

---

## Real-time Synchronization Flow

### Overview

Real-time updates use Supabase Realtime, which is built on PostgreSQL's `LISTEN/NOTIFY` pub/sub system. The database publishes change events over a WebSocket connection that the client subscribes to.

### Patient → Database (Write path)

```
Patient types in a field
        │
        ▼
React Hook Form watch() fires
        │
        ▼
400ms debounce timer resets
        │  (if patient keeps typing, timer resets)
        ▼
Timer fires → syncToSupabase() called
        │
        ▼
supabase.from('patient_sessions').update({
  ...formData,
  last_activity_at: now()
}).eq('session_id', sessionId)
        │
        ▼
Supabase writes to PostgreSQL
        │
        ▼
PostgreSQL publishes UPDATE event
        │
        ▼
Supabase Realtime broadcasts to all subscribers
```

The 400ms debounce means at most one database write per 400ms per patient, regardless of how fast they type. This balances responsiveness against database load.

### Database → Staff Dashboard (Read path)

```
Supabase broadcasts change event (INSERT / UPDATE / DELETE)
        │
        ▼
StaffDashboard realtime channel receives payload
        │
        ├─── INSERT → setSessions(prev => [newSession, ...prev])
        │              addToast('info', 'New patient arrived')
        │
        ├─── UPDATE → setSessions(prev => prev.map(s =>
        │               s.session_id === payload.new.session_id
        │                 ? payload.new : s
        │             ))
        │              if status changed to 'submitted':
        │                addToast('success', 'Patient submitted')
        │
        └─── DELETE → setSessions(prev =>
                        prev.filter(s =>
                          s.session_id !== payload.old.session_id
                        ))
```

**Why DELETE works** — By default Supabase only sends the primary key on DELETE events. `REPLICA IDENTITY FULL` is set on the table so that `payload.old` contains the full row including `session_id`, allowing the filter to match correctly.

### Staff Action → Database → UI (Local + realtime path)

When a staff member expires or deletes a session, two things happen in parallel:

```
Staff clicks Expire/Delete
        │
        ├─── 1. Optimistic local update
        │         handleSessionExpired(sessionId)
        │         → setSessions updates status locally
        │         → UI updates instantly (no loading state)
        │
        └─── 2. Database write
                  supabase.update/delete
                        │
                        ▼
                  Supabase broadcasts UPDATE/DELETE
                        │
                        ▼
                  Realtime handler runs again
                  (no-op since local state already matches)
```

The local update is applied immediately for a snappy UI. The realtime event arrives shortly after and updates state again — but since the data is identical, React does not re-render.

### Auto-expire (System path)

```
StaffDashboard mounts
        │
        ▼
setInterval fires every 60 seconds
        │
        ▼
supabase.update({ status: 'expired' })
  .in('status', ['filling', 'inactive'])
  .lt('last_activity_at', 30min ago)
        │
        ├─── Updates DB rows in batch
        │
        └─── Also updates local state immediately
               prev.map(s => {
                 if diff > 30min → { ...s, status: 'expired' }
                 else → s
               })
```

The staff dashboard both writes the expiry to the database and updates its own local state in the same operation. Other open staff dashboard tabs will receive the change via the realtime subscription and update accordingly.

### Session Lifecycle on Reconnect

If the staff dashboard loses and regains its WebSocket connection, Supabase Realtime automatically reconnects. The initial data fetch on mount always loads the current state from the database, so even if events were missed during a disconnection, a page refresh returns to a consistent state.

If the patient's browser loses connection mid-form, the debounced sync will retry when the connection is restored (Supabase client handles reconnection internally). No data is lost as the form state lives in React Hook Form's memory until the sync succeeds.