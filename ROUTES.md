# Nexclinic — routing & flow map

Every route below exists and every internal link resolves to one of them
(verified: no dead links). Nothing is authenticated — this is a front-end test
build, so choosing a role opens that portal directly.

```
/                         Marketing landing page — Nav "Book a Demo" / "Login" both
                            open /login
/login                    Portal picker — 2-grid entry
                            left  · Nexclinic introduction, pillars, stats
                            right · role sign-in cards + "Enter New Appointment"
/signin/[role]            2-grid sign-in — clinic info left, demo credentials right
                            roles: admin · surgeon · reception · patient · inventory

────────────────────────── SUPER ADMIN (no inventory) ──────────────────────────
/admin                    → /admin/dashboard
/admin/dashboard          Clickable oversight tabs + TWO line charts
                            · monthly revenue (this year vs last)
                            · patient visits / footfall (total vs new)
/admin/staff              Staff profile list, search, department filter, Add Staff
/admin/staff/[id]         Profile · editable shift → pushes a phone notification
                            · salary breakdown + payslip download
                            · portal access toggle
/admin/payroll            Editable salary slips (basic, HRA, allowances, bonus,
                            tax) with live net pay, plus monthly payroll reports
/admin/access             Login credentials for all staff, scope per access role,
                            enable/disable, "Add new staff" generates credentials
/admin/analytics          Revenue by source with daily / monthly / yearly filters
/admin/logs               Revenue history · patient payments history
/admin/expenses           Net profit, payroll, utilities, expense ledger by month
/admin/settings           Clinic profile · Billing & GST · Roles & permissions
                            · WhatsApp integration · Backups

────────────────────────────── SURGEON / DOCTOR ────────────────────────────────
/surgeon                  → /surgeon/dashboard
   layout.tsx mounts the floating "Schedule Surgery" button on EVERY screen
/surgeon/dashboard        Patient-database search · today's appointments,
                            active patients, average wait · "next up first
                            patient" with Start consultation · Quick action panel
/surgeon/patients         Full patient database, each row starts a consultation
/surgeon/consultation/[id]  Demographics · full patient history · send report to
                            WhatsApp · medical records · vitals (edit) ·
                            editable diet plan · clinical note
/surgeon/scribe           AI scribe — pick a patient, live transcript, generated
                            SOAP note, sign into the chart
/surgeon/reports          Recent report history per patient, filterable

──────────────────────────── RECEPTION / FRONT DESK ────────────────────────────
/reception                → /reception/dashboard
/reception/dashboard      Patient queue with low/medium/high priority — the list
                            re-sorts itself on change · Emergency button
                            broadcasts to every surgeon · add walk-in
/reception/requests       Pending requests → Approve · Decline · Reschedule
/reception/billing        Patient dropdown · clinician dropdown · medicine search
                            → cart → Generate bill (prints a PDF and draws the
                            same quantities out of inventory stock)
/reception/onboarding     Walk-in chatbot + desk QR; finishing adds the patient
                            to the live queue

──────────────────────────────── PATIENT ───────────────────────────────────────
/patient                  → /patient/dashboard
/patient/dashboard        Profile · change password · refer a friend (QR) ·
                            upcoming appointments · Quick actions:
                            Refill · Book visit · View record · Telehealth
/patient/records          Medical timeline: payments, clinical notes, lab
                            results, visits, prescriptions — filterable
/patient/health           Dark cardiac overview (kept from the earlier build)

───────────────────────── INVENTORY MANAGER (separate) ─────────────────────────
/inventory                → /inventory/dashboard
/inventory/dashboard      Overview: category, quantity, expiry, delete action
/inventory/stock          Low stock (medicines / equipment), pin any item as low,
                            "Add stock / item" quick-add dialog
/inventory/suppliers      Address, contact, distance, rating
/inventory/orders         Order history with print, plus Place order:
                            vendor dropdown · medicine search · cart preview ·
                            confirm order
/inventory/equipment      Equipment under maintenance, "Add equipment log"
                            (log maintenance or register new + schedule service)
/inventory/logs           Every stock movement: orders, receipts, issues, adds,
                            deletes, low-stock pins

──────────────────────────────── SHARED ────────────────────────────────────────
/patients/[id]            Clinical patient profile, opened from surgeon and
                            reception rows
```

## Global state

`lib/clinic-store.tsx` — one React context + reducer, persisted to
`localStorage`, mounted in `app/layout.tsx`. It is what makes the flows join up
rather than each screen being an island:

| Action in one portal | Lands in another |
| --- | --- |
| Login page "Enter New Appointment" | Reception → Requests, with a phone push |
| Reception approves / declines / reschedules | Patient gets a phone push; approved appointments appear on the surgeon's list |
| Reception raises Emergency | Every surgeon gets a phone push; admin gets a system notice |
| Reception generates a bill | Inventory stock is decremented; anything crossing its reorder level pushes an alert to the inventory manager, and the movement is written to the stock log |
| Surgeon schedules surgery (floating button) | Reception gets an OR-prep phone push |
| Surgeon edits vitals / diet / signs a note | Stored on the patient chart; the consultation screen and patient timeline read it back |
| Admin changes a shift | The staff member gets a phone push naming their number |
| Admin adds staff / issues credentials | Appears in Access Control; welcome push sent |
| Inventory places / receives an order | Stock quantities and the history log update |
| Patient requests a refill or books a visit | Reception gets the request |

`components/system/PhoneToasts.tsx` renders the handset-style pushes;
`components/system/NoticeBell.tsx` is the per-portal notification centre.

## Globally state-managed pieces

- **Sidebar** — `components/portal/PortalShell.tsx`, one component, five skins
  (`.theme-care`, `.theme-clinic`, `.theme-violet`, `.theme-vault`,
  `.theme-night`). Holds its own collapse/drawer state; admin uses
  `components/admin/AdminShell.tsx` with the notched active-item merge.
- **2-grid layouts** — `app/login/HomeEntry.tsx` and `app/signin/[role]/SignInView.tsx`
  share the same `lg:grid-cols-2` structure: information left, action right.
- **Floating button** — `components/surgeon/ScheduleSurgeryFab.tsx`, mounted once
  in `app/surgeon/layout.tsx` so it is on every surgeon screen and dispatches
  into the shared store.

## Super Admin ↔ Inventory boundary

The two navigation configs are disjoint by construction:

- `lib/admin-nav.ts` — Dashboard, Staff, Payroll, Access Control, Analytics,
  History Logs, Expenses, Settings. **No** stock, suppliers, orders or equipment.
- `lib/portal-nav.ts` → `INVENTORY_NAV` — Overview, Stock, Suppliers, Orders,
  Equipment, Logs. **No** payroll, staff, revenue or settings.

`/admin/settings → Roles & permissions` and `/admin/access` both display the
scope each access role is limited to, so the boundary is visible in the UI as
well as the code.
