# Nexclinic

One Next.js 14 app with two surfaces:

> **Routing and flow map: see [ROUTES.md](./ROUTES.md).** It lists every route,
> the cross-portal actions, and where the sidebar / 2-grid / floating button
> state lives.

| Route | Surface |
| --- | --- |
| `/` | Homepage — 2-grid entry: Nexclinic info left, role sign-in right |
| `/signin/[role]` | 2-grid role sign-in with demo credentials |
| `/site` | The earlier marketing landing page |
| `/surgeon/*` | Surgeon portal (5-option sidebar, floating Schedule Surgery) |
| `/reception/*` | Front desk: queue, requests, billing, onboarding |
| `/patient` | Patient dashboard (mint) — vitals, body map, heart rate |
| `/patient/health` | Patient health overview (dark glass) — cardiac study, week's visits |
| `/doctor` | Doctor console (indigo) — live queue, AI scribe, vitals |
| `/reception` | Front desk (indigo) — arrivals board, week schedule, footfall |
| `/patients/[id]` | Patient profile (violet) — opened from doctor / reception |
| `/inventory` | Inventory manager console — restock requests, KPIs |
| `/admin/*` | Super Admin dashboard (11 routes) |

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · GSAP ScrollTrigger · Lenis · React Three Fiber · Recharts · shadcn/ui primitives · lucide-react

They share the app shell, the font and the Tailwind config, but nothing else:
`app/(marketing)/layout.tsx` carries the Lenis smooth scrolling and the rounded
page frame, `app/admin/layout.tsx` carries the sidebar and header. The root
layout is deliberately minimal so neither leaks into the other.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
```

> The project was authored without a local `npm install` (the build environment
> had no access to the npm registry), so **the first `npm install && npm run build`
> is the real compile check**. Everything has been syntax-checked with `tsc`.

## Folder structure

```
app/
  layout.tsx          minimal root: <html>, Inter via next/font, globals.css
  globals.css         design tokens (both surfaces), base styles, utilities
  (marketing)/
    layout.tsx        Lenis smooth scroll + the rounded page frame
    page.tsx          assembles all 14 marketing sections in order
  admin/
    layout.tsx        renders <AdminShell> (sidebar + header)
    page.tsx          redirects /admin → /admin/dashboard
    (routes)/         one folder per admin route; each has page.tsx + a
                      colocated client *View.tsx
components/
  sections/           one file per section
  ui/                 restyled shadcn/ui primitives (button, accordion, dialog,
                      input/textarea, label, select) + the shared demo dialog
  motion/             FadeInOnScroll, MarqueeRow, CounterOnView,
                      useReducedMotionSafe, SmoothScroll (Lenis + GSAP sync)
  three/              DnaHelix (hero visual) + HelixFallback (reduced-motion / SSR)
components/
  admin/              AdminShell, AdminSidebar, AdminHeader, StatCard,
                      StatusBadge, shared ui.tsx, charts/ (Recharts)
lib/
  data.ts             ALL marketing copy as exported constants
  admin-data.ts       ALL admin sample data
  admin-nav.ts        sidebar / header / breadcrumb config (single source)
  mock-pdf.ts         dependency-free generator for real one-page PDFs
  gsap.ts             registers ScrollTrigger once, client-side
  utils.ts            cn() helper
```

Sections 2 and 11 (the two marquee tickers) share one reusable
`components/sections/Marquee.tsx`; they differ only in phrases, direction and speed.

## Design system

Tokens live in `app/globals.css` as CSS variables and are surfaced through
`tailwind.config.ts`:

| Token | Value | Tailwind |
| --- | --- | --- |
| `--bg` | `#FFFFFF` | `bg-bg` |
| `--bg-frame` | `#F2F1EF` | `bg-bg-frame` |
| `--surface` | `#FAFAF9` | `bg-surface` |
| `--surface-tint` | `#F5F3FF` | `bg-surface-tint` |
| `--ink` | `#0B0B0F` | `text-ink` |
| `--ink-muted` | `#6B7280` | `text-ink-muted` |
| `--border` | `#E8E6E1` | `border-line` |
| `--accent-start / mid / end` | `#A78BFA / #7C6FF0 / #5B4FE0` | `text-accent-start` … |

Two notes on how the palette is wired:

