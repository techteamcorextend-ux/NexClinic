# Nexclinic — Frontend Workflow & Architecture Documentation

**Application:** Nexclinic — Unified Clinic Management System
**Repository root:** `nexclinic/`
**Stack:** Next.js 14.2 (App Router) · React 18.3 · TypeScript 5.6 (`strict`) · Tailwind CSS 3.4 · Framer Motion 11 · GSAP 3 + ScrollTrigger · Lenis · Recharts 2.13 · React Three Fiber / three.js · Radix UI primitives (shadcn/ui pattern) · lucide-react
**Document status:** Reverse-engineered from source. Describes *as-built* behaviour, and — where the frontend anticipates a server — the *expected* backend contract.

---

## 0. Executive summary

Nexclinic is a **single Next.js application** that hosts two entirely separate surfaces sharing one root layout:

1. A **public marketing site** (`/`) — a long-scroll landing page with pinned scroll-scrubbed sections, a WebGL DNA helix, marquees, and a demo-request form.
2. Six **role-based operational portals** — Super Admin, Surgeon, Reception, Patient, Patient-Profile (shared), and Inventory Manager — reached through a portal picker at `/login` and a per-role sign-in at `/signin/[role]`.

The defining architectural characteristic is that **there is no backend in this build**. Every portal reads and writes a **single client-side reducer store** (`lib/clinic-store.tsx`) that is mounted once at the application root and mirrored into `localStorage`. This is what makes the cross-portal choreography work: an appointment requested on the public login page appears in the receptionist's pending queue and fires a push-style toast; a bill raised at the front desk decrements pharmacy stock and, if a line crosses its reorder threshold, notifies the Inventory Manager; a shift change made by the Super Admin fires a handset-style notification addressed to the staff member.

There is **no authentication**. `SignInView` does not validate credentials — it sets a `pending` flag and calls `router.push(role.home)` after a 600 ms delay. Every sign-in form is pre-filled with demo credentials from `lib/roles.ts`, and a `PortalSwitcher` chip row in every portal header lets you hop between all five portals without returning to the login screen.

> **Two documentation caveats found in the repository itself**
> - `ROUTES.md` is accurate and matches the code.
> - `README.md`'s route table is **stale**: it lists `/site`, `/doctor`, and a `/patient` body-map dashboard that no longer exist. Treat `ROUTES.md` and this document as authoritative.

---

## 1. System Overview & Architecture

### 1.1 Rendering model

Every route is a **React Server Component page file** that does one of three things:

| Pattern | Example | Purpose |
|---|---|---|
| Thin server wrapper → client view | `app/admin/(routes)/staff/page.tsx` → `StaffView.tsx` | Exports `metadata`, renders a `"use client"` view. Keeps `metadata` on the server while the interactive body ships to the client. |
| Server redirect | `app/admin/page.tsx` | `redirect("/admin/dashboard")` — portal roots forward to their dashboard. |
| Server page with `generateStaticParams` | `app/patients/[id]/page.tsx` | Pre-renders every known dynamic id at build time, calls `notFound()` for unknown ones. |

Dynamic segments that are statically enumerated:

- `/signin/[role]` → `ROLES.map(r => r.key)` → `admin`, `surgeon`, `reception`, `patient`, `inventory`
- `/patients/[id]` and `/surgeon/consultation/[id]` → `PATIENTS.map(p => p.id)` → `p-1001` … `p-1004`
- `/admin/staff/[id]` → `CLINIC_SEED.staff.map(m => m.id)` → `ST-1` … `ST-8`

`/signin/[role]`, `/patients/[id]` and `/surgeon/consultation/[id]` guard with `notFound()`. **`/admin/staff/[id]` does not** — it renders `StaffProfile` unconditionally, and that component renders an `EmptyState` ("Staff member not found") when the id is absent from the store. This is deliberate: staff records can be *created at runtime* via the Add Staff dialog, so ids that did not exist at build time must still resolve.

### 1.2 Boot sequence — what happens from the very first byte

```
1.  app/layout.tsx  (Root Server Component)
    ├─ next/font/google → Inter (400–800), CSS variable --font-sans, display:swap
    ├─ metadata: title template "%s · Nexclinic"
    ├─ viewport: themeColor #F2F1EF
    └─ <html lang="en"><body class="font-sans antialiased">
         └─ <ClinicProvider>            ← the single global store
              ├─ {children}             ← the routed segment layout
              └─ <PhoneToasts />        ← global push-notification overlay
```

**Step-by-step on first paint:**

1. **Server render.** `ClinicProvider` initialises `useReducer(clinicReducer, CLINIC_SEED)`. The seed (`lib/clinic-seed.ts`) is a fully populated, deterministic snapshot: 4 patient charts, 6 appointments, 4 queue entries, 13 stock items, 4 stock logs, 5 suppliers, 4 purchase orders, 5 equipment assets, 8 staff members, 2 bills, and `notices: []`. Because the seed is a static module, the server HTML is deterministic.
2. **Hydration.** `hydrated` is `false`. Nothing that depends on browser state renders differently yet — this is enforced consistently across the codebase:
   - `useReducedMotionSafe()` and `useMediaQuery()` both return `false` on the server *and on the first client render*, then update in `useEffect`.
   - `AdminShell` renders the sidebar expanded (272 px, the literal Tailwind class) and only reads the collapsed preference after mount.
   - `HealthOverview` hardcodes `MONTH_LABEL = "April 2026"` rather than calling `new Date()`, explicitly "so the server and client markup are identical".
   - The store's `uid()` counter is only ever invoked inside event handlers, never during render, so ids cannot desync.
3. **Store restore.** A mount-time `useEffect` reads `localStorage["nexclinic:state:v1"]`. If the parsed value has `Array.isArray(parsed.stock) && Array.isArray(parsed.staff)`, it dispatches `{ type: "hydrate", state: { ...CLINIC_SEED, ...parsed } }` — a shallow merge, so new seed keys added in a later version survive an old saved payload. Any throw (private mode, corrupt JSON) is swallowed and the seed is kept. `setHydrated(true)` runs either way.
4. **Persistence loop.** A second effect writes the whole state back to `localStorage` on every change, guarded by `if (!hydrated) return` so the restore is never immediately overwritten by the seed. Quota / private-mode failures are swallowed — the app still works, it just stops persisting.
5. **Toast arming.** `PhoneToasts` waits for `hydrated`, then on its *first* pass records every existing notice id into a `Set`. This is what prevents a page reload from replaying a backlog of toasts. From then on, any newly appended notice with `kind: "phone"` animates in.

### 1.3 Provider & layout tree

```
RootLayout  (app/layout.tsx)
└── ClinicProvider                       global reducer + localStorage
    ├── MarketingLayout   app/(marketing)/layout.tsx
    │    ├── <SmoothScroll/>             Lenis inertial scroll, drives GSAP ticker
    │    ├── skip-to-content link
    │    └── rounded page frame (bg-bg-frame, lg:rounded-frame, lg:shadow-frame)
    │         └── /  → Nav + 14 sections + Footer
    │
    ├── /login,  /signin/[role]          no segment layout — full-bleed <main>
    │
    ├── AdminLayout      app/admin/layout.tsx
    │    └── AdminShell  → AdminSidebar + AdminHeader + animated <main>
    │         └── /admin/(routes)/*      8 modules + /admin/staff/[id]
    │
    ├── SurgeonLayout    app/surgeon/layout.tsx
    │    ├── {children}                  each page renders its own PortalShell
    │    └── <ScheduleSurgeryFab/>       floating action, present on EVERY surgeon screen
    │
    ├── /reception/*, /patient/*, /inventory/*    no segment layout;
    │        each page renders <PortalShell> (or <InventoryShell>) itself
    │
    ├── /patients/[id]                   bespoke violet chrome, not PortalShell
    │
    └── <PhoneToasts/>                   fixed top-right, z-[120], above everything
```

Two deliberate design decisions worth noting:

- **The root layout is intentionally minimal.** Section chrome lives in route-group layouts, so the marketing site's Lenis smooth-scroll and rounded frame never leak into the admin panel, and the admin sidebar never leaks into the marketing site.
- **The surgeon FAB lives in the layout, not the pages.** This gives it a single piece of state and guarantees presence on every surgeon screen including the dynamic consultation route.

### 1.4 Complete route map

| Route | File | Type | Chrome | Notes |
|---|---|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Server | MarketingLayout | 14-section landing page |
| `/login` | `app/login/page.tsx` → `HomeEntry` | Client | none | Portal picker + pre-login booking |
| `/signin/[role]` | `app/signin/[role]/page.tsx` → `SignInView` | Client | none | 5 static params; `notFound()` otherwise |
| `/admin` | `app/admin/page.tsx` | Server | — | `redirect("/admin/dashboard")` |
| `/admin/dashboard` | `AdminDashboard` | Client | AdminShell | KPIs, 2 line charts, payments table |
| `/admin/staff` | `StaffView` | Client | AdminShell | Search, dept filter, Add Staff |
| `/admin/staff/[id]` | `StaffProfile` | Client | AdminShell | Shift editor, salary, access toggle |
| `/admin/payroll` | `PayrollView` | Client | AdminShell | Editable slips, run payroll, cycles |
| `/admin/access` | `AccessView` | Client | AdminShell | Credential table, scope, enable/disable |
| `/admin/analytics` | `AnalyticsView` | Client | AdminShell | Daily/monthly/yearly, donut + bars |
| `/admin/logs` | `LogsView` | Client | AdminShell | Revenue history / patient payments |
| `/admin/expenses` | `ExpensesView` | Client | AdminShell | Net profit, ledger by month |
| `/admin/settings` | `SettingsView` | Client | AdminShell | 5 tabs |
| `/surgeon` | `app/surgeon/page.tsx` | Server | — | `redirect("/surgeon/dashboard")` |
| `/surgeon/dashboard` | `SurgeonDashboard` | Client | PortalShell `clinic` + FAB | Search, next-up, today's list |
| `/surgeon/patients` | `PatientsView` | Client | PortalShell + FAB | Patient database |
| `/surgeon/consultation/[id]` | `ConsultationView` | Client | PortalShell + FAB | Vitals / notes / diet editor |
| `/surgeon/scribe` | `ScribeView` | Client | PortalShell + FAB | Scripted transcript → SOAP note |
| `/surgeon/reports` | `ReportsView` | Client | PortalShell + FAB | Filterable report index |
| `/reception` | `app/reception/page.tsx` | Server | — | `redirect("/reception/dashboard")` |
| `/reception/dashboard` | `ReceptionDashboard` | Client | PortalShell `clinic` | Queue, priority, emergency, walk-in |
| `/reception/requests` | `RequestsView` | Client | PortalShell | Approve / decline / reschedule |
| `/reception/billing` | `BillingView` | Client | PortalShell | Cart → bill → stock draw-down |
| `/reception/onboarding` | `OnboardingView` | Client | PortalShell | QR + 5-step chatbot |
| `/patient` | `app/patient/page.tsx` | Server | — | `redirect("/patient/dashboard")` |
| `/patient/dashboard` | `PatientDashboard` | Client | PortalShell `care` | Profile, 4 quick actions, 3 dialogs |
| `/patient/records` | `RecordsView` | Client | PortalShell `care` | Assembled medical timeline |
| `/patient/health` | `HealthOverview` | Client | PortalShell `night` | Dark-glass cardiac overview |
| `/patients/[id]` | `PatientProfile` | Client | bespoke `theme-violet` | Shared cross-portal profile |
| `/inventory` | `app/inventory/page.tsx` | Server | — | `redirect("/inventory/dashboard")` |
| `/inventory/dashboard` | `InventoryOverview` | Client | InventoryShell `vault` | Tiles + full stock register table |
| `/inventory/stock` | `StockView` | Client | InventoryShell | Low-stock groups, pin/unpin, add item |
| `/inventory/suppliers` | `SuppliersView` | Client | InventoryShell | Vendor cards + ratings |
| `/inventory/orders` | `OrdersView` | Client | InventoryShell | PO history + place-order cart |
| `/inventory/equipment` | `EquipmentView` | Client | InventoryShell | Asset cards + maintenance log |
| `/inventory/logs` | `LogsView` | Client | InventoryShell | Filterable stock movement trail |

**Total: 30 addressable routes** (4 of which are redirects), plus 3 dynamic families.

### 1.5 Navigation graph — how a user reaches every page

```
                         ┌──────────────────────────────┐
                         │  /  Marketing landing page   │
                         └──────────────┬───────────────┘
     Nav "Login", Nav "Book a Demo", Hero CTA, Showcase "Book a Demo",
     mobile-menu "Login"/"Book a Demo"   →  ALL point at /login
                                        │
                         ┌──────────────▼───────────────┐
                         │  /login   Portal picker      │
                         │  · 5 role cards              │
                         │  · "Enter New Appointment"   │
                         │  · "About the platform →" → /│
                         └──────────────┬───────────────┘
                                        │  /signin/{role}
                         ┌──────────────▼───────────────┐
                         │  /signin/[role]              │
                         │  · "All portals" → /login    │
                         │  · Switch-role chips (×4)    │
                         │  · Submit → router.push(home)│
                         └──────────────┬───────────────┘
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
  /admin/dashboard  /surgeon/    /reception/      /patient/       /inventory/
                     dashboard    dashboard        dashboard       dashboard
        │               │               │               │               │
   AdminSidebar    PortalShell rail + PortalSwitcher chips (all 5 portals)
   (8 modules)     + mobile drawer     ← reachable from ANY portal header
```

Three distinct navigation systems coexist:

1. **Marketing nav** (`components/sections/Nav.tsx`) — sticky header, in-page hash links inside a full-screen Radix dialog overlay.
2. **Admin sidebar** (`components/admin/AdminSidebar.tsx`) — collapsible rail, 8 modules from `ADMIN_NAV`, breadcrumb driven by `findNavItem(pathname)`.
3. **Portal shell** (`components/portal/PortalShell.tsx`) — a 76 px icon rail (desktop) / slide-in drawer (mobile) driven by a `NavItem[]` prop, plus the cross-portal `PortalSwitcher`.

**The portal boundary is enforced by data, not by a runtime guard.** `ADMIN_NAV` contains no inventory modules and `INVENTORY_NAV` contains no admin modules. The comment in `lib/portal-nav.ts` states this explicitly: *"That separation lives in the two nav configs rather than a runtime guard, so it cannot drift."* In a real deployment this must be backed by server-side authorisation — the current arrangement only hides links.

---

## 2. Page-by-Page UI & Interaction Breakdown

Legend used throughout:
**→** navigates · **⇢** opens a dialog/panel · **⚡** dispatches a store action · **◧** local component state only · **⬇** produces a file download

---

### 2.1 `/` — Marketing landing page

**Purpose:** Convert facility decision-makers. Every CTA funnels to `/login`.
**Composition:** `Nav` + 14 sections + `Footer`, in this fixed order: Hero → Marquee → Stats → Features → Portals → Stepper → ExplorePanels → ShowcaseWidget → Resources → Testimonials → Marquee (reverse) → Timeline → Interstitial → ContactForm.
**Copy source:** every string comes from `lib/data.ts`. No marketing copy lives inside a component.