1. **Alpha modifiers.** Each color also has an `--*-rgb` channel triplet so
   `text-ink/60`, `border-line/70` etc. actually apply opacity. A plain
   `var(--ink)` color would silently ignore the modifier.
2. **`--accent-gradient-strong`.** `--accent-gradient` is the brief's gradient and
   is used for decorative fills. Wherever **white text sits on the gradient**
   (buttons, active pills, the testimonial sticky note) — and for gradient *text*
   on white — the deeper `--accent-gradient-strong` ramp is used instead, because
   white on `#A78BFA` is only 2.4:1 and fails WCAG AA. Same visual family,
   AA-compliant.

Shapes: `rounded-frame` (32px page frame), `rounded-card` (28px), `rounded-chip`
(16px), `rounded-full` for every button and pill.

## Motion

- **Reveals** — `FadeInOnScroll` (8–16px translateY + opacity, ~600ms, ease-out).
- **Scroll-scrubbed** — the technology stepper (GSAP ScrollTrigger, pinned, desktop
  only via `gsap.matchMedia`) and the milestones timeline (sticky + `useScroll`).
- **Smooth scrolling** — Lenis, with `lenis.on("scroll", ScrollTrigger.update)` and
  Lenis driven by the GSAP ticker so pinning stays in sync.
- **Reduced motion** — `useReducedMotionSafe` disables parallax, the 3D helix,
  the floating widget loop and marquee auto-scroll; `globals.css` also zeroes
  animation/transition durations under `prefers-reduced-motion: reduce`.

## The hero helix

`components/three/DnaHelix.tsx` is the component from the brief, **verbatim**. It
is loaded with `next/dynamic({ ssr: false })` and, per the brief's own note, the
reduced-motion case is handled one level up in `Hero.tsx`, which renders
`HelixFallback` (a blurred SVG gradient blob with pulse lines) instead of mounting
the canvas at all. That keeps the appendix file untouched while still honouring
the reduced-motion requirement.

If TypeScript ever objects to the `<line>` element in that file (React's SVG
`line` and R3F's `THREE.Line` share a JSX name), the one-line fix is to add
`{/* @ts-expect-error R3F line vs SVG line */}` above it — no behaviour change.

## Responsive behaviour

| Breakpoint | Behaviour |
| --- | --- |
| `< 640px` | No outer frame (edge-to-edge), all two-column sections stacked, portal cards become a swipeable snap carousel, stepper becomes a vertical accordion |
| `640–1024px` | Two-column where it fits; stepper still an accordion, timeline still a plain list |
| `> 1024px` | Rounded 32px frame with 24px gutter, pinned scroll-scrubbed stepper, sticky timeline, fanned portal deck |

## Accessibility

- Semantic order: one `h1` (hero), `h2` per section, `h3` for cards and accordion
  headers (Radix renders accordion triggers inside an `h3`).
- Every interactive element has a visible focus ring (`:focus-visible` in
  `globals.css`); a "Skip to main content" link precedes the frame.
- Decorative gradients are `aria-hidden`; placeholder visuals that stand in for
  real imagery carry `role="img"` + a descriptive label, and never wrap real
  content.
- The full-screen menu and both demo dialogs are Radix dialogs (focus trap,
  Escape to close, labelled).
- Body text uses only `--ink` / `--ink-muted`, both ≥ 4.5:1 on white and on the
  surface tints.

## Placeholders to replace before launch

Search the codebase for `PLACEHOLDER` — every one is flagged in a comment:

- `lib/data.ts` → `STATS` (6 / 13+ / 100% / Multi), `TESTIMONIALS` (invented names,
  roles and quotes), `CONTACT` address / email / phone, `SHOWCASE.widget.value`.
- `components/sections/ShowcaseWidget.tsx` → the sparkline series.
- Every `placeholder-surface` / `placeholder-surface-deep` block is sized to take a
  real screenshot as a `next/image` at the same aspect ratio without restructuring.

## Not wired up

The demo forms (`ContactForm`, `BookDemoDialog`) validate and show a success state
locally but do not POST anywhere yet — hook them to your CRM endpoint at the
`// TODO` in `components/sections/ContactForm.tsx`.


---

# Super Admin Dashboard (`/admin`)

An internal panel for hospital and multi-clinic administrators. Eleven real
routes, all reachable from the sidebar — no dead links, no "coming soon".

| Route | What's on it |
| --- | --- |
| `/admin/dashboard` | Greeting + report download, facility overview area chart, patient-source donut, four gradient KPI cards, recent-activity feed, paginated pending POs |
| `/admin/users` | Patients / Doctors / Staff / Super Admins tabs, search + clinic + status filters, row actions, Add User dialog |
| `/admin/clinics` | Clinic card grid, Add Clinic dialog, and a real detail route at `/admin/clinics/[id]` |
| `/admin/analytics` | Date-range + clinic filters, revenue-vs-target area chart, footfall bars, expense donut, PDF export |
| `/admin/payroll` | Cycle summary, register with per-row payslip generation, collapsible payroll history |
| `/admin/audit-logs` | Date / user / module filters, search, colour-coded action types |
| `/admin/equipment` | Maintenance register with Operational / Due Soon / Overdue status, Log Maintenance dialog |
| `/admin/inventory` | Medicines / Equipment / OT Supplies tabs, Generate PO dialog, purchase orders with Mark as Received |
| `/admin/wellness` | Program cards, workforce stress line chart |
| `/admin/emergency` | Live SOS alert panel (with empty state), hotline directory, incident register |
| `/admin/settings` | Profile, notification toggles, clinic preferences, password + 2FA |

## The active-item merge effect

This is the detail worth reading the code for. It lives in two places:

- `app/globals.css` → `.admin-nav-active` and its two pseudo-elements
- `components/admin/AdminSidebar.tsx` → the nav `<Link>` that carries the class

The active pill is filled with `--admin-page-bg` — the *content area's* colour,
never an accent — is rounded on the left only, and runs flush to the sidebar's
right inner edge, so it butts directly against the content area with no seam.

The concave notches use the radial-gradient carve. Each is a `--admin-notch`
square pinned to the right edge, directly above and below the pill:

```css
background: radial-gradient(
  circle var(--admin-notch) at 0% 0%,
  var(--admin-sidebar-bg) 0 var(--admin-notch),
  var(--admin-page-bg)      var(--admin-notch)
);
```

Inside the circle is sidebar white; outside it — the corner nearest the content
area — is page pink. That fills the corner with a quarter of pink whose arc runs
from the sidebar edge into the top of the pill, giving the continuous S-curve.
The `::after` mirrors it with the circle centred at `0% 100%`.

Two things make it work in both states:

1. The icon column is a fixed 88px whether expanded or collapsed, so icons stay
   put while labels retract — and the pill is always full-width and right-flush,
   so the notches land in the same place at 272px and at 88px.
2. The nav list has `py-5` (≥ the notch size) so the first and last items' notches
   are not clipped by the scroll container.

Tune the whole curve with the single `--admin-notch` variable in `globals.css`.

## Sidebar behaviour

- 272px expanded, 88px collapsed, animated with Framer Motion (`~300ms`, ease-out).
- Collapsed state persists in `localStorage` (`nexclinic:admin-sidebar-collapsed`).
  It is restored after mount rather than during render, so there is no hydration
  mismatch — expect one frame of the expanded sidebar on a hard refresh.
- Collapsed items are icon-only with a dark Radix tooltip to the right.
- Below 768px the sidebar becomes a fixed off-canvas drawer with a dark backdrop,
  opened from the header hamburger, closed by Escape, backdrop click, or navigation.
- Under `prefers-reduced-motion` every duration drops to 0 and chart entrance
  animations are switched off (`isAnimationActive={false}`).

## Admin design tokens

Defined at `:root` in `globals.css` (not scoped to the admin subtree, because
Radix dropdowns, tooltips and dialogs render into a portal on `<body>`), and
surfaced through `tailwind.config.ts` as the `admin` colour scale.

| Token | Value | Tailwind |
| --- | --- | --- |
| `--admin-page-bg` | `#FBE9F1` | `bg-admin-bg` |
| `--admin-sidebar-bg` / `--admin-card-bg` | `#FFFFFF` | `bg-admin-sidebar` / `bg-admin-card` |
| `--admin-text-primary` | `#241E33` | `text-admin-ink` |
| `--admin-border` | `#F0E3EA` | `border-admin-line` |
| gradients | as specified | `bg-admin-grad-pink` / `-purple` / `-blue` / `-orange` |

### Two contrast notes

**`--text-muted` is split in two.** The spec's `#9B94A8` is 2.9:1 on white, which
fails WCAG AA for text. It is kept as `--admin-text-muted-soft` (`text-admin-soft`)
for decorative use, and `text-admin-muted` resolves to `#6E6785` — visually the
same family at 5.4:1 — for every label and body string. Swap
`--admin-muted-rgb` back to `155 148 168` if you want the reference value verbatim.

**White on the gradient KPI cards does not reach AA.** The brief's gradients are
kept exactly as given, so the large bold numbers clear the 3:1 large-text
threshold, but the small uppercase labels on the pink card land at roughly 3.0:1
against normal-text's 4.5:1 requirement. This is a property of the palette, not
the markup. If strict AA is required, darken the first stop of
`--admin-grad-pink-purple` (around `#C2107A` reaches 4.5:1) or move those labels
onto a white chip.

## Charts

All Recharts, all in `components/admin/charts/index.tsx`, all sharing one axis,
grid and tooltip style so the set reads as a system. Each chart takes an
`ariaLabel` and renders as `role="img"` with a plain-language summary, and every
donut is paired with a text legend so the numbers are never colour-only.

## The PDF actions

"Download Report", "Export Report" and "Generate Payslip" produce a **real,
valid one-page PDF** in the browser via `lib/mock-pdf.ts` — a hand-written
PDF 1.4 writer with correct xref offsets, no dependency. It is still sample
output; swap it for a server-rendered document when the reporting service exists.

## Admin placeholders to replace

Everything in `lib/admin-data.ts` is mock data and says so at the top of the file.
Names, clinics, amounts, phone numbers, audit entries and incidents are invented.
Nothing is fetched or persisted: dialogs and forms show a local success state,
"Mark as Received" mutates component state only, and filters are client-side.


---

# Login / demo tour (`/login`)

Every **Book a Demo** CTA on the marketing site — nav, hero and showcase —
navigates here instead of opening a dialog. (The timeline's "Have a question?"
chip still opens the small enquiry dialog, since that is a question, not a demo.)

The page sits at `app/login/` so it uses only the minimal root layout: no Lenis
smooth scrolling and no rounded marketing frame.

```
app/login/
  page.tsx            metadata (noindex) + renders the view
  LoginView.tsx       the whole flow, client-side
components/login/
  RoleTabs.tsx        horizontal scrollable login-type tabs
  AnimatedField.tsx   floating-label field with hover/focus animation
  OtpInput.tsx        six-box one-time-code input
  PaperCutEdge.tsx    the layered white waves over the photograph
lib/login-data.ts     the six login types
public/images/        heart.jpg, lungs.jpg
```

## Login types (horizontal scrollable tabs)

One tab per Nexclinic portal: Patient, Doctor, Receptionist & Clinic, Super Admin,
Inventory, Corporate Wellness. The tab changes what the account is identified by
(`Mobile number or email` for a patient, `Medical council ID` for a doctor,
`Work email` for an admin) and where a successful sign-in would land.

`RoleTabs` is a real ARIA tablist, not a row of buttons:

- Left/Right arrows move between tabs, Home/End jump to the ends, and only the
  selected tab is in the page tab order (roving `tabindex`).
- The row scrolls horizontally with hidden scrollbars, snap points, fade masks at
  both ends and chevron buttons that appear only when there is more to scroll to
  (tracked with a `ResizeObserver` plus the scroll position).
- The selected tab is scrolled into view whenever it changes, including via keyboard.
- The active pill is a Framer Motion `layoutId` element, so it slides between tabs.
- Labels shorten on small screens ("Receptionist & Clinic" → "Reception").

Signing in as **Super Admin**, **Inventory** or **Corporate Wellness** offers a
"Continue to the dashboard" link into the real `/admin` routes. The other three
say plainly that those portals aren't part of this build yet.

## Field animation

`AnimatedField` layers three CSS-driven effects, so they cost nothing at runtime
and all fall back cleanly under `prefers-reduced-motion`:

1. the field lifts 2px on hover,
2. a soft gradient glow fades in behind the border on focus,
3. the label rises into the top of the field, shrinks to small caps and picks up
   the accent colour, while an accent line sweeps out from the centre.

The label animates off `:placeholder-shown` (the input carries a single-space
placeholder), so it stays raised whenever the field has a value — including on
browser autofill, which a JS `value`-watcher would miss. Password fields get a
show/hide toggle with a proper `aria-label`.

## Auth methods

- **Password** — identifier + password, "keep me signed in", forgot-password link.
- **Google** — inline SVG brand mark, no external asset request.
- **Phone OTP** — switches the form to a two-step flow: number → 6-digit code.
  `OtpInput` auto-advances on typing, steps back on Backspace in an empty box,
  moves with arrow keys, accepts a pasted code into all six boxes at once, and
  sets `autoComplete="one-time-code"` so iOS and Android offer the SMS code.

All three are **front-end only** — a 900ms simulated delay, then a success state
that says so. Nothing is sent anywhere and no account is created.

## The imagery

Both uploaded medical renders are used, replacing the reference design's foliage:

- **heart.jpg** fills the right panel, cropped at `object-[50%_36%]` so the heart
  sits clear of the glass caption card, with a lavender→pink tint over it to tie
  the crimson scan back into the Nexclinic palette.
- **lungs.jpg** is the ambient page backdrop — scaled 125%, blurred, at 70%
  opacity under a white/lavender wash and two colour blooms, so the card floats
  over it without the imagery competing with the form.

`PaperCutEdge` draws the reference's layered paper effect: three white waves
stepping out from the form panel over the photograph. Each sheet carries its own
drop shadow — without that, three whites at different opacities read as one soft
gradient rather than stacked paper. Both images use `next/image` with `fill`,
explicit `sizes` and `priority`; the heart has descriptive alt text and the
backdrop is `alt=""` inside an `aria-hidden` wrapper, since it is decoration.

Below `lg` the image becomes a short banner above the form, and the paper-cut
edge and caption card are dropped.


---

# Role portals

Five role dashboards, all reachable without a password: this is a front-end test
build, so picking a role at `/login` — or any chip in the portal switcher that
sits in every portal header — opens that dashboard directly. Nothing is
authenticated, nothing is persisted.

## One component set, five skins

Every portal screen is built from the same components (`components/portal/`).
The visual identity is a CSS-variable skin applied by a single wrapper class:

| Class | Portal | Palette |
| --- | --- | --- |
| `.theme-care` | Patient dashboard | mint / teal |
| `.theme-night` | Patient health overview | dark glass |
| `.theme-clinic` | Doctor + reception | indigo |
| `.theme-violet` | Patient profile | violet |
| `.theme-vault` | Inventory | indigo on a near-black panel |

The tokens (`--p-bg`, `--p-card`, `--p-ink`, `--p-muted`, `--p-line`,
`--p-accent`, `--p-soft`, `--p-grad`) are also declared on `:root`, so portal
components still render outside a skin — the login page relies on exactly that,
and its default `--p-grad` is the red→blue ramp.

## What is clickable

Every tile, row and card that represents a record navigates:

- Doctor's live queue and "All patients" rows → `/patients/[id]`
- Reception's arrivals board and "Last patients" → `/patients/[id]`
- Report tiles on both clinic dashboards → `/admin/analytics`
- Inventory KPI cards → `/admin/inventory`; quick actions → their admin routes
- Patient's visit rows and "Deep dive" card → `/patient/health`
- Schedule blocks in the week strip → the day roster

## Downloads

All of them produce a real file, built in the browser:

| Where | Button | File |
| --- | --- | --- |
| Patient dashboard | Health summary | PDF |
| Patient dashboard | CSV | heart-rate series |
| Health overview | Report | cardiac overview PDF |
| Doctor | Export queue | CSV |
| Doctor | SOAP note | PDF |
| Reception | Day sheet | CSV |
| Patient profile | Full record / Visit history | PDF / CSV |
| Inventory | Export all / PDF | CSV / request PDF |

PDFs go through `lib/mock-pdf.ts` (a hand-written PDF 1.4 writer, validated to
parse). CSVs go through `lib/downloads.ts`, quoted and BOM-prefixed so Excel
opens ₹, ° and accented characters correctly instead of as mojibake.

# Motion buttons

`components/motion-ui/buttons.tsx` — seven buttons, each with its own signature
interaction, taken from the reference clip. The motion tells you what kind of
action it is before you read the label:

| Component | Interaction | Used for |
| --- | --- | --- |
| `ConicButton` | rotating spectrum ring around the pill | primary navigation |
| `FlyButton` | icon flies off and comes back | send / add |
| `MorphButton` | morphs into its confirmed state | save / approve / sign |
| `StretchButton` | button stretches, arrow travels, sheen sweeps | enter / continue |
| `ExpandButton` | opens into a row of icon actions | share / export |
| `ChevronButton` | chevron hands off to the next one | next / paginate |
| `DownloadButton` | ring fills, arrow bobs, then a tick | download a file |

The conic ring uses `@property --btn-angle` with mask compositing, so the border
itself rotates rather than the button. All seven collapse to a plain colour
change under `prefers-reduced-motion`, and `DownloadButton` announces completion
through a visually hidden `role="status"`.

# Login

Red→blue aurora over the blurred lung scan: three blooms drifting on
22 / 28 / 34-second cycles (frozen under reduced motion), with the heart study
and its layered paper-cut edge on the right.

The role tabs still work as before — scrollable, arrow-key navigable, sliding
pill — but the primary action is now **Enter the &lt;role&gt; portal**, and a grid
below puts all six portals one tap away. The password / Google / OTP screens are
kept behind a disclosure and clearly labelled as presentation only.

# Illustrations

No stock imagery was downloaded. Everything decorative is inline SVG drawn in
this repo, so it scales, inherits the active skin's tokens and costs no request:
the body map with its keyboard-reachable sensor points, the plant behind the
patient-profile sidebar, the profile avatar, the desk vignette, and the grid /
aurora / blob backdrops in `components/portal/Backdrop.tsx`.

The two supplied photographs are used as before: `heart.jpg` on the login panel
and again as the cardiac study on `/patient/health`; `lungs.jpg` as the blurred
backdrop behind the login card.

Payment methods on the patient profile are named in text rather than reproduced
as brand logos.

# Still not wired

No backend anywhere. Auth is deliberately off, forms show local success states,
filters and tabs are client-side, and `Approve` / `Mark as received` mutate
component state only. Every dataset lives in `lib/portal-data.ts`,
`lib/admin-data.ts` and `lib/data.ts`, each flagged as sample data at the top.


---

# Nexclinic build — what changed

The product is now **Nexclinic**, and `/` is the 2-grid portal entry rather than
the marketing page (that moved to `/site`). Six portals are wired end to end:
homepage, Super Admin, Surgeon, Reception, Patient and Inventory Manager.

**Read [ROUTES.md](./ROUTES.md) first** — it is the architecture map: every
route, every cross-portal action, and where the globally managed pieces live.

## One store, joined-up flows

`lib/clinic-store.tsx` is a single context + reducer persisted to
`localStorage`, mounted once in `app/layout.tsx`. It is the reason the portals
behave like one system:

- Book from the homepage → it appears in **Reception → Requests** and pushes a
  phone notification to the front desk.
- Approve it → the patient is notified and it joins the **surgeon's** approved
  list.
- Bill a medicine at the front desk → the same quantity leaves **inventory
  stock**, the movement is written to the stock log, and anything crossing its
  reorder level pushes an alert to the inventory manager.
- Change a shift in **Admin → Staff** → a push goes to that staff member's phone.
- Press **Emergency** at the front desk → every surgeon is paged.
- Use the floating **Schedule Surgery** button → OR prep goes to reception.

Phone-style pushes are `components/system/PhoneToasts.tsx`; each portal has its
own notification centre via `components/system/NoticeBell.tsx`.

## Design system

No new visual language was introduced. Everything reuses what was already built:
`PortalShell` with its five theme skins, the `AdminShell` with the notched
active-item merge, `components/portal/ui.tsx`, the motion button set, the
Recharts wrappers and the shadcn primitives.

## Boundary between Super Admin and Inventory

Enforced by construction: `lib/admin-nav.ts` and `INVENTORY_NAV` in
`lib/portal-nav.ts` are disjoint. Admin has no stock, suppliers, orders or
equipment; inventory has no payroll, staff, revenue or settings. Both
`/admin/access` and `/admin/settings → Roles & permissions` show the scope each
access role is limited to.

## Still a front-end build

No backend, no authentication. Signing in routes; forms write to the client
store; PDFs and CSVs are generated in the browser. Every dataset is sample data
and says so at the top of its file (`lib/clinic-seed.ts`, `lib/admin-metrics.ts`,
`lib/portal-data.ts`, `lib/reports-data.ts`).