#### Section 1 — `Nav` (sticky, `z-50`)

| Element | Type | Behaviour |
|---|---|---|
| "Nexclinic" wordmark | `<a href="#top">` | Smooth-scrolls to hero (intercepted by Lenis, `-90px` offset) |
| "Menu" pill (≥ sm) | Radix Dialog trigger | ◧ `menuOpen=true` → full-screen ink-black overlay |
| Hamburger (< sm) | button | ◧ same overlay |
| Search icon | button | **Decorative — no handler bound.** `aria-label="Search Nexclinic"` only |
| "Login" (≥ md) | `<Link>` | → `/login` |
| "Book a Demo" | `<Link>` | → `/login` |

**Menu overlay:** 5 nav links (`#platform`, `#portals`, `#ai-suite`, `#pricing`, `#resources`) each numbered `01`–`05`, staggered in at `0.06 × index`. Clicking one sets `menuOpen=false` and scrolls. Overlay also carries duplicate "Book a Demo" / "Login" buttons (both → `/login`) and a "Close" button.

**Scroll behaviour:** a passive `scroll` listener sets `scrolled = window.scrollY > 24`, which swaps the header from transparent to `bg-white/75 backdrop-blur-xl` with a bottom hairline, over a 500 ms transition.

#### Section 2 & 11 — `Marquee`

One reusable component, two instances. Renders the phrase list **twice** inside `MarqueeRow` and translates the track by −50% via CSS keyframes, giving a seamless loop. `.marquee-pause:hover .marquee-track { animation-play-state: paused }` — **hovering pauses the ticker**. Under `prefers-reduced-motion` the animation is removed entirely and the row becomes a plain horizontally scrollable strip. Instance 1: `MARQUEE_ONE`, left, 34 s. Instance 2: `MARQUEE_TWO`, right, 30 s. A third small instance (`MARQUEE_SMALL`, `scale="inline"`, 26 s) sits at the foot of the Features section.

#### Section 3 — `Stats` (`#platform`)

Left column: 4 count-up statistics. `CounterOnView` uses `useInView(ref, { once: true, margin: "-15% 0px" })` and a `requestAnimationFrame` loop with `easeOutCubic` over 1200 ms. Under reduced motion the final value is set immediately. The 4th stat (`"Multi"`) is non-numeric and renders `staticValue` with no count-up.

Right column: `RadialDiagram` — an SVG of concentric rings plus 6 `CARE_JOURNEY` nodes positioned trigonometrically at `angle = (-90 + i·60)°`, radius 36 %. Node index `CARE_JOURNEY_ACTIVE_INDEX = 1` renders enlarged with the strong gradient. Rings and nodes animate in on `inView` with an 0.08 s / 0.12 s stagger. **Nodes are not interactive.**

#### Section 4 — `Features` (`#ai-suite`)

Radix `Accordion type="single" collapsible defaultValue={FEATURES[0].id}`. Three items; clicking a header expands its body and collapses the previously open one; clicking the open header collapses it (nothing open). Left panel is a gradient placeholder standing in for a product screenshot, overlaid by a floating card whose "Explore All Portals" link is an in-page anchor → `#portals`.

#### Section 5 — `Portals` (`#portals`)

Six cards, two layouts:

- **Desktop (≥ md):** a fanned deck. Each `<li>` carries CSS variables `--fan-rot` (−7° … +7°) and `--fan-y` (18/8/0/0/8/18 px) applied through a *class*, not an inline style, precisely so `group-hover:[transform:none]` can override it. On hovering anywhere in the `ul`, all six straighten simultaneously and the negative margin relaxes from `-ml-16` to `-ml-3`, fanning the deck open over 500 ms. Individual cards additionally lift `-translate-y-2` with a stronger shadow.
- **Mobile:** a `snap-x snap-mandatory` horizontal carousel, 78 vw cards, with the hint "Swipe to see all six portals →".

**No card links anywhere.** They are presentational.

#### Section 6 — `Stepper` (`#architecture`)

The most complex interaction on the site.

- **Desktop, motion allowed** (`gsap.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)")`): `ScrollTrigger.create` **pins** the panel for `window.innerHeight × 2.6` of scroll with `scrub: true`. `onUpdate` maps scroll progress to `index = floor(progress × 6)`, sets `active`, and imperatively sets the progress-fill bar's width to `(index / 5) × 100 %`. The active dot enlarges to 24 px with the strong gradient; past dots become solid accent; future dots stay outlined. The copy panel below swaps with `AnimatePresence mode="wait"` (fade + 12 px rise, 400 ms).
- **Mobile / tablet / reduced motion:** the entire pinned section is hidden and replaced by a plain vertical Radix accordion of the same 6 steps.

The GSAP context is torn down with `ctx.revert()` on unmount.

#### Section 7 — `ExplorePanels`

Three buttons, `openIndex` defaults to `0` so the section is never empty on load. Each button carries `aria-expanded` and `aria-controls="explore-panel-detail"`. Clicking sets `openIndex`; the selected button flips to `bg-surface-tint` with a gradient numeral and a filled "Explore" chip. The detail region below is `aria-live="polite"` and animates `height: 0 → auto` (600 ms) — under reduced motion the height animation is skipped (`height: "auto"` both ways) and only opacity changes.

#### Section 8 — `ShowcaseWidget`

A gradient hero panel with:

- **"Get the App"** — `variant="glass"` button, **no handler and no href. Dead control.**
- **"Book a Demo"** — → `/login`.
- A floating glass widget with a hand-rolled SVG sparkline whose `pathLength` animates `0 → 1` over 1.1 s on first view, and a 3 s infinite `y: [0, -12, 0]` float (disabled under reduced motion).

#### Section 9 — `Resources` (`#resources`)

"See all" and all three article cards link to `#resources` — i.e. **they scroll to themselves. Placeholder links.** Hover scales the circular thumbnail 105 % over 700 ms and fades in an arrow badge.

#### Section 10 — `Testimonials`

A custom drag-scroll carousel:

- **Prev / Next buttons** call `track.scrollBy({ left: ±clientWidth × 0.7, behavior: "smooth" })`.
- **Pointer drag** is implemented manually with `onPointerDown/Move/Up/Cancel`, `setPointerCapture`, and direct `scrollLeft` manipulation. `event.pointerType === "touch"` returns early so touch devices use native momentum scrolling. Cursor toggles `cursor-grab` → `cursor-grabbing`.
- The featured card's rotated caption (`-rotate-[5deg]`) straightens to `rotate-0` on hover.
- ⚠️ All four testimonials are explicitly marked `PLACEHOLDER` in source ("Placeholder Name", "Placeholder Hospital"). They must be replaced with consented, attributed quotes before launch.

#### Section 12 — `Timeline`

- **Desktop:** a `300vh` scroll track with a `sticky top-0` panel. `useScroll` + `useMotionValueEvent` map progress to `index = floor(value × 4)`. The active year scales from `text-2xl` muted to `text-6xl`/`text-7xl` ink; the body paragraph crossfades via `AnimatePresence mode="wait"`; the placeholder image crossfades with `filter: hue-rotate(active × 14deg)`.
- **Mobile:** a plain stacked `<ol>` with a left rule and dot markers.
- **"Have a question?" chip** ⇢ opens `BookDemoDialog`.

#### Section 13 — `Interstitial`

Purely decorative. `useScroll` with offset `["start end", "end start"]` drives `scale: 0.88 → 1 → 1.08` and `opacity: 0 → 1 → 1 → 0.4` on a giant `18vw` wordmark. Under reduced motion it renders static at `opacity: 0.25`.

#### Section 14 — `ContactForm` (`#pricing`)

The primary lead-capture form, presented on a card rotated `-6deg` that straightens to `0deg` on hover.

| Field | `name` | Type | Required |
|---|---|---|---|
| Full name | `fullName` | text, `autocomplete=name` | yes |
| Clinic / hospital name | `organisation` | text, `autocomplete=organization` | yes |
| Work email | `email` | email, `inputMode=email` | yes |
| Phone | `phone` | tel, `inputMode=tel` | yes |
| Beds / OPD volume | `volume` | Radix Select (5 options) mirrored into a `<input type="hidden">` so the value stays in the native form payload | no |
| Message | `message` | textarea | no |

**Submit behaviour:** `handleSubmit` calls `event.preventDefault()`, then `setSubmitted(true)`. The source carries an explicit `// TODO: POST to the CRM / demo-request endpoint.` Nothing is transmitted. The form is replaced in place by a `role="status"` success panel reading *"Request received. A Nexclinic clinical solutions specialist will be in touch within one business day."* plus a **"Submit another request"** button that sets `submitted=false` and restores the blank form.

`BookDemoDialog` (used by the Timeline chip) is a separate, simpler 3-field version with the same behaviour and an even more explicit confirmation: *"(Demo form: not yet wired to a backend.)"*

#### `Footer`

Three link columns (Product / Company / Legal, 13 links total) and three social icons — **every single one is `href="#"`. All footer links are placeholders.**

---

### 2.2 `/login` — Portal picker

**Purpose:** The application's real entry point. Two-column split: brand story left, sign-in right.

**Left column (`min-h-[52vh]`, `lg:min-h-screen`):** blurred `/images/lungs.jpg` at 30 % opacity behind a rose→navy→blue gradient, with two `animate-aurora-a/b` blurred blobs. Content: eyebrow pill, gradient headline, 4 `PILLARS` bullets, 3 statistics, and an **"About the platform →"** link → `/`.

**Right column (white):**

| Element | Behaviour |
|---|---|
| Trust pill | Static — *"Front-end test build · demo credentials pre-filled"* |
| 5 role cards | → `/signin/{key}`. Staggered in at `0.15 + index × 0.06` s. Hover: `-translate-y-1`, shadow lift, icon tile `scale-110`, arrow `translate-x-1` |
| "Enter New Appointment" | ⇢ `NewAppointmentDialog` |
| Footer line | `CLINIC_INFO.name` · `CLINIC_INFO.hours` |

#### `NewAppointmentDialog` — pre-login booking (the first cross-portal flow)

Fields: Full name (required), Phone (required), Email (optional), Preferred clinician (`<select>` over `DOCTOR_OPTIONS`, held in ◧ state), Date (required), Time (required), Reason (required).

**On submit:**

1. `event.preventDefault()`
2. ⚡ `dispatch({ type: "appointment/request", appointment: { patientName, phone, email, reason, date, time, doctor: doctor.split(" — ")[0], source: "web" } })`
3. Reducer creates `{ id: uid("APT"), status: "pending", createdAt: Date.now() }`, **prepends** it to `state.appointments`, and appends a notice `{ to: "reception", kind: "phone", title: "New appointment request", body: "{name} · {date} at {time} · {doctor}" }`.
4. `PhoneToasts` picks up the `kind: "phone"` notice and slides a handset-style push in at the top-right, auto-dismissing after **6500 ms**.
5. ◧ `setSent(true)` replaces the form with an emerald confirmation panel containing a live link → `/reception/requests` ("You can watch it arrive in the front desk requests screen").
6. Closing the dialog (`onOpenChange`) resets `sent=false`, so reopening shows a fresh form.

The submit control is a `MorphButton` with `doneLabel="Sent to front desk"` — it morphs to a filled gradient state with a tick for 2200 ms.

---

### 2.3 `/signin/[role]` — Role sign-in

**Purpose:** Per-role entry. **No authentication is performed.**

Two visual treatments driven by `role.key === "admin"`:

- **Admin:** a light blue theme. One unified rounded card (`rounded-[2.5rem]`, 2 px `#16233f` border) with `AdminIllustrationBackground` bleeding continuously behind both columns, feathered by a horizontal `mask-image` gradient (`transparent 0% → 6%, black 42% → 100%`) so the illustration dissolves into the text zone with no seam. Decorative circles, a rounded square and a `MapPin` sit over the faded-out region. Two large soft blobs sit *outside* the card so its border clips them.
- **All four other roles:** the dark `#0B1020` aurora treatment matching `/login`.

Both treatments share the same content:

| Element | Behaviour |
|---|---|
| "All portals" | → `/login` |
| Role icon + heading | From `ROLES` config |
| 3 `highlights` bullets | Static, per role |
| Clinic info card | `CLINIC_INFO` — name, address, hours, phone, email, 6 department chips |
| **Username** | Pre-filled `role.demoUser`, `autocomplete=username` |
| **Password** | Pre-filled `role.demoPass`, `type=password`, `autocomplete=current-password` |
| "Keep me signed in" | `<input type="checkbox" defaultChecked>` — **uncontrolled, never read** |
| Submit `StretchButton` | See below |
| Switch-role chips | 4 chips → `/signin/{other-role}` |

**Submit behaviour:**

```ts
event.preventDefault();
setPending(true);                                   // button label → "Opening portal…", disabled
window.setTimeout(() => router.push(role.home),     // 600 ms, or 0 ms under reduced motion
                  reduced ? 0 : 600);
```

No credential is validated, stored, or transmitted. `pending` is never reset — the component unmounts on navigation.

**Demo credentials (`lib/roles.ts`):**

| Role | Username | Password | Lands on |
|---|---|---|---|
| Super Admin | `ananya.d` | `admin@2026` | `/admin/dashboard` |
| Surgeon | `priya.nair` | `surgeon@2026` | `/surgeon/dashboard` |
| Receptionist | `kavya.r` | `front@2026` | `/reception/dashboard` |
| Patient | `clara.martin` | `patient@2026` | `/patient/dashboard` |
| Inventory Manager | `divya.k` | `stock@2026` | `/inventory/dashboard` |

> **Security note.** Credentials are hardcoded in a client bundle and pre-filled into the form. This is acceptable for a demo build and must be removed before any deployment carrying real data.

**Implementation detail:** the page passes `roleKey` (a string), not the `RoleConfig` object, because `RoleConfig` carries a Lucide icon *component* which cannot cross the server → client boundary. `SignInView` re-resolves it with `findRole(roleKey)!`.

---
## 3. The Super Admin Portal (`/admin/*`)

### 3.0 Shared chrome — `AdminShell`

**Sidebar (`AdminSidebar`)**

- Width animates between `EXPANDED_WIDTH = 272` and `COLLAPSED_WIDTH = 88` via Framer `animate={{ width }}`, 300 ms.
- The icon column is a **fixed 88 px** regardless of state, so icons stay perfectly still while labels retract. Labels animate `width: auto → 0` + opacity (200 ms) inside `AnimatePresence`.
- **Collapse toggle** — a 28 px circular button pinned to the sidebar's right edge (`translate-x-1/2`), desktop only, carrying `aria-expanded` and `aria-controls="admin-sidebar"`. ◧ toggles `collapsed`, persisted to `localStorage["nexclinic:admin-sidebar-collapsed"]`.
- **When collapsed, every nav item and the logout button are wrapped in a Radix `Tooltip`** (`side="right"`, 120 ms delay) so labels remain discoverable.
- **The active-item "merge" effect** is a notable piece of CSS. The active pill is filled with the *page background* colour and rounded on the left only, flush to the sidebar's right inner edge — it reads as the content area carving a window into the sidebar. Two pseudo-elements above and below paint radial-gradient quarter-circles that produce concave notches, curving the pill back into the white sidebar. The whole curve is tuned by one variable, `--admin-notch: 20px`. The nav `<ul>` carries `py-5` specifically so the first and last items' notches are not clipped by the scroll container.
- Logo block → `/admin/dashboard`. Account block shows `ADMIN_PROFILE`. **"Log out" has no handler — dead control.**
- Mobile: `-translate-x-full` off-canvas, slid in by `drawerOpen`. `AdminShell` closes it on every `pathname` change, on `Escape`, and locks `document.body.style.overflow` while open.

**Header (`AdminHeader`)**

- Title and breadcrumb derive from `findNavItem(pathname)`, which matches exact `href` first and then `pathname.startsWith(href + "/")` — this is why `/admin/staff/ST-1` still shows "Staff / People".
- **Search input** — `id="admin-search"`, placeholder "Search patients, staff, invoices..." — **no `onChange`, no handler. Non-functional.**
- **Bell** (`aria-label="Notifications, 3 unread"`) and **Messages** buttons — **hardcoded, no handlers.** Note this is *not* the working `NoticeBell`; the admin panel does not use the live notice system in its header.
- **Account dropdown** (Radix) — "Profile" → `/admin/settings`, "Settings" → `/admin/settings`, "Log out" → **no handler.**

**Page transition:** `<motion.div key={pathname}>` fades and rises 8 px over 350 ms on every route change.

---

### 3.1 `/admin/dashboard`

**Sections:**

1. **`OversightTabs`** — 5 pills from `DASHBOARD_TABS`, each a `<Link>` → `/admin/analytics`, `/admin/staff`, `/admin/payroll`, `/admin/expenses`, `/admin/logs`. The active pill is a **shared-layout element** (`layoutId="oversight-active-pill"`) so on navigation it physically slides from the old tab to the new one with a spring (`stiffness: 380, damping: 32`) rather than swapping colour.
2. **Boundary note** — prose explaining that inventory lives in a separate portal, with a live link → `/inventory/dashboard`.
3. **"Download report"** ⬇ `DownloadButton` → `downloadPdf("nexclinic-oversight-summary", …)`. Contents: revenue this month, visits this month, active/total staff, net payroll, pending requests, and the full 12-month revenue series. **Derived live from the store** — `activeStaff`, `payrollTotal` (sum of `netPay(...).net` across all staff) and `pendingRequests` are computed at click time.
4. **4 KPI cards** — Revenue this month (`₹92 L`), Patient visits (`3,240`), Active staff (live count), Payroll net (live `₹x.x L`). The first two are static from `admin-metrics`; the last two are live from the store.
5. **Monthly revenue chart** — `TwoLineChart`, this year vs last year (dashed), with a descriptive `ariaLabel` narrating the trend. Action: `ChevronButton` → `/admin/analytics`.
6. **Patient visits chart** — total visits vs new patients (dashed). Action: ⬇ CSV `patient-visits.csv` with headers `Month, Visits, New patients`.
7. **Recent patient payments table** — 6 rows from `PAYMENT_HISTORY`, columns Reference / Patient / Against / Amount (right-aligned, tabular) / Mode / Status (`StatusBadge`). Wrapped in `TableScroll` (`min-w-[720px]`, own `overflow-x-auto`, `role="region"`, `tabIndex={0}`) so the page never scrolls sideways. "Full history" → `/admin/logs`.

---

### 3.2 `/admin/staff`

**Controls:**

| Element | Behaviour |
|---|---|
| Search input | ◧ `query`, filters live on name ∥ role ∥ dept, case-insensitive |
| Department `FilterSelect` | ◧ `dept`; options are derived at runtime: `["All departments", ...new Set(staff.map(m => m.dept))]` — a newly added department appears in the filter immediately |
| **"Add Staff"** `GradientButton` | ⇢ `AddStaffDialog` |
| Staff cards | → `/admin/staff/{id}`. Hover `-translate-y-1` + pink border + `shadow-admin-lg` |
| Empty state | When `rows.length === 0`, an `EmptyState` replaces the grid: *"No matching staff — try a different search term or clear the department filter."* |

Each card shows avatar, name, designation, `StatusBadge` (Active/Inactive), and a `<dl>` of Department / Shift / Access role.

**`AddStaffDialog` — 9 fields → one dispatch**

Full name, Designation, Department, Access role (`<select>`: Super Admin / Surgeon / Receptionist / Inventory / Nurse), Phone, Email, Shift start (`09:00`), Shift end (`17:00`), Base pay (`50000`).

⚡ `dispatch({ type: "staff/add", member: {...} })` with **derived and hardcoded values**:

- `username` = `name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")` — e.g. *"Dr. Anil Kumar"* → `dr.anil.kumar`
- `days` = `["Mon","Tue","Wed","Thu","Fri"]` (not configurable in the form)
- `salary` = base from the form; **`hra: 9000`, `allowance: 4000`, `bonus: 0`, `taxPercent: 10` are hardcoded**
- `active: true`

The reducer computes `initials` from the name, assigns `uid("ST")`, prepends the record, and pushes a `{ to: "staff", kind: "phone" }` welcome notice → a toast appears reading *"Welcome to Nexclinic — {name}: your {accessRole} account is ready. Username {username}."*

The form is then replaced by a confirmation with a link → `/admin/access`.

---

### 3.3 `/admin/staff/[id]`

**"All staff"** → `/admin/staff`.

**Identity card:** avatar, name, role · dept, phone, email, `StatusBadge`.

**Shift timings card**

- Two `<input type="time">` bound to ◧ `start` / `end`, re-synced by a `useEffect` on `[member.shiftStart, member.shiftEnd, member]` so an external change to the record flows back into the fields.
- Working-day chips are **read-only** — rendered from `member.days`, not editable here.
- **"Save and notify"** `MorphButton`, `doneLabel="Notified"`, `disabled={!dirty}` where `dirty = start !== member.shiftStart || end !== member.shiftEnd`. When not dirty, a helper reads *"No changes to save."*
  ⚡ `{ type: "staff/shift", id, shiftStart, shiftEnd }` → updates the record **and** pushes `{ to: "staff", kind: "phone", title: "Shift updated · {name}", body: "New shift {start}–{end}. Sent to {phone}." }` → a handset toast.
- An inline notice explains exactly this: *"Saving a change pushes a notification to {phone}. In this build that appears as a handset-style toast in the corner."*

**Salary card**

- `<dl>` of Basic / HRA / Allowances / Bonus, then Tax (negative) and Net pay, all computed by `netPay(salary)`: `gross = base + hra + allowance + bonus`, `tax = round(gross × taxPercent / 100)`, `net = gross − tax`.
- ⬇ **"Slip"** → `downloadPdf("salary-slip-{id}", …)` — employee id, department, shift, working days, full breakdown, and the disclaimer *"Sample output generated in the browser. Not a statutory payslip."*
- "Edit in payroll →" → `/admin/payroll`.

**Portal access card**

- Radix `Switch`, `checked={member.active}`, `aria-label="Portal access for {name}"`.
  ⚡ `{ type: "staff/access", id, active }` → flips `active` **and** pushes `{ to: "staff", kind: "phone", title: "Access restored" | "Access suspended" }`. This is a **live two-way binding** — the same switch on `/admin/access` reflects the change instantly.
- Username shown in monospace.

**Not-found path:** if the id is absent from the store, the whole page renders an `EmptyState` — *"Staff member not found. This record may have been removed. Head back to the staff list."*

---

### 3.4 `/admin/payroll`

**Cycle summary card**

- Cycle label: hardcoded "September 2026".
- ⬇ **"Register"** → CSV `payroll-register.csv`, 9 columns (`Staff, Role, Basic, HRA, Allowances, Bonus, Tax %, Gross, Net`), computed per row.
- **"Run payroll"** `MorphButton`, `doneLabel="Payroll run"`. Sets ◧ `running=true`, label becomes "Running…", and a `setTimeout` clears it after 1600 ms. **It dispatches nothing and changes no data.** Purely a visual simulation.
- 4 summary tiles: staff count, Gross, Tax deducted, Net payable — all reduced live over `state.staff`.

**Salary slips accordion**

- One row per staff member. The row is a `<button aria-expanded>` showing avatar, name, role · dept, net pay, `StatusBadge` (`Paid` if active, `Pending` if not), and a chevron that rotates 180° when open. `openId` defaults to the **first** staff member, so one slip is open on load. Clicking the open row collapses it (`setOpenId(null)`).
- **`SlipEditor`** (rendered only when open): 5 number inputs — Basic, HRA, Allowances, Bonus, Tax (%). Each writes into a ◧ `draft: Salary`. Gross / Tax / Net recompute **live** as you type.
  - ⬇ **"Slip"** → PDF built from the **draft**, not the saved record — so you can preview an unsaved adjustment.
  - **"Save slip"** `MorphButton`, `disabled` unless `JSON.stringify(draft) !== JSON.stringify(member.salary)`. ⚡ `{ type: "staff/salary", id, salary: draft }`. This action **does not** push a notice.
  - ⚠️ `SlipEditor` initialises `draft` from `member.salary` in `useState` and never re-syncs. Because it unmounts when the row collapses, this is not observable in practice, but it is a latent staleness bug if the row is ever kept mounted.

**Recent monthly payroll reports table:** 4 closed cycles from `PAYROLL_CYCLES` — Cycle / Processed / Staff / Total / Status. Read-only.

---

### 3.5 `/admin/access`

**Header row:** live prose (*"{active} of {total} logins are active…"*), ⬇ **"Export"** → CSV `portal-credentials.csv` (`Name, Username, Access role, Scope, Status`), and **"Add new staff"** ⇢ `AddCredentialsDialog`.

**`ROLE_SCOPE` map** — makes the portal boundary explicit in the UI:

| Access role | Scope shown |
|---|---|
| Super Admin | `/admin · no inventory` |
| Surgeon | `/surgeon` |
| Receptionist | `/reception` |
| Inventory | `/inventory only` |
| Nurse | `/reception (read-only)` |

**Credentials table** (`min-w-[860px]`): Staff (avatar + name + role) / Username (mono) / Access role (with shield icon) / Scope (mono) / Status badge / Login-enabled controls.

Per row:

- **Reset-password button** (`RefreshCw`, `aria-label="Reset password for {name}"`) — **no handler. Dead control.**
- **`Switch`** — ⚡ `{ type: "staff/access", id, active }`, identical to the toggle on the staff profile. Flipping it here immediately changes the badge, the header count, and pushes a phone toast.

**`AddCredentialsDialog`:** 5 fields (name, designation, department, portal access, phone). On submit it ⚡ `staff/add` with a **generated username** (same slug rule) and a **generated temporary password**: `` `${accessRole.split(" ")[0].toLowerCase()}@${new Date().getFullYear()}` `` — e.g. Nurse → `nurse@2026`, Super Admin → `super@2026`. Email is derived as `{username}@nexclinic.health`. Salary defaults to `{ base: 50000, hra: 9000, allowance: 4000, bonus: 0, taxPercent: 10 }`.

The dialog then displays the issued username and temporary password in a `role="status"` panel. ⚠️ Displaying a plaintext temporary password in the UI is acceptable only for a demo; production must use an out-of-band invitation flow.

---

### 3.6 `/admin/analytics`

**Range tabs** — Radix `Tabs` (Daily / Monthly / Yearly), `value` bound to ◧ `range: RangeKey`. Switching the range re-derives **three things at once**: `sources = REVENUE_BY_SOURCE[range]`, `series = REVENUE_SERIES[range]`, and `total = sum(series)`. Radix unmounts inactive panels, so `TabsContent`'s fade-and-rise entrance replays on every switch.

**Two downloads, both range-aware:**

- ⬇ **CSV** → `revenue-{range}.csv`, headers `Period, Revenue (₹ lakh)`.
- ⬇ **"Export report"** → `nexclinic-revenue-{range}.pdf` — total in range, the source split as percentages, and the full labelled series.

**Charts:**

- Line chart of the active series, `ariaLabel` regenerated per range.
- `DonutChart` + `DonutLegend` of revenue by source, with a generated `ariaLabel` listing every slice and percentage.
- **Source breakdown** — a hand-built bar list. Each bar is a `role="img"` with `aria-label="{name}: {value} percent of revenue"`, and its width transitions over 700 ms when the range changes.

---

### 3.7 `/admin/logs`

Two Radix tabs sharing one card: **Revenue history** and **Patient payments**.

- The **export button swaps with the tab** — a conditional on `tab === "revenue"` renders either the revenue-history exporter (⬇ `revenue-history.csv`, 6 columns) or the payments exporter (⬇ `patient-payments.csv`, 7 columns).
- Each tab's `CardHeading` shows a computed total: `₹{sum} recorded` / `₹{sum} settled`.
- Both tables are read-only, wrapped in `TableScroll` at `min-w-[860px]`, with `<TableCaption>` for screen readers.
- Payment rows render a `StatusBadge` mapping `Settled → success`, `Pending → warning`, `Refunded → info`.

Data is entirely static (`REVENUE_HISTORY`, `PAYMENT_HISTORY`) — **bills raised at the front desk do not appear here.** This is a real gap: `state.bills` grows at `/reception/billing` but the admin payment log never reads it.

---

### 3.8 `/admin/expenses`

**Net profit header:** `revenue = MONTHLY_REVENUE[last].revenue × 100000` (₹ lakh → ₹), `netProfit = revenue − totalExpenses`, `margin = (netProfit / revenue × 100).toFixed(1)`. The margin chip uses a `TrendingDown` icon `rotate-180` to render an up-arrow.

- **Month `FilterSelect`** (4 options) — ◧ `month`. **It changes the ledger's caption and the export filename, but not the data.** `EXPENSES` is a single static array; there is no per-month dataset. This is a known limitation to flag for backend wiring.
- ⬇ **"Export ledger"** → `expenses-{month-slug}.csv` (`Head, Detail, Category, Amount`).
- **4 tiles:** Revenue (emerald), Total expenses (rose), Payroll, Utilities — the latter two summed by filtering `EXPENSES` on `category`.
- **Ledger table:** Head / Detail / Category / Amount / **Share**, where Share is computed per row as `(amount / totalExpenses × 100).toFixed(1)%`.

---

### 3.9 `/admin/settings`

Five Radix tabs, `defaultValue="profile"`.

| Tab | Contents | Submit behaviour |
|---|---|---|
| **Clinic profile** | Name, Address, Phone, Email, Opening hours — all `defaultValue` from `CLINIC_INFO` | `onSubmit` → `preventDefault()` only. `MorphButton doneLabel="Profile saved"`. **Nothing is persisted.** |
| **Billing & GST** | GSTIN (`29ABCDE1234F1Z5`), GST rate (`12`, min 0 max 28), Consultation fee (`800`), Invoice prefix (`BILL-`) | Same — `preventDefault()` only. Also carries ⬇ **"Bill register"** → CSV of `state.bills` (`Bill, Patient, Clinician, Total, Raised`) — **the one control on this page that reads live data** |
| **Roles & permissions** | 5 rows (role, scope, `Switch defaultChecked={row.edit}`) | Switches are **uncontrolled and never read**. Closing prose restates the admin/inventory boundary |
| **WhatsApp** | `Switch` bound to ◧ `whatsapp` (default on) — its helper text changes between *"Enabled — clinicians can send a report straight from the consultation screen"* and *"Disabled — the send button is hidden…"*. Plus business number and template fields | The claim is **aspirational**: `ConsultationView` renders its WhatsApp button unconditionally. This toggle has no cross-page effect |
| **Backups** | `Switch` bound to ◧ `autoBackup` (default on), 3 static backup rows, **"Run backup now"** `MorphButton doneLabel="Backup queued"` | No side effect |

---

## 4. The Surgeon Portal (`/surgeon/*`)

### 4.0 Shared chrome

`PortalShell theme="clinic" backdrop="grid"` with `SURGEON_NAV` (5 items), `NoticeBell audience="surgeon"`, and — mounted in the segment layout — `ScheduleSurgeryFab`.

Note that `SURGEON_NAV`'s "Consultation" entry is hardcoded to `/surgeon/consultation/p-1001`. The rail therefore always links to Clara Martin's consultation regardless of who you were just viewing, and `pathname === item.href` means the item only shows as active on that one patient.

#### `ScheduleSurgeryFab` (fixed `bottom-5 right-5`, `z-[90]`)

Enters with a scale-in after a 0.3 s delay. Label collapses to "Surgery" below `sm`.

⇢ Dialog with: Patient (`<select>` over all `PATIENTS`), Procedure (required), Date, Time, Theatre (`OT 1 / OT 2 / Day-care OT / Cath lab`), and Prep notes.

⚡ `{ type: "surgery/schedule", patient, procedure, date, time, theatre, notes }`. **The reducer stores nothing** — this action produces *only* a notice: `{ to: "reception", kind: "phone", title: "OR prep required", body: "{procedure} for {patient} · {date} {time} · {theatre} · {notes}" }`. The scheduled surgery itself is not persisted anywhere. In a real system this action must also create a theatre-booking record.

Success state: an emerald panel — *"OR prep sent. The front desk has been notified and will confirm theatre readiness."*

#### `NoticeBell`

Per-portal notification centre reading `useNotices(audience)`, which filters `state.notices` by `to`. The badge shows the unread count (capped at "9+"). **Opening the panel calls `markAllRead()`** (⚡ `notice/readAll` scoped to that audience), so the badge clears on open. A full-screen invisible button behind the panel closes it on outside click. Empty state: an inbox icon and *"Nothing here yet."*

---

### 4.1 `/surgeon/dashboard`

**Live derivations from the store:**

```ts
queue              = sortQueue(state.queue)
nextUp             = queue.find(e => e.state !== "done") ?? queue[0]
todaysAppointments = state.appointments.filter(e => e.status === "approved")
activePatients     = queue.filter(e => e.state !== "done").length
avgWait            = round(sum(queue.waitMinutes) / queue.length)
```

`sortQueue` is the shared ordering rule, exported from the store: **in-consult first, then priority rank (high 0 / medium 1 / low 2), then arrival time.** It is computed on read, never stored — so a priority change made at reception instantly re-orders the surgeon's list too.

**Sections:**

1. **Patient database search** — ◧ `query`, matched against `name ∥ condition ∥ id` across **all** `PATIENTS`, not just today's list. Results render only while `query.trim()` is truthy, inside an `aria-live="polite"` list. Each result → `/patients/{id}`. No match → *"No patient matches "{query}"."*
2. **3 stat tiles** (`PLinkCard` — the whole card is the hit target): Today's appointments → `/surgeon/patients`; Active patients → `/surgeon/patients`; **Average wait time → `/reception/dashboard`** (a deliberate cross-portal jump).
3. **"Next up" gradient panel** — name, reason, token, priority, and a white-on-gradient `StretchButton` **"Start consultation"** → `/surgeon/consultation/{nextUp.patientId ?? "p-1001"}`. The whole panel is omitted when the queue is empty.
4. **Today's list** — every queue entry as a row → `/surgeon/consultation/{patientId ?? "p-1001"}`. In-consult rows get an accent border and soft fill. Priority maps to a `PPill` tone (`high → Critical`, `medium → Follow-up`, `low → Stable`).
   ⬇ **"Export"** → `todays-list.csv` (`Token, Patient, Reason, Priority, State`).
5. **Quick action panel** — 3 links (AI Scribe → `/surgeon/scribe`; Today's appointments → `/surgeon/patients`; Report history → `/surgeon/reports`) plus a `ConicButton` **"Open AI scribe"** → `/surgeon/scribe`.
6. **Approved appointments** — first 5 approved appointments; `ChevronButton` "All patients" → `/surgeon/patients`. Empty: *"Nothing approved yet — the front desk confirms requests."*
7. **Reports card** (`PLinkCard`) → `/surgeon/reports`.

---

### 4.2 `/surgeon/patients`

- ⬇ **"Export"** → `patient-database.csv` (`ID, Name, Age, Sex, Blood type, Condition, Status`) — exports **all** `PATIENTS`, not the filtered subset.
- Search input filters ◧ on name ∥ condition ∥ id.
- Each row: avatar, a `<Link>` on the name block → `/patients/{id}`, a status `PPill`, and a compact `StretchButton` **"Start"** → `/surgeon/consultation/{id}`. Two distinct destinations from one row.
- Right rail: today's approved appointments, `ChevronButton` "Requests" → `/reception/requests` (cross-portal).

---

### 4.3 `/surgeon/consultation/[id]` — the clinical workspace

This is the most state-heavy screen in the application. It reads `state.charts[patientId]` (falling back to `EMPTY_CHART`) and maintains **five** pieces of local draft state: `editingVitals`, `vitalsDraft`, `dietDraft`, `newDietLine`, `notes`. A `useEffect` on `[chart.vitals, chart.diet, chart.notes]` re-syncs all drafts whenever the stored chart changes underneath — which is exactly what happens when the AI Scribe signs a note into this patient's chart from another screen.

**Demographics card**

8-field `<dl>` (Age, Sex, Blood type, Weight, Height, Phone, Registered, Clinic). Action row:

| Control | Behaviour |
|---|---|
| `ChevronButton` "View full patient history" | → `/patients/{id}` |
| `FlyButton` **"Send report to WhatsApp"** (emerald) | ⚡ `notice/push` → `{ to: "patient", kind: "phone", title: "Report sent on WhatsApp", body: "{name}: your consultation summary from {doctor} is on its way." }`, then ◧ `sentToWhatsapp=true` for 3000 ms, which renders an inline *"Sent to {phone}"* confirmation with a tick. The icon "flies off and returns" on hover. **Nothing is actually sent.** |
| `DownloadButton` **"Summary PDF"** ⬇ | `consultation-{id}.pdf` — demographics, **the saved chart's vitals**, the *current unsaved* `notes` value, the *current unsaved* `dietDraft`, and the disclaimer *"Sample output generated in the browser. Not a medical record."* Note the deliberate mix: vitals come from the store, notes and diet from the drafts |

**Vitals card**

- Read mode: a grid of tiles showing label / value / unit.
- **"Edit"** → ◧ `editingVitals=true`, which swaps every value into a controlled `<Input aria-label={vital.label}>` and swaps the header action for a two-button group.
- **"Save vitals"** `MorphButton doneLabel="Saved"` → ⚡ `{ type: "chart/vitals", patientId, vitals: vitalsDraft }` then `setEditingVitals(false)`.
- **Cancel (X)** (`aria-label="Cancel editing vitals"`) → restores `vitalsDraft = chart.vitals` and exits edit mode, discarding the edit.

**Medical records card**

- Read-only list of `patient.visits` (title, doctor · kind, date). `ChevronButton` "Full record" → `/patients/{id}`.
- **Clinical note** — a controlled `<Textarea>` bound to ◧ `notes`.
  - **"Save note"** `MorphButton doneLabel="Note saved"` → ⚡ `{ type: "chart/notes", patientId, notes }`.
  - "Draft it with the AI scribe →" → `/surgeon/scribe`.

**Diet plan card**

- Each line is an editable `<Input aria-label="Diet line {n}">` writing into ◧ `dietDraft`, with a **delete button** (`aria-label="Remove diet line {n}"`) that splices it out.
- A **sub-form** at the bottom: an input plus a gradient `+` submit (`aria-label="Add diet instruction"`). Submitting appends `newDietLine.trim()` to `dietDraft` and clears the input; empty input is a no-op.
- **"Save plan"** `MorphButton doneLabel="Plan saved"`, `disabled={JSON.stringify(dietDraft) === JSON.stringify(chart.diet)}` — a deep-equality dirty check, so the button is genuinely disabled until something differs.
  ⚡ `{ type: "chart/diet", patientId, diet: dietDraft }`.
- Empty: *"No diet plan recorded yet."*

---

### 4.4 `/surgeon/scribe`

**Patient selector:** 4 toggle buttons (`aria-pressed`). Selecting one sets ◧ `patientId` **and calls `reset()`** — clearing the transcript, stopping listening, and blanking the note. The selected card is filled with the portal gradient.

**Live transcript panel**

- **"Start listening"** → ◧ `visible=0`, `listening=true`. A `setInterval` reveals one more `TRANSCRIPT` line every **1400 ms**; when `count >= TRANSCRIPT.length` (7 lines) it auto-stops by setting `listening=false`. The interval is cleared on unmount and on `listening` change.
- **"Stop listening"** (rose) replaces the start button while running.
- Status line: a `Waves` icon that gains `animate-pulse` and accent colour while listening, with text switching between *"Listening to the consultation with {name}…"* and — importantly — *"Idle. No audio is captured in this build — the transcript is scripted."*
- The list is `aria-live="polite"`. Doctor lines are gradient-filled and left-aligned; patient lines are `ml-auto` on soft background. Before starting: *"Press start to begin the consultation."*

**Generated SOAP note panel**

- **"Generate note"** `MorphButton doneLabel="Drafted"`, **`disabled={visible === 0}`** — you cannot draft before transcription begins. It writes a static `SOAP_TEMPLATE(patient.name)` into ◧ `note`. There is no model call.
- The note is a fully editable monospace `<Textarea>`.
- **"Sign into record"** `MorphButton doneLabel="Signed into record"`, `disabled={!note}` → ⚡ `{ type: "chart/notes", patientId, notes: note }`. **This is the cross-screen link:** the consultation screen for that patient reads the note back via its re-sync effect.
- ⬇ **"Download"** → `soap-note-{id}.pdf`, using `note || SOAP_TEMPLATE(...)` so it works even before generating.
- `ChevronButton` "Open consultation" → `/surgeon/consultation/{id}`.
- Standing caption: *"Drafts require clinician review and sign-off."*

---

### 4.5 `/surgeon/reports`

**Three composable filters**, all ◧, combined in one `useMemo`:

1. **Patient chips** — "All patients" plus one chip per patient (first name only), `aria-pressed`.
2. **Search box** — matches `title ∥ patient ∥ summary`.
3. **Type `<select>`** — `REPORT_KINDS`: All types / Lab / Imaging / Discharge / Consultation / Prescription.

⬇ **"Export index"** → `report-history.csv` (`Reference, Patient, Report, Type, Issued, By`) — **exports `rows`, i.e. the currently filtered set.** (Contrast with `/surgeon/patients`, which exports everything.)

**Report cards** (2-up grid). Icon per kind (`Lab → FlaskConical`, `Imaging → Scan`, `Discharge → FileText`, `Consultation → Stethoscope`, `Prescription → Pill`). Footer carries: a patient link → `/patients/{patientId}`, ⬇ **"PDF"** → `report-{id}.pdf` (reference, type, reporter, summary, disclaimer), and `ChevronButton` **"Open"** → `/surgeon/consultation/{patientId}`.

Empty: *"No reports match these filters."* spanning both columns.

---

## 5. The Reception Portal (`/reception/*`)

### 5.1 `/reception/dashboard` — the front desk

**Header actions:** `EmergencyButton` + `NoticeBell audience="reception"`.

#### `EmergencyButton` — the broadcast path

A rose pill with a pulsing dot (`motion-safe:animate-pulse-ring`). ⇢ Dialog with two pre-filled required fields: Location (`"Reception, Ground Floor"`) and What is happening (`"Walk-in collapse near the triage desk"`).

⚡ `{ type: "emergency/broadcast", location, detail }` — the reducer prepends **two** notices in one action:

1. `{ to: "surgeon", kind: "phone", title: "EMERGENCY — respond now" }`
2. `{ to: "admin", kind: "system", title: "Emergency raised at the front desk" }` — timestamped `at + 1` to guarantee ordering.

Because the second is `kind: "system"`, **only the surgeon notice raises a toast**; the admin one is in-app only, visible through a `NoticeBell audience="admin"` — which no page currently mounts. The success panel links → `/surgeon/dashboard` so you can watch it land.

#### Stat tiles (4, all `PLinkCard`)

In the queue → `/reception/dashboard` · Pending requests → `/reception/requests` · Average wait → `/reception/dashboard` · Bills raised today (`state.bills.length`) → `/reception/billing`.

#### Patient queue — the priority mechanism

Caption: *"The list re-orders itself the moment a priority changes — high first, then by arrival time."*

Per row:

- Token chip, avatar, a name `<Link>` → `/patients/{patientId}` (falls back to `/reception/dashboard` when the entry has no `patientId` — i.e. a walk-in added at runtime).
- State `PPill`: In consult / Waiting / Done.
- **Three priority buttons** (low / medium / high), each `aria-pressed`. Clicking ⚡ `{ type: "queue/priority", id, priority }`. Because the render calls `sortQueue(state.queue)` on every pass, **the row physically jumps to its new position immediately.** Active priority styling: high = solid rose, medium = solid amber, low = soft fill.
- A position indicator on the right: "Top of queue" with an up-arrow for index 0, "Position {n}" with a down-arrow otherwise.

⬇ **"Export"** → `patient-queue.csv` (`Token, Patient, Reason, Priority, Arrived, State`).

**"Add walk-in"** → ◧ `walkInOpen=true` ⇢ dialog with Patient name, Reason, Priority `<select>` (default `medium`).
⚡ `{ type: "queue/add", name, reason, priority }` → the reducer derives 2-letter initials, assigns token `A-{18 + queue.length}`, sets `arrivedAt` from `new Date().toTimeString().slice(0,5)`, `waitMinutes: 0`, `state: "waiting"`, **appends** (not prepends — arrival order matters), and pushes `{ to: "surgeon", kind: "system", title: "Walk-in added to queue" }`.

#### Side rail

Pending requests preview (first 4) with `ChevronButton` "Action them" → `/reception/requests`; empty state is an emerald *"Nothing waiting on you."* Two `PLinkCard`s → `/reception/onboarding` and `/reception/billing`, each with copy explaining the downstream effect.

---

### 5.2 `/reception/requests`

**Filter tabs** — Radix `Tabs value={filter}`: Pending / Approved / Declined / All. Filtering is a plain `state.appointments.filter`.

⬇ **"Export"** → `appointment-requests.csv`, 9 columns (`Reference, Patient, Phone, Reason, Date, Time, Clinician, Source, Status`) — **always the full list**, regardless of the active tab.

**Per request card:** patient name, status `PPill` (`pending → Waiting`, `approved → Resolved`, `declined → Critical`, `completed → Stable`), a source chip (`web` / `walk-in` / `phone` / `telehealth`), reason, and a metadata row (date · time, clinician, phone, mono reference).

**Actions — only rendered when `status === "pending"`** (otherwise the card shows *"No action outstanding"*):

| Control | Dispatch | Downstream effect |
|---|---|---|
| **Reschedule** | ◧ `setReschedule(entry.id)` ⇢ dialog | See below |
| **Approve** `MorphButton doneLabel="Approved"` | ⚡ `appointment/approve` | Status → `approved`; pushes `{ to: "patient", kind: "phone", title: "Appointment confirmed", body: "{date} at {time} with {doctor}" }` → toast. The appointment now appears in the surgeon's "Approved appointments" and the patient's "Upcoming" |
| **Decline** | ⚡ `appointment/decline` | Status → `declined`; pushes `{ to: "patient", kind: "phone", title: "Appointment declined", body: "…the requested slot is unavailable. Please pick another." }` |

**Reschedule dialog** — pre-filled date and time (`defaultValue` from the target). Submitting ⚡ `{ type: "appointment/reschedule", id, date, time }`, which sets the new slot **and flips the status to `approved` in the same action**, then pushes `{ to: "patient", kind: "phone", title: "Appointment rescheduled" }`. Rescheduling is therefore also an approval.

Empty state: an inbox icon and *"Nothing in this view — new requests appear here the moment someone books from the homepage."*

---

### 5.3 `/reception/billing` — the stock-coupling screen

**"Bill for" card:** Patient `<select>` (over `PATIENTS`), Clinician `<select>` (over `DOCTOR_OPTIONS`, value stripped to the name before the em-dash), Consultation fee `<input type="number">` (default 800, `Number(...) || 0` guards NaN).

**"Add medicines and supplies":** a search box filtering `state.stock` to `category ∈ { Medicine, OT Supply }`, **capped at 6 results** (`.slice(0, 6)`). Each result shows live quantity and unit price, a `Low` pill when `isLow(item)`, and an **"Add"** button that is `disabled` when `item.qty === 0`.

`addLine` is quantity-aware: adding an item already in the cart increments its `qty` by 1 rather than duplicating the line.

**Checkout card (`sticky top-4`):**

- Per line: name, unit price, a `<Input type="number" min={1} aria-label="Quantity of {name}">` clamped with `Math.max(1, ...)`, and a remove button (`aria-label="Remove {name}"`).
- Totals `<dl>`: Medicines (`Σ qty × price`), Consultation, **Total**.
- **"Generate bill"** `MorphButton doneLabel="Bill generated"` — this single click performs **five** operations:
  1. Generates `ref = "BILL-" + floor(4400 + random()×500)`.
  2. ⚡ `{ type: "bill/create", bill: { patientName, doctor, lines, consultFee, total } }` — the reducer assigns its own `uid("BILL")` id and a date stamp.
  3. If the cart is non-empty, ⚡ `{ type: "stock/consume", lines: [{ stockId, qty }], ref }`.
  4. ◧ `setLastBill(ref)`, revealing a **"Print {ref}"** download button.
  5. ⬇ Immediately calls `printBill(ref)` — the PDF downloads without a second click.
  Then clears the cart.

> ⚠️ **Two data-integrity notes.** (a) The `ref` used in the stock log is *not* the `bill.id` the reducer generates — the audit trail and the bill register use different identifiers. (b) `ref` uses `Math.random()`, so collisions are possible. Both must be resolved by a server-issued invoice number.

**What `stock/consume` does in the reducer** — this is the heart of the cross-portal coupling:

```
1. Map over stock, subtracting each line's qty (floored at 0 via Math.max).
2. Diff before/after with isLow(): find items that crossed their reorder level
   *because of this bill* (low now, not low before).
3. If any did → prepend { to: "inventory", kind: "phone",
     title: "Stock dropped below reorder level",
     body: "Item · N left, Item · N left" }        → a push toast
4. Append a stock log { kind: "issue",
     detail: "Paracetamol ×20, Sutures ×2 issued against BILL-4xxx",
     by: "Front desk" }                            → visible at /inventory/logs
```

The card closes with an amber advisory explaining exactly this, with a live link → `/inventory/stock`.

**Recent bills table:** reads `state.bills` — so a bill raised seconds ago appears here immediately. Columns: Bill / Patient / Clinician / Total (right, tabular) / Raised.

---

### 5.4 `/reception/onboarding`

**Desk scanner card:** a `QrPlaceholder` — a deterministic 21×21 grid generated by an LCG (`state = (state × 1103515245 + 12345) % 2^31`, cell on when `state % 100 > 47`) with hand-drawn finder patterns. It carries `role="img"` and a label that **explicitly says it is not scannable**, rather than pretending to be a working code. The URL `nexclinic.health/onboard/kmg-desk-01` is displayed as text.

**Onboarding assistant — a 5-step scripted chatbot**

| Step | `key` | Question | Placeholder |
|---|---|---|---|
| 1 | `name` | "Hello! Welcome to Nexclinic. What is your full name?" | Rohit Malhotra |
| 2 | `phone` | "Thanks. What mobile number can we reach you on?" | +91 98450 00000 |
| 3 | `age` | "And your age?" | 34 |
| 4 | `reason` | "What brings you in today?" | Fever and sore throat since Tuesday |
| 5 | `priority` | "Last one — how urgent does it feel? Type low, medium or high." | medium |

- Submitting an empty/whitespace answer is a **no-op** (`if (!draft.trim()) return`).
- Each answer is stored in ◧ `answers[key]` and rendered as a gradient right-aligned bubble; the next bot question then appears.
- **On the final step** the priority is parsed defensively: `["low","medium","high"].includes(next.priority?.toLowerCase()) ? that : "medium"` — any unrecognised text silently becomes `medium`.
  ⚡ `{ type: "queue/add", name, reason, priority }` — the same action as the walk-in dialog, so the patient lands in the live queue and a `{ to: "surgeon", kind: "system" }` notice fires.
- ◧ `done=true` appends an emerald closing bubble: *"Thank you, {name}. You are in the queue — please take a seat and watch the board for your token."*
- **"Start over"** (header) and **"Onboard the next walk-in"** (`MorphButton doneLabel="Ready"`) both call `reset()`, clearing step, answers, draft and done.
- A `useEffect` on `[step, done]` scrolls the log to the bottom with `behavior: "smooth"`. The log is `aria-live="polite"`.
- Progress caption: *"Step {n} of 5."*

⚠️ **`age` and `phone` are collected but never used** — `queue/add` accepts only name, reason and priority. Those two answers are discarded.

---

## 6. The Patient Portal (`/patient/*`) and shared profile

### 6.1 `/patient/dashboard`

Identity is fixed: `SIGNED_IN_PATIENT = PATIENTS[0]` (Clara Martin). There is no session.

`upcoming` filters `state.appointments` by `patientName === patient.name && status ∈ { approved, pending }` — **name matching, not id matching**, which is fragile but consistent with the demo data.

**Profile card** — avatar, name, status pill, patient id · registered date, and a 4-field `<dl>` (Age, Blood type, Phone, Email). Action row:

| Control | Behaviour |
|---|---|
| **Change password** | ◧ `passwordOpen=true` ⇢ dialog: current / new / confirm. `onSubmit → preventDefault()` only. `MorphButton doneLabel="Password updated"`. The dialog description states plainly: *"Front-end demo — no credential is stored or checked in this build."* **No validation, no matching check** |
| **Refer a friend** | ◧ `referOpen=true` ⇢ dialog with a seeded `QrPlaceholder` (`seed = patient.id.length × 13`), the link `nexclinic.health/join/{id}`, and a **"Copy referral link"** `MorphButton doneLabel="Link copied"` — ⚠️ **it does not call the clipboard API.** It only animates to a "copied" state |
| **"Summary"** ⬇ | `health-summary-{id}.pdf` — age, blood type, clinician, condition, and every upcoming appointment with its status |

**Quick actions (4 tiles)** — three open dialogs, one navigates:

| Tile | Behaviour |
|---|---|
| **Refill** | ⇢ Refill dialog |
| **Book visit** | ⇢ Booking dialog, `source: "web"` |
| **View record** | → `/patient/records` (a `<Link>`, not a button) |
| **Telehealth** | ⇢ the *same* booking dialog, `source: "telehealth"` |

**Refill dialog:** a checkbox list over `state.stock` filtered to `category === "Medicine"`, showing price and live "low stock" / "in stock". ◧ `refillItems: string[]` toggles by name. The submit is `disabled={refillItems.length === 0}` and its label pluralises: *"Request 3 refills"* / *"Request 1 refill"*.
⚡ `notice/push` → `{ to: "reception", kind: "phone", title: "Pharmacy refill requested", body: "{patient}: Item A, Item B" }` → a toast lands at the front desk. Then clears the selection and closes.
⚠️ **No refill record is created** — only a notification. The front desk sees the toast and the bell entry, nothing more.

**Book visit / Telehealth dialog:** one dialog, opened by either action; the title, the default reason (`"Video follow-up"` vs `"Follow-up consultation"`) and the submit icon/label all branch on `action === "telehealth"`. Fields: Clinician `<select>`, Date, Time, Reason.
⚡ `appointment/request` with `source` set accordingly, `patientName/phone/email` taken from the signed-in patient. The request lands as `pending` at `/reception/requests` and fires a front-desk toast.

**Upcoming appointments rail** — live from `upcoming`, status pill `approved → Resolved` / `pending → Waiting`. `ChevronButton` "Timeline" → `/patient/records`. Empty: *"Nothing booked. Use **Book visit** to request a slot."*

---

### 6.2 `/patient/records` — the assembled timeline

The timeline is **derived in a `useMemo` from four sources** and concatenated in this order:

```
1. notes    ← state.charts[patient.id].notes, if non-empty
              → one entry, kind "note", date "Current"
2. payments ← state.bills.filter(b => b.patientName === patient.name)
              → kind "payment", detail "N items + consultation · ₹total"
3. reports  ← REPORTS.filter(r => r.patientId === patient.id)
              → kind mapped: Lab→lab, Prescription→prescription, else→note
4. visits   ← patient.visits (static)
              → kind "visit"
```

This is where the whole system converges: **a bill raised at reception and a note signed by the AI scribe both surface on the patient's own timeline**, without any explicit wiring between those screens.

**Filter chips:** Everything / Visit / Clinical note / Lab result / Prescription / Payment, each `aria-pressed`.

**Two downloads:**

- ⬇ **"CSV"** → `medical-timeline-{id}.csv` (`Date, Type, Title, Detail`)
- ⬇ **"Full record"** → `medical-record-{id}.pdf` — patient id, DOB, blood type, clinician, and every timeline row as `{date} — [{Type}] {title}: {detail}`

**Both export the *unfiltered* `timeline`, not the filtered `rows`.** The visible filter does not affect the export.

**Rendering:** a vertical `<ol>` with an absolutely-positioned accent rule and per-entry icon markers, each entry a card with a coloured type chip and a date pill. Empty: *"No entries of this type yet."*

---

### 6.3 `/patient/health`

A visually distinct screen using `theme="night"` (dark glass) with `backdrop="aurora"`.

⚠️ **This page defines its own local `NAV` array rather than using `PATIENT_NAV`,** and four of its six entries point at `/patient` — which redirects to `/patient/dashboard`. So "Statistics", "Notifications" and "Settings" are effectively all the same destination, and "My records" points at `/patients/p-1001` (the shared profile) rather than `/patient/records`. This is an inconsistency worth correcting.

| Element | Behaviour |
|---|---|
| Header ⬇ **"Report"** | `nexclinic-cardiac-overview-{id}.pdf` — imaging line, sample finding, all vitals, this week's visits, disclaimer *"Not a diagnostic report."* |
| Recovery ring | Static SVG, `strokeDasharray="119.4" strokeDashoffset="107"` ≈ 5 %, with an `sr-only` description |
| Cardiac image | `/images/heart.jpg` via `next/image`, with a real descriptive `alt`, gradient scrim, and three floating readings (heart ring from `vitals[0]`, a hardcoded SpO₂ `98.5 %`, and a hardcoded appointment chip) |
| `ConicButton` "Open full record" | → `/patients/p-1001` |
| `ExpandButton` "Share" | Widens on hover from `8.5rem` to `12.5rem` revealing X / Facebook / LinkedIn icons — **decorative, no handlers** |
| "Next reading due 6:41 PM" | Static |
| **Calendar** | April 2026, `LEADING_BLANKS = 3`, 30 day buttons. Day 24 is `aria-pressed` and gradient-filled ("appointment booked"). **Every day button, and both month arrows, have no handlers.** Fully decorative |
| Doctor card `StretchButton` **"Video call"** | **No `href`, no `onClick`.** Renders as a `<button>` that does nothing |
| In-week visits (3 cards) | Read-only, rotating icon/tone per index |

---

### 6.4 `/patients/[id]` — the shared patient profile

Reached from the surgeon dashboard search, the patients list, the consultation screen, the reports list, the reception queue, and the patient health overview. It does **not** use `PortalShell` — it has bespoke chrome with a violet gradient sidebar.

**Left sidebar (desktop only, `lg:block`):** 8 items (Profile, Care programmes 4, Sessions attended 1, Reports 3, Certifications 2, Calendar, Messages 0, Settings). **All eight are `<button>` elements with no handlers.** `active` is hardcoded to `index === 0`. Behind them, `Backdrop variant="leaf"` draws a plant-and-vase motif in inline SVG.

**Header bar:** "Back" → `/surgeon/dashboard` (hardcoded — it does not return you to wherever you came from); a **search input with no handler**; a **bell with no handler** (`aria-label="Notifications, 1 unread"`). Below it, a live `PortalSwitcher`.

**Identity card:** a hand-drawn SVG avatar illustration, name, condition · doctor, a **pencil "Edit patient details" button with no handler**, and a 5-field `<dl>` (Registered, Location, DOB, E-mail, Phone). Actions:

- ⬇ **"Full record"** → `patient-record-{id}.pdf` — the most complete export in the app: identity, all vitals with deltas, all visits, all care programmes, disclaimer.
- `ExpandButton` **"Share"** — decorative.
- `MorphButton` **"Message patient"** `doneLabel="Message sent"` — **dispatches nothing.** Pure animation.

**Care pathway:** `patient.courses` as a timeline; each entry is a `<Link>` → `/patient/health` (all of them, regardless of the course). `ChevronButton` "View all programmes" → `/patient/health`. ⬇ **"Visit history"** → `visits-{id}.csv` (`Date, Visit, Type, Clinician`). Empty: *"No care programme is enrolled for this patient yet."*

**Billing information:** a masked card `**** **** **** 4242` and four payment-method names rendered **as text, not brand logos** — a deliberate choice noted in the source. Entirely static.

**Care Plan Premium:** 5 benefit bullets and a `StretchButton` **"Upgrade plan"** with **no handler**.

**Recent activity:** `patient.activity` rows, each a `<Link>` → `/patient/health`, with a decorative desk-lamp SVG illustration in the corner.

---

## 7. The Inventory Manager Portal (`/inventory/*`)

`InventoryShell` wraps `PortalShell theme="vault" backdrop="soft"` with `INVENTORY_NAV` (6 items) and a hardcoded user (`Divya Kamath · DK · Inventory Manager`), always composing `NoticeBell audience="inventory"` after any page-supplied actions.

### 7.1 `/inventory/dashboard`

**Live derivations:**

```ts
lowCount      = stock.filter(isLow).length          // isLow = flaggedLow || qty <= reorderLevel
expiringCount = stock.filter(i => expiringSoon(i.expiry)).length
stockValue    = Σ (qty × price)
maintenance   = equipment.filter(e => e.status !== "Operational").length
```

`expiringSoon` computes days between the expiry and a **hardcoded reference date `2026-09-08`**, returning true for `0 ≤ days ≤ 60`. ⚠️ This is a fixed "today" — it will silently drift as real time passes and must be replaced with `Date.now()` or a server-supplied date.

**4 tiles (`PLinkCard`):** Items tracked → `/inventory/stock`; Low stock → `/inventory/stock`; Expiring in 60 days → `/inventory/stock`; Equipment needing work → `/inventory/equipment`.

**Header ⬇ "Export"** → `stock-register.csv`, 8 columns (`Item, Category, Quantity, Unit, Reorder level, Expiry, Unit price, Status`), exporting **all** stock.

**Register table** (`min-w-[880px]`) with two filters: a search box (◧ `query`, name only) and 5 category chips (All / Medicine / Equipment / OT Supply / Reagent, ◧ `category`, `aria-pressed`).

Columns: Item / Category / Quantity + unit / Reorder level / **Expiry** (rendered in bold rose when `expiringSoon`) / Status `PPill` (Low / In stock) / **Action**.

**Action = a delete button** (`aria-label="Delete {name} from the register"`) → ⚡ `{ type: "stock/delete", id }`.

> ⚠️ **This is an irreversible destructive action with no confirmation dialog.** The reducer removes the item and writes a `{ kind: "delete" }` stock log, but there is no undo. A confirmation step should be added before this ships.

"Add or adjust stock →" → `/inventory/stock`. Empty: *"Nothing matches these filters."*

### 7.2 `/inventory/stock`

**Header "Add stock / item"** ⇢ `AddStockDialog`: Item name (required), Category `<select>`, Quantity (default 100), Unit (default "tabs"), Reorder level (default 50), Unit price (default 10), Expiry (optional date).
⚡ `{ type: "stock/add", item }` → prepends with `uid("S")` and `flaggedLow: false`, and writes a `{ kind: "add", detail: "{name} added — {qty} {unit}", by: "Inventory manager" }` log. Confirmation: *"Item added to the register and written to the stock log."*

**Two low-stock groups** side by side — medicines and everything else — each headed by a rose count chip. Rows show *"{qty} {unit} left · reorder at {level}"* and a `Pinned` pill when manually flagged. Empty per group: *"Nothing low in this group."*

**"Pin an item as low stock"** — every stock item with a toggle button (`aria-pressed={item.flaggedLow}`):
⚡ `{ type: "stock/flagLow", id, flagged: !item.flaggedLow }` → flips the flag and logs `{ kind: "flag", detail: "{name} pinned as low stock" | "{name} cleared from low stock" }`.
Explanation in the UI: *"Pinning forces an item into the low-stock list even when it is above its reorder level — useful when a batch is unusable or reserved."* Pinning immediately moves the item into the group above and increments the header count.

### 7.3 `/inventory/suppliers`

Read-only card grid over `state.suppliers`. Each card: name, id, category pill, address, contact, distance, a 5-star `Rating` component with `aria-label="Rated {n} out of 5"`, and `ChevronButton` **"Order"** → `/inventory/orders` (it does **not** preselect the supplier).
⬇ **"Export"** → `suppliers.csv` (`Supplier, Category, Address, Contact, Distance (km), Rating`).

### 7.4 `/inventory/orders`

**Order history table** (`min-w-[760px]`): Order / Supplier / Items count / Total / Placed / Status pill (`Received → Resolved`, `In transit → In consult`, `Placed → Waiting`) / Actions.

Per row:

- ⬇ **"Print"** → `purchase-order-{id}.pdf` — status, every line with unit maths, order total.
- **"Receive"** — rendered only when `status !== "Received"`. ⚡ `{ type: "order/receive", id }` → sets status to `Received`, **adds each line's `qty` back into matching stock items (matched by `name`)**, and writes a `{ kind: "receive" }` log. The caption states this: *"Marking an order received adds its quantities back into the stock register."*
  ⚠️ Matching by `name` is brittle; a received line whose name does not exactly match a stock item is silently dropped.

**"Place an order" panel:**

- Vendor `<select>` over suppliers, with a live helper line (`{km} km · rated {r} · {contact}`).
- Search over **all** stock, capped at 6.
- **"Add"** → adds the line at **qty 10**; adding again increments by 10.
- **Cart preview** with per-line `−` / `+` steppers (step 10, floored at 1 via `Math.max(1, qty - 10)`) and a remove button, all with `aria-label`s. Live order total.
- **"Confirm order"** `MorphButton doneLabel="Order placed"`, `disabled={cart.length === 0}`, with a further guard `if (!supplierId || cart.length === 0) return`.
  ⚡ `{ type: "order/place", supplierId, items }` → creates a `PurchaseOrder` with `uid("PO")`, resolved supplier name, computed total, `status: "Placed"`; writes an `{ kind: "order" }` log; **and pushes `{ to: "admin", kind: "system", title: "Purchase order raised", body: "{id} · {supplier} · ₹{total}" }`** — a cross-portal notice to administration. Then clears the cart.

### 7.5 `/inventory/equipment`

⬇ **"Export"** → `equipment-register.csv` (`Asset, Location, Status, Last service, Next service, Log entries`).

**"Add equipment log"** ⇢ a **dual-mode dialog** with an internal pill toggle (`aria-pressed`):

| Mode | Fields | Dispatch |
|---|---|---|
| **Log maintenance** | Asset `<select>`, What was done (textarea, required), Next service due (date) | ⚡ `{ type: "equipment/log", id, note, nextService? }` → prepends a log entry stamped `uid("EL")` + `stamp()`, sets `lastService` to today's date portion, and updates `nextService` only if provided |
| **New equipment** | Name, Location, Status `<select>`, Last service, Next service | ⚡ `{ type: "equipment/add", item }` → prepends with `uid("EQ")` and `logs: []` |

Submit label switches between "Save maintenance log" and "Register equipment". Confirmation: *"Entry recorded against the equipment register."*

**Asset cards** (2-up): icon, name, location, status `PPill` (`Operational → Stable`, `Under maintenance → In consult`, `Service due → Critical`), a `<dl>` of Last service / Next due, and the full maintenance log. Empty log: *"No maintenance recorded yet."*

### 7.6 `/inventory/logs`

The unified stock audit trail — `state.stockLogs`, newest first, capped at **60 entries** by the reducer.

**Filter chips:** Everything / Ordered / Received / Issued / Added / Removed / Flagged, each `aria-pressed`.

Six log kinds with distinct icon and tone:

| Kind | Label | Written by |
|---|---|---|
| `issue` | Issued | `stock/consume` — a bill at reception |
| `receive` | Received | `order/receive` |
| `add` | Added | `stock/add` |
| `delete` | Removed | `stock/delete` |
| `order` | Ordered | `order/place` |
| `flag` | Flagged | `stock/flagLow` |

⬇ **"Export"** → `stock-history.csv` (`When, Type, Detail, By`) — exports **all** logs, not the filtered view.

Caption: *"Orders, receipts, issues against bills, manual adds and low-stock pins — all in one trail."*

---
## 8. Frontend–Backend Workflow

### 8.1 The current reality: a client-side reducer as the "backend"

There are **zero network calls in this application.** No `fetch`, no `axios`, no Server Actions, no Route Handlers, no `app/api` directory. Every page loads its data by one of exactly three mechanisms:

| Mechanism | Where it comes from | Pages using it |
|---|---|---|
| **`useClinic()`** — live, mutable | `lib/clinic-store.tsx` reducer + `localStorage` | Every screen that reads or writes appointments, queue, stock, staff, bills, notices, charts |
| **Static module import** — read-only | `lib/portal-data.ts`, `lib/admin-metrics.ts`, `lib/reports-data.ts`, `lib/data.ts` | Patient demographics/vitals/visits, revenue and footfall series, revenue/payment history, expenses, payroll cycles, report index, all marketing copy |
| **Hardcoded in-component** | The component file itself | Scribe transcript, SOAP template, settings permissions/backups, care-plan bullets, onboarding steps |

**Consequences to be explicit about:**

- Data is **per-browser and per-device**. There is no shared truth. Two people "using" the system see entirely different state.
- Clearing site data resets everything to `CLINIC_SEED`.
- The store caps growth: notices at 40, stock logs at 60. Older entries are silently dropped.
- The persisted blob is the entire `ClinicState` serialised as JSON on every change — fine at demo scale, unsuitable for real volumes.

### 8.2 State management architecture

```
                      ┌──────────────────────────────────────┐
                      │  CLINIC_SEED  (lib/clinic-seed.ts)   │
                      └───────────────┬──────────────────────┘
                                      │ useReducer initial
                       ┌──────────────▼──────────────────────┐
     localStorage ────▶│  ClinicProvider                     │───▶ localStorage
 "nexclinic:state:v1"  │  { state, dispatch, hydrated }      │     (every change)
                       └──────────────┬──────────────────────┘
                                      │  React context
        ┌───────────────┬─────────────┼─────────────┬───────────────┐
        ▼               ▼             ▼             ▼               ▼
   useClinic()     useNotices(     sortQueue()   netPay()        isLow()
 (state+dispatch)   audience)      (derived)     (derived)       (derived)
```

**Three derived-value helpers keep logic out of components:**

- `sortQueue(queue)` — in-consult → priority rank → arrival time. Called on read in both the surgeon and reception dashboards, which is why a priority change propagates instantly.
- `netPay(salary)` — `{ gross, tax, net }`. Used by payroll, the staff profile, the payslip PDF, and the admin dashboard KPI.
- `isLow(item)` — `flaggedLow || qty <= reorderLevel`. Used by the inventory dashboard, stock page, billing search, and the patient refill dialog.

**Local component state is used only for drafts and UI.** Every draft (vitals, diet, notes, salary slip, shift times, carts, chatbot answers) is held locally and committed with an explicit save. Nothing writes to the store on keystroke.

### 8.3 The complete action catalogue

`ClinicAction` is a 28-member discriminated union. This table is the contract a backend must implement.

| Action | Payload | State mutation | Notice raised |
|---|---|---|---|
| `hydrate` | `state` | Replace whole state | — |
| `reset` | — | Restore `CLINIC_SEED` | — |
| `appointment/request` | `Omit<Appointment,"id"\|"status"\|"createdAt">` | Prepend, `status: pending` | → reception, **phone** |
| `appointment/approve` | `id` | `status: approved` | → patient, **phone** |
| `appointment/decline` | `id` | `status: declined` | → patient, **phone** |
| `appointment/reschedule` | `id, date, time` | New slot **+ `status: approved`** | → patient, **phone** |
| `queue/priority` | `id, priority` | Update priority (order is derived) | — |
| `queue/state` | `id, state` | `waiting \| in-consult \| done` | — |
| `queue/add` | `name, reason, priority` | Append; derive initials, token, arrival | → surgeon, system |
| `stock/add` | `Omit<StockItem,"id"\|"flaggedLow">` | Prepend | log `add` |
| `stock/delete` | `id` | Remove | log `delete` |
| `stock/flagLow` | `id, flagged` | Toggle flag | log `flag` |
| `stock/consume` | `lines[], ref` | Subtract qty (floor 0) | → inventory **phone** *if newly low*; log `issue` |
| `order/place` | `supplierId, items[]` | Prepend PO, `status: Placed` | → admin, system; log `order` |
| `order/receive` | `id` | `status: Received`; **add qty back to stock by name** | log `receive` |
| `equipment/log` | `id, note, nextService?` | Prepend log entry; set `lastService` | — |
| `equipment/add` | `Omit<EquipmentItem,"id"\|"logs">` | Prepend | — |
| `staff/add` | `Omit<StaffMember,"id"\|"initials">` | Prepend; derive initials | → staff, **phone** |
| `staff/shift` | `id, shiftStart, shiftEnd` | Update shift | → staff, **phone** |
| `staff/salary` | `id, salary` | Replace salary | — |
| `staff/access` | `id, active` | Toggle login | → staff, **phone** |
| `bill/create` | `Omit<Bill,"id"\|"at">` | Prepend bill | — |
| `chart/vitals` | `patientId, vitals` | Upsert into `charts` | — |
| `chart/diet` | `patientId, diet` | Upsert into `charts` | — |
| `chart/notes` | `patientId, notes` | Upsert into `charts` | — |
| `surgery/schedule` | `patient, procedure, date, time, theatre, notes` | **Nothing** | → reception, **phone** |
| `emergency/broadcast` | `location, detail` | **Nothing** | → surgeon **phone** + admin system |
| `notice/push` \| `read` \| `readAll` \| `dismiss` | — | Notice list only | — |

Note the three **notification-only actions** (`surgery/schedule`, `emergency/broadcast`, and `notice/push` as used by refill and WhatsApp-send). These represent real domain events that currently leave no record. Each needs a backing entity when the server exists.

### 8.4 The cross-portal choreography — five end-to-end flows

**Flow A — Appointment lifecycle**

```
/login  "Enter New Appointment"  ──appointment/request──▶ appointments[pending]
                                                          + notice → reception (phone)
                                                          ↓ toast at front desk
/reception/requests  Approve ────appointment/approve───▶ status: approved
                                                          + notice → patient (phone)
        ├─▶ /surgeon/dashboard   "Approved appointments"
        ├─▶ /surgeon/patients    "Today's appointments"
        └─▶ /patient/dashboard   "Upcoming appointments"
```

Also reachable from `/patient/dashboard` "Book visit" / "Telehealth" (`source: web | telehealth`) and reschedulable at `/reception/requests`.

**Flow B — Billing draws down inventory** *(the tightest coupling in the app)*

```
/reception/billing  Generate bill
   ├─ bill/create   ──▶ bills[]  ──▶ /reception/billing "Recent bills"
   │                            ──▶ /admin/settings → Billing tab → "Bill register" CSV
   │                            ──▶ /patient/records timeline (kind: payment)
   ├─ stock/consume ──▶ stock qty decremented
   │                ──▶ if an item crossed its reorder level:
   │                       notice → inventory (phone) ──▶ toast + NoticeBell
   │                ──▶ stockLogs[kind: "issue"]  ──▶ /inventory/logs
   │                ──▶ /inventory/dashboard "Low stock" tile increments
   │                ──▶ /inventory/stock low-stock group gains the item
   │                ──▶ /reception/billing search shows "Low" pill
   │                ──▶ /patient/dashboard refill dialog shows "low stock"
   └─ downloadPdf   ──▶ BILL-xxxx.pdf downloads immediately
```

**Flow C — Walk-in onboarding → queue → consultation**

```
/reception/onboarding (5-step chat)  ──queue/add──▶ queue[] (+ notice → surgeon, system)
   or /reception/dashboard "Add walk-in"
        ↓ sortQueue() re-orders on every read
/reception/dashboard  priority buttons ──queue/priority──▶ row jumps position
        ↓
/surgeon/dashboard  "Next up" + "Today's list"  ──▶ /surgeon/consultation/[id]
```

**Flow D — AI scribe → chart → patient timeline**

```
/surgeon/scribe   Start listening (7 lines × 1400 ms)
                → Generate note (static SOAP template)
                → Sign into record ──chart/notes──▶ charts[patientId].notes
   ├─▶ /surgeon/consultation/[id]  useEffect re-syncs the notes textarea
   └─▶ /patient/records            timeline entry, kind "note", date "Current"
```

**Flow E — Admin staff actions → phone notifications**

```
/admin/staff  Add Staff        ──staff/add────▶ staff[] + notice → staff (phone)
/admin/staff/[id]  Save shift  ──staff/shift──▶ shift    + notice → staff (phone)
/admin/staff/[id] or /admin/access  Switch ──staff/access──▶ active + notice → staff (phone)
   └─▶ both toggles are bound to the same record — flipping one updates the other
   └─▶ /admin/dashboard "Active staff" KPI recomputes
   └─▶ /admin/payroll  StatusBadge flips Paid ⇄ Pending
```

### 8.5 Expected API integration — the contract to build against

Each reducer action maps to one endpoint. Recommended shape:

| Action | Method + path | Request body | Success response |
|---|---|---|---|
| `appointment/request` | `POST /api/appointments` | `{ patientName, phone, email?, reason, date, time, doctor, source }` | `201 { appointment }` |
| `appointment/approve` | `PATCH /api/appointments/:id` | `{ status: "approved" }` | `200 { appointment }` |
| `appointment/decline` | `PATCH /api/appointments/:id` | `{ status: "declined" }` | `200 { appointment }` |
| `appointment/reschedule` | `PATCH /api/appointments/:id` | `{ date, time, status: "approved" }` | `200 { appointment }` |
| `queue/add` | `POST /api/queue` | `{ name, reason, priority, age?, phone? }` | `201 { entry }` (server assigns token) |
| `queue/priority` | `PATCH /api/queue/:id` | `{ priority }` | `200 { entry }` |
| `queue/state` | `PATCH /api/queue/:id` | `{ state }` | `200 { entry }` |
| `stock/add` | `POST /api/stock` | `StockItem` minus id | `201 { item }` |
| `stock/delete` | `DELETE /api/stock/:id` | — | `204` |
| `stock/flagLow` | `PATCH /api/stock/:id` | `{ flaggedLow }` | `200 { item }` |
| `bill/create` + `stock/consume` | **`POST /api/bills`** | `{ patientName, doctor, lines:[{stockId,qty,price}], consultFee }` | `201 { bill, updatedStock[], newlyLow[] }` |
| `order/place` | `POST /api/purchase-orders` | `{ supplierId, items[] }` | `201 { order }` |
| `order/receive` | `POST /api/purchase-orders/:id/receive` | — | `200 { order, updatedStock[] }` |
| `equipment/add` \| `equipment/log` | `POST /api/equipment` \| `POST /api/equipment/:id/logs` | — | `201` |
| `staff/add` | `POST /api/staff` | `StaffMember` minus id/initials | `201 { member, credentials }` |
| `staff/shift` \| `staff/salary` \| `staff/access` | `PATCH /api/staff/:id` | partial | `200 { member }` |
| `chart/vitals` \| `chart/diet` \| `chart/notes` | `PATCH /api/patients/:id/chart` | `{ vitals?, diet?, notes? }` | `200 { chart }` |
| `surgery/schedule` | `POST /api/surgeries` | `{ patientId, procedure, date, time, theatre, notes }` | `201 { surgery }` |
| `emergency/broadcast` | `POST /api/emergencies` | `{ location, detail }` | `201 { incident }` |
| Sign-in | `POST /api/auth/login` | `{ username, password, role }` | `200 { user, session }` + httpOnly cookie |
| Demo request | `POST /api/leads` | contact-form payload | `202` |

**Critical design note on billing.** `bill/create` and `stock/consume` are dispatched as **two separate actions** on the client. On a server they **must be one transaction** — a bill that succeeds while the stock draw-down fails would silently corrupt the register. The response should return the newly-low items so the client can raise the same inventory notification without recomputing the diff itself.

**Notifications.** The `notices` array is the client's stand-in for a push channel. In production, `kind: "phone"` notices become real pushes (FCM/APNs/WhatsApp Business API) issued **server-side** as a side effect of the mutation, and the in-app `NoticeBell` should read from a `GET /api/notices?audience=…` endpoint or a WebSocket/SSE subscription. The current model — a client reducer deciding who gets notified — cannot be trusted once state is shared.

### 8.6 Loading, success and error states — what exists and what is missing

**What exists today**

| State | Mechanism | Where |
|---|---|---|
| Initial "loading" | `hydrated` boolean; the seed renders immediately so there is never a blank frame | `ClinicProvider` |
| Route transition | Framer fade + 8 px rise keyed on `pathname`; Next.js prefetches `<Link>`s on hover | `AdminShell`; all portals |
| Lazy component load | `dynamic(() => import("@/components/three/DnaHelix"), { ssr: false, loading: () => <HelixFallback/> })` | Hero |
| Action pending | `MorphButton` — morphs to a filled gradient + tick for 2200 ms | ~25 usages |
| Download pending | `DownloadButton` — 3-phase machine: `idle → working` (label "Preparing…", ring fills over 1 s, arrow bobs) → `done` (label "Saved", tick) → `idle` after 2.9 s. Announces `"{fileLabel} downloaded"` in an `sr-only role="status"` | ~30 usages |
| Sign-in pending | `pending` disables the button and changes the label to "Opening portal…" | `SignInView` |
| Payroll pending | `running` changes the label to "Running…" for 1600 ms | `PayrollView` |
| Disabled/guarded | `disabled` on: Generate note (no transcript), Sign into record (no note), Save plan (not dirty), Save slip (not dirty), Save and notify (not dirty), Confirm order (empty cart), Request refill (nothing ticked), Add medicine (`qty === 0`) | across portals |
| Success confirmation | Inline `role="status"` panels replacing forms (booking, staff, credentials, stock, equipment, emergency, surgery) | 8 dialogs |
| Empty state | Per-list contextual copy — never a bare blank area. Admin uses a dedicated `EmptyState` component | every list |
| Live region | `aria-live="polite"` on search results, the scribe transcript, the chatbot log, and the explore-panel detail | 4 places |
| Push notification | `PhoneToasts` — handset-style, top-right, `z-[120]`, max 3 concurrent, auto-dismiss 6500 ms, manual dismiss marks the notice read | global |

**What is missing and must be added when the backend lands**

1. **No error state anywhere.** There is not a single error boundary, `try/catch` around a user action, retry affordance, or error toast. Every action is assumed to succeed. Every mutation will need an error path — most cheaply by extending `MorphButton` with an `error` variant and adding a failure toast alongside `PhoneToasts`.
2. **No true loading skeletons.** Because data is synchronous, no page has a skeleton or spinner for its *content*. Every list, table and chart will need one. Next.js `loading.tsx` files per route segment would be the idiomatic fix.
3. **No optimistic-update reconciliation.** The reducer applies changes immediately. With a server, each of these needs either a pending flag with rollback, or a switch to a server-state library (React Query / SWR) with proper invalidation.
4. **No `error.tsx` or `not-found.tsx`.** `notFound()` is called in three route files but there is no custom 404 page, so users hit the framework default.
5. **No request cancellation, debouncing, or pagination.** Every search filters an in-memory array on each keystroke. Against an API these need debouncing (~300 ms) and abortable requests; every table needs pagination.
6. **No CSRF/auth handling**, since there are no requests to protect.

### 8.7 Download subsystem — exact behaviour and output

Two generators in `lib/`:

**`downloadCsv(fileName, headers, rows)`** (`lib/downloads.ts`)

- Escapes every value as `"…"` with internal quotes doubled, so commas, quotes and newlines inside a cell survive into a spreadsheet.
- Joins rows with `\r\n` (Excel-friendly).
- **Prepends a UTF-8 BOM** so Excel renders `₹`, `°` and accented characters correctly instead of mojibake.
- `Blob` → `URL.createObjectURL` → synthetic `<a download>` → `click()` → `remove()` → `revokeObjectURL` after 2000 ms.
- Appends `.csv` if absent.

**`downloadPdf(fileName, { title, subtitle?, lines })`** (`lib/mock-pdf.ts`)

- Hand-writes a **genuinely valid PDF 1.4 document** with no dependency: catalog, pages, page (A4 `595 × 842`), two base-14 Type1 fonts (Helvetica-Bold for the title, Helvetica for body, both `WinAnsiEncoding`), a content stream, a byte-accurate `xref` table and trailer.
- Text layout: title at 20 pt from `(56, 780)`; subtitle at 11 pt from `(56, 758)` in grey; body at 11 pt from `(56, 720)` with 16 pt leading via `T*`.
- **Text sanitisation** — escapes `\`, `(`, `)`; transliterates `₹ → "Rs. "`, en/em dashes → `-`, smart quotes → straight; strips everything outside `\x20-\x7E`. This is why every PDF says "Rs." rather than "₹".
- Offsets are computed with `TextEncoder().encode(x).length`, so multi-byte characters cannot corrupt the xref.
- The file opens correctly in any viewer — it is a real PDF, not a renamed text file.

**Complete download inventory (30+ controls):**

| File | Format | Source | Screen |
|---|---|---|---|
| `nexclinic-oversight-summary.pdf` | PDF | live store + metrics | `/admin/dashboard` |
| `patient-visits.csv` | CSV | `PATIENT_VISITS` | `/admin/dashboard` |
| `payroll-register.csv` | CSV | live staff | `/admin/payroll` |
| `salary-slip-{id}.pdf` | PDF | draft salary | `/admin/payroll` (per slip) |
| `salary-slip-{id}.pdf` | PDF | saved salary | `/admin/staff/[id]` |
| `portal-credentials.csv` | CSV | live staff | `/admin/access` |
| `revenue-{range}.csv` | CSV | range-aware | `/admin/analytics` |
| `nexclinic-revenue-{range}.pdf` | PDF | range-aware | `/admin/analytics` |
| `revenue-history.csv` | CSV | static | `/admin/logs` (revenue tab) |
| `patient-payments.csv` | CSV | static | `/admin/logs` (payments tab) |
| `expenses-{month}.csv` | CSV | static | `/admin/expenses` |
| `bill-register.csv` | CSV | live bills | `/admin/settings` → Billing |
| `todays-list.csv` | CSV | live queue | `/surgeon/dashboard` |
| `patient-database.csv` | CSV | all patients | `/surgeon/patients` |
| `consultation-{id}.pdf` | PDF | chart + drafts | `/surgeon/consultation/[id]` |
| `soap-note-{id}.pdf` | PDF | note or template | `/surgeon/scribe` |
| `report-history.csv` | CSV | **filtered** rows | `/surgeon/reports` |
| `report-{id}.pdf` | PDF | one report | `/surgeon/reports` (per card) |
| `patient-queue.csv` | CSV | live queue | `/reception/dashboard` |
| `appointment-requests.csv` | CSV | all appointments | `/reception/requests` |
| `bill-{ref}.pdf` | PDF | cart at time of billing | `/reception/billing` (auto + reprint) |
| `health-summary-{id}.pdf` | PDF | patient + upcoming | `/patient/dashboard` |
| `medical-timeline-{id}.csv` | CSV | full timeline | `/patient/records` |
| `medical-record-{id}.pdf` | PDF | full timeline | `/patient/records` |
| `nexclinic-cardiac-overview-{id}.pdf` | PDF | vitals + visits | `/patient/health` |
| `patient-record-{id}.pdf` | PDF | complete profile | `/patients/[id]` |
| `visits-{id}.csv` | CSV | visit list | `/patients/[id]` |
| `stock-register.csv` | CSV | live stock | `/inventory/dashboard` |
| `suppliers.csv` | CSV | live suppliers | `/inventory/suppliers` |
| `purchase-order-{id}.pdf` | PDF | one order | `/inventory/orders` (per row) |
| `equipment-register.csv` | CSV | live equipment | `/inventory/equipment` |
| `stock-history.csv` | CSV | all logs | `/inventory/logs` |

**Every generated PDF carries a disclaimer line** — *"Sample output generated in the browser. Not a medical record."* / *"Not a tax invoice."* / *"Not a statutory payslip."* / *"Not a clinical report."* / *"Not a diagnostic report."* When these are replaced by server-rendered documents, those lines must be removed deliberately, not incidentally.

**Export-scope inconsistency to resolve:** most exports emit the *entire* dataset regardless of the on-screen filter; `/surgeon/reports` alone exports the *filtered* rows. Pick one convention — ideally "export what I'm looking at", with an explicit "export all" alternative.

---

## 9. Design Flow & UX

### 9.1 Two design languages, deliberately separated

**Marketing (`/`)** — lavender/indigo (`--accent-start #A78BFA` → `--accent-end #5B4FE0`), off-white ground `#F2F1EF`, the whole page floating as one rounded card (`lg:rounded-frame lg:shadow-frame`) that drops to edge-to-edge on mobile. Oversized display type (up to `text-9xl` in marquees), generous `py-24 md:py-32` section rhythm, and a shared `.shell` container (`max-w-[1280px]`, `px-5 sm:px-8 lg:px-14`).

**Product portals** — a **token-swap theming system**. Every portal component is written once against semantic CSS variables (`--p-bg`, `--p-card`, `--p-ink`, `--p-muted`, `--p-line`, `--p-accent`, `--p-accent-2`, `--p-soft`, `--p-grad`). A wrapper class swaps the values:

| Theme | Applied to | Palette |
|---|---|---|
| `theme-care` | Patient dashboard, records | Mint / teal (`#0DB0A2`) |
| `theme-clinic` | Surgeon, Reception | Indigo (`#4F46E5`) |
| `theme-violet` | `/patients/[id]` | Violet (`#6D5BD0`) |
| `theme-vault` | Inventory | Indigo on light, with `--p-panel` near-black tokens |
| `theme-night` | `/patient/health` | Dark glass — bg `#0E1016`, pink→purple→indigo gradient |

Fallback values live at `:root` so portal components used *outside* a skin (e.g. on the login page) still render — with the login's red→blue ramp as the default gradient.

The **Super Admin panel has its own token set entirely** (`--admin-page-bg #EEF3FC`, `--admin-pink` which is in fact blue `#2563EB`, four gradients). These are declared at `:root` rather than scoped to the admin subtree — deliberately, because Radix dropdowns, tooltips and dialogs render into a portal on `<body>` and would otherwise lose the tokens.

Accessibility is engineered into the palette: `--accent-gradient-strong` is a deeper ramp used specifically wherever white text sits on the gradient, because its lightest stop still clears WCAG AA. Similarly `--admin-text-muted-soft` is annotated *"decorative only — 2.9:1"* while `--admin-text-muted` is *"readable label/body muted — 5.4:1"*.

### 9.2 Motion system

**Global easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (an ease-out-expo) is used in essentially every transition in the application. Durations: 200 ms (micro), 300–400 ms (component), 500–700 ms (section reveal).

**Scroll on the marketing site** is driven by **Lenis** (`lerp: 0.1`, `smoothWheel`, `touchMultiplier: 1.4`) wired into the GSAP ticker so every `ScrollTrigger` stays in sync with the smoothed position. Lenis also intercepts in-page anchor clicks and scrolls to the target with a `-90px` offset to clear the sticky nav. It is **not initialised at all** under `prefers-reduced-motion`.

**Reveal primitives:**

- `FadeInOnScroll` (marketing) — 14 px rise + fade, 600 ms, `viewport={{ once: true, margin: "-12% 0px -12% 0px" }}`. Motion tags are resolved from a static map so component identity stays stable across renders.
- `Reveal` (portals) — 12 px rise, 500 ms, **mount-triggered** (`animate`), staggered by an explicit `delay` prop.
- `Reveal` (admin) — 22 px rise, 500 ms, **scroll-triggered** (`whileInView`, `once: true`, `margin: "0px 0px -80px 0px"`), so cards further down animate in as you scroll rather than all firing at mount.

**The seven-button motion vocabulary** (`components/motion-ui/buttons.tsx`) is a deliberate design system in which *an action's motion tells you what kind of action it is before you read the label*:

| Button | Signature motion | Semantic meaning | Example |
|---|---|---|---|
| `ConicButton` | Rotating spectrum ring | Primary navigation | "Open AI scribe" |
| `FlyButton` | Icon flies off and returns | Send to someone | "Send report to WhatsApp" |
| `MorphButton` | Morphs into a confirmed state | Save / commit | "Save vitals", "Approve" |
| `StretchButton` | Arrow travels a widening rail + sheen sweep | Enter / continue | "Start consultation" |
| `ExpandButton` | Widens into a row of icons | Share / export | "Share" |
| `ChevronButton` | Chevron hands off to a second chevron | Next / paginate | "All patients" |
| `DownloadButton` | Ring fills, then a tick | Download a file | every export |

Every one degrades to a plain colour change under `prefers-reduced-motion`. `Shell` renders a `<Link>` when `href` is present and a `<button>` otherwise, so the same visual affordance covers both navigation and action.

**Shared-layout animation** appears once, meaningfully: the admin dashboard's `OversightTabs` uses `layoutId="oversight-active-pill"` with a spring, so the active pill physically travels between tabs.

### 9.3 Reduced-motion strategy — three layers

1. **CSS blanket** — a `@media (prefers-reduced-motion: reduce)` block forces `animation-duration: 0.001ms`, `animation-iteration-count: 1`, `transition-duration: 0.001ms`, `scroll-behavior: auto` on everything, and kills the marquee track outright.
2. **Tailwind `motion-reduce:` variants** — applied at the point of use (`motion-reduce:hover:translate-y-0`, `motion-reduce:transform-none`, `motion-reduce:hidden` on the sheen overlay, `motion-reduce:group-hover:scale-100`).
3. **JS-level opt-out** — `useReducedMotionSafe()` / `usePrefersReducedMotion()` gate the expensive work: Lenis is never constructed, GSAP `matchMedia` never registers the pinned stepper, Recharts `isAnimationActive` is set to `false`, the Three.js helix is replaced by `HelixFallback`, parallax `style` props are omitted entirely, and `SignInView`'s redirect delay drops from 600 ms to 0.

Both hooks return `false` on the server *and the first client render*, then update in `useEffect` — a consistent, hydration-safe pattern applied everywhere.

### 9.4 Feedback taxonomy — what the user sees, when

| Delay / event | Feedback |
|---|---|
| Hover a card | `-translate-y-1` lift + accent border + deeper shadow, 300 ms |
| Hover a nav rail icon | `-translate-y-0.5` + white 15 % fill, staggered `transitionDelay: index × 15ms` |
| Hover a primary button | Sheen sweep (700 ms), arrow travel, `pr-7 → pr-12` widening |
| Press a button | `active:scale-[0.99]` / `active:scale-[0.97]` |
| Keyboard focus | Global `:focus-visible { outline: 2px solid var(--accent-end); outline-offset: 3px }` |
| Toggle a filter chip | Immediate fill swap + `aria-pressed` flips; list re-filters synchronously |
| Change a priority | Row re-sorts and physically jumps position |
| Save something | `MorphButton` morphs to gradient + tick for 2200 ms |
| Save with nothing changed | Button is `disabled` (60 % opacity, `pointer-events-none`) with a "No changes to save" helper |
| Start a download | Ring fills over 1 s, label "Preparing…", arrow bobs; then "Saved" + tick; then reverts. `sr-only` status announcement |
| Submit a dialog form | The whole form is **replaced in place** by a `role="status"` confirmation panel, usually with a link to where the result landed |
| A cross-portal event fires | Handset toast slides in top-right (350 ms), auto-dismisses at 6500 ms, dismissible; the target portal's `NoticeBell` badge increments |
| Open a notification panel | Badge clears (all that audience's notices marked read) |
| Navigate | Framer fade + 8 px rise, 350 ms; admin drawer auto-closes; Next.js prefetches on hover |
| Nothing to show | A contextual empty message, never a blank region |

### 9.5 Responsive strategy

Breakpoints used: `sm 640` · `md 768` · `lg 1024` · `xl 1280`.

**Layout transformations by breakpoint:**

| Component | Mobile | Desktop |
|---|---|---|
| Marketing frame | Edge-to-edge, no radius | Rounded card with `p-6` gutter and frame shadow |
| Marketing nav | Icon hamburger, no "Menu" pill | "Menu" pill + Login + Book a Demo |
| Portals section | Snap carousel, 78 vw cards | Fanned deck that opens on hover |
| Stepper | Vertical accordion | Pinned, scroll-scrubbed horizontal track |
| Timeline | Stacked `<ol>` | 300 vh sticky scrub |
| `PortalShell` nav | Slide-in drawer with backdrop | Sticky 76 px icon rail |
| `AdminSidebar` | Off-canvas, full 272 px, backdrop, body-scroll lock, Escape to close | Sticky, collapsible 272 ⇄ 88 px with tooltips |
| Portal headers | `PortalSwitcher` drops to `order-last w-full` | Inline |
| Dashboard grids | 1 column | `xl:grid-cols-[1.5fr_1fr]` two-column |
| Tables | Horizontally scrollable inside `TableScroll` | Full width |

**Tables never break the page.** `TableScroll` gives every table its own `overflow-x-auto` container with `role="region"`, `aria-label` and `tabIndex={0}` so keyboard users can scroll it. Minimum widths are set per table (720–880 px).

### 9.6 Accessibility posture

Genuinely strong for a prototype:

- **Skip links** on the marketing site (`#main`), every portal (`#portal-main`), the admin panel (`#admin-main`) and the patient profile (`#profile-main`), all `sr-only focus:not-sr-only`.
- **`aria-current="page"`** on active nav items in `PortalShell`, `AdminSidebar` and `PortalSwitcher`.
- **`aria-pressed`** on every toggle-style filter chip, priority button, patient selector and pin control.
- **`aria-expanded` + `aria-controls`** on the sidebar collapse toggle, the explore panels and the payroll accordion.
- **`aria-live="polite"`** on the surgeon search results, the scribe transcript, the onboarding chat log and the explore-panel detail.
- **`role="status"`** on every success confirmation and on the download announcement.
- **Charts carry descriptive `aria-label`s that narrate the data**, not just the chart type — e.g. *"Line chart of monthly revenue rising from ₹64 lakh in April to ₹92 lakh in March, consistently above last year."* Progress bars in the analytics breakdown are individually labelled `role="img"`.
- **Colour is never the only signal** — every `StatusBadge` renders its label as text; the `StatusBadge` tone map is centralised precisely to guarantee this.
- **Decorative SVG and icons** consistently carry `aria-hidden="true"` and `focusable="false"`; the `QrPlaceholder` carries `role="img"` with a label that says it is not scannable rather than posing as a working code.
- **The `BodyMap` component** (currently unused) makes hover-only sensor readings keyboard-reachable by making each point a real `<button>` with `onFocus`.
- **Global focus ring** with 3 px offset on every interactive element.

Gaps: several `aria-label`s state hardcoded counts (`"Notifications, 2 unread"`, `"Notifications, 3 unread"`, `"Notifications, 1 unread"`) that do not reflect reality; and the many handler-less buttons catalogued in §10 are focusable controls that do nothing, which is itself an accessibility problem.

---

## 10. Known gaps, dead controls and dead code

Documented so nothing is mistaken for working behaviour.

### 10.1 Interactive elements with no handler

| Screen | Control |
|---|---|
| `/` Nav | Search icon button |
| `/` ShowcaseWidget | "Get the App" |
| `/` Resources | "See all" + 3 article cards (all `href="#resources"`) |
| `/` Footer | 13 column links + 3 social icons (all `href="#"`) |
| `PortalShell` header | Search button; **static bell button** (separate from the working `NoticeBell`) |
| `AdminHeader` | Search input; Bell; Messages; "Log out" in the dropdown |
| `AdminSidebar` | "Log out" |
| `/admin/access` | Reset-password button on every row |
| `/admin/settings` → Roles | 5 permission switches (uncontrolled, never read) |
| `/patient/dashboard` | "Copy referral link" — animates but does not touch the clipboard |
| `/patient/health` | 30 calendar day buttons; both month arrows; "Video call"; "Share" |
| `/patients/[id]` | All 8 sidebar items; Back-bar search; bell; "Edit patient details"; "Message patient"; "Share"; "Upgrade plan" |
| `WeekStrip` *(unused)* | Prev/next week arrows |

### 10.2 Forms that submit nowhere

`/` ContactForm (carries an explicit `// TODO: POST to the CRM`), `BookDemoDialog`, `/signin/[role]` (no credential check), `/patient/dashboard` Change password, `/admin/settings` Clinic profile / Billing & GST / WhatsApp.

### 10.3 Actions that notify but store nothing

`surgery/schedule` (no surgery record), `emergency/broadcast` (no incident record), patient refill (`notice/push` only), consultation "Send to WhatsApp" (`notice/push` only). Each needs a backing entity.

### 10.4 Unused components and data

**Components:** `components/portal/BodyMap.tsx`, `components/portal/WeekStrip.tsx`, `components/admin/StatCard.tsx`, and three chart components in `components/portal/charts.tsx` (`HeartRateChart`, `TrendArea`, `Spark`) are defined and exported but rendered nowhere.

**Data exports never imported by any component:**

- `lib/portal-data.ts` — `DOCTOR_QUEUE`, `ARRIVALS`, `SCHEDULE` (used only by the unused `WeekStrip`), `PATIENTS_PER_DAY`, `CLINIC_REPORT`, `INVENTORY_KPIS`, `STOCK_ORDERS`, `CONSUMPTION`, `LEAD_TIME`
- `lib/admin-data.ts` — `USERS` (18 records), `CLINICS`, `RECENT_ACTIVITY`, `FACILITY_OVERVIEW`, `DASHBOARD_STATS`, `REVENUE_30_DAYS`, `PATIENT_SOURCE`, `EXPENSE_BREAKDOWN`, `REVENUE_TREND`, `FOOTFALL`. Only `ADMIN_PROFILE` and the `StatCardDatum` type are actually consumed — from a 674-line file.

This is roughly 1,000 lines of dead data. It is either the residue of removed screens or scaffolding for screens not yet built; either way it should be deleted or the screens restored.

### 10.5 Correctness and data-integrity issues

1. **Billing reference mismatch** — the stock log records a random `BILL-4xxx` ref while the bill itself gets a `uid("BILL")` id. The audit trail cannot be joined to the bill register.
2. **`Math.random()` invoice numbers** can collide.
3. **`bill/create` and `stock/consume` are not atomic** — must become one server transaction.
4. **`order/receive` matches stock by `name`** — a mismatch silently drops the received quantity.
5. **`expiringSoon()` uses a hardcoded reference date** (`2026-09-08`).
6. **`/admin/expenses` month selector changes labels only** — one static dataset.
7. **`state.bills` never reaches `/admin/logs`** — the admin payment history is static and ignores real bills.
8. **`/patient/health` uses a local `NAV`** with four entries pointing at the same redirect.
9. **`SURGEON_NAV` hardcodes `/surgeon/consultation/p-1001`.**
10. **`SlipEditor` never re-syncs its draft** (masked by unmount-on-collapse).
11. **`/reception/onboarding` discards `age` and `phone`.**
12. **Patient identity is `PATIENTS[0]`**, and `/patient/dashboard` matches appointments by **name**, not id.
13. **Export scope is inconsistent** — one screen exports the filtered view, the rest export everything.
14. **`stock/delete` is destructive with no confirmation.**
15. **Hardcoded notification counts** in three `aria-label`s.
16. **README route table is stale** (`/site`, `/doctor` no longer exist).

### 10.6 Placeholder content flagged in source

The codebase is admirably honest about its own placeholders, each marked with a `⚠️ PLACEHOLDER` comment:
`STATS` (marketing figures), `TESTIMONIALS` (all four — invented names, roles and quotes), `CONTACT` address/email/phone, `SHOWCASE.widget` ("8 min" queue metric), the `SPARKLINE` series, `INVENTORY_KPIS`, `CONSUMPTION`, `LEAD_TIME`, and the entirety of `clinic-seed.ts` and `portal-data.ts` (*"no patient, staff member, price or phone number is real"*).

---

## 11. Pre-production checklist

**Blocking**

1. Implement real authentication and server-side authorisation; delete hardcoded demo credentials from `lib/roles.ts` and remove form pre-filling.
2. Replace the client store with API-backed server state; make billing + stock draw-down one transaction.
3. Add error handling: error boundaries, `error.tsx` per segment, failure states on every mutation, retry affordances.
4. Add loading states: `loading.tsx` per segment, skeletons for lists/tables/charts.
5. Replace every placeholder dataset with real queries; replace placeholder testimonials with consented, attributed quotes.
6. Move PDF/CSV generation server-side for anything that constitutes a legal document (invoices, payslips, clinical records) and remove the sample disclaimers deliberately.
7. Add a confirmation step to `stock/delete` and any other destructive action.

**High priority**

8. Wire or remove every handler-less control listed in §10.1.
9. Wire the marketing contact form and `BookDemoDialog` to a CRM endpoint.
10. Move notification dispatch server-side; integrate real push (FCM/APNs) and the WhatsApp Business API.
11. Fix the billing reference mismatch; use server-issued invoice numbers.
12. Add pagination, debounced search and abortable requests to every table and search box.
13. Create backing entities for surgery scheduling, emergency incidents and refill requests.
14. Add a custom `not-found.tsx`.

**Cleanup**

15. Delete the ~1,000 lines of unused data and the four unused components — or build the screens they were written for.
16. Fix `/patient/health`'s local nav, `SURGEON_NAV`'s hardcoded consultation link, and `expiringSoon`'s hardcoded date.
17. Standardise export scope across all download buttons.
18. Update `README.md`'s stale route table.
19. Correct the hardcoded `aria-label` notification counts.
20. Add automated tests — the repository currently has none, and no test tooling is installed.

---

*End of document.*
