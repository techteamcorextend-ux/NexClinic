/**
 * Single source of truth for every piece of copy on the Nexclinic landing page.
 * Edit here — no marketing copy should live inside a component.
 */

/* ─────────────────────────  NAV  ───────────────────────── */

export const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Portals", href: "#portals" },
  { label: "AI Suite", href: "#ai-suite" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
] as const;

/* ─────────────────────────  HERO  ───────────────────────── */

export const HERO = {
  eyebrow: "Unified Clinical Operating System",
  headline: ["The operating system for", "modern healthcare facilities."],
  subtext:
    "Nexclinic unifies patient records, doctor workflows, front-desk operations, inventory, and AI-powered mental wellness into one secure platform — built for hospitals and multi-clinic networks.",
  primaryCta: "Book a Demo",
  secondaryCta: "See how it works",
};

export const HERO_PROOF = {
  index: "01",
  label: "Enterprise Ready",
  headline: "Built for Hospitals & Multi-Clinic Networks",
  body: "Nexclinic unifies six role-based portals — Patient, Doctor, Receptionist, Super Admin, Inventory, and Corporate Wellness — into a single secure system.",
};

/* ─────────────────────  MARQUEE TICKERS  ───────────────── */

export const MARQUEE_ONE = [
  "Clinical Care",
  "AI Wellness",
  "Smart Billing",
  "Live Inventory",
  "Facility Analytics",
];

export const MARQUEE_TWO = [
  "Run Your Entire Clinic",
  "Empower Every Role",
  "Care Without Limits",
];

export const MARQUEE_SMALL = ["Patient-First", "Role-Aware", "Audit-Ready"];

/* ──────────────────  STATS + RADIAL DIAGRAM  ───────────── */

/**
 * ⚠️ PLACEHOLDER STATS — swap for real, verified numbers before launch.
 * `value` is the animated target, `suffix`/`prefix` are rendered verbatim,
 * `staticValue` is used for non-numeric stats (rendered without a count-up).
 */
export const STATS: {
  staticValue?: string;
  value?: number;
  suffix?: string;
  label: string;
}[] = [
  { value: 6, label: "Role-Based Portals" },
  { value: 13, suffix: "+", label: "AI-Powered Modules" },
  { value: 100, suffix: "%", label: "Paperless Patient Records" },
  { staticValue: "Multi", label: "Clinic & Facility Ready" },
];

export const STATS_INTRO = {
  label: "Nexclinic's Unified Care Model",
  sentence:
    "Every portal, every workflow, every patient touchpoint — running on one system.",
};

export const CARE_JOURNEY = [
  "Registration & Triage",
  "Consultation & AI Scribe",
  "Billing & Pharmacy",
  "Discharge Summary",
  "Follow-up & Wellness",
  "Analytics & Audit",
];

/** Index of the node rendered as the highlighted / "active" step. */
export const CARE_JOURNEY_ACTIVE_INDEX = 1;

/* ─────────────────────  FEATURE ACCORDION  ─────────────── */

export const FEATURES = [
  {
    id: "access",
    title: "Unified Role-Based Access",
    body: "Secure registration, standard login, Google login, and OTP verification with strict role-based access for Patients, Doctors, Staff, and Super Admins.",
  },
  {
    id: "documentation",
    title: "AI Clinical Documentation",
    body: "Live AI audio monitoring during consultations auto-generates structured SOAP notes, cutting documentation time for doctors.",
  },
  {
    id: "intelligence",
    title: "Real-Time Facility Intelligence",
    body: "Visual revenue, footfall, and expense analytics, a payroll engine, and comprehensive audit logs tracking every system action.",
  },
];

export const FEATURE_CARD = {
  label: "Meet Every Portal",
  link: "Explore All Portals",
};

/* ───────────────────────  PORTAL CARDS  ────────────────── */

export const PORTALS = [
  {
    name: "Patient Portal",
    body: "Health vault, mood tracker, women's health suite, and AI wellness chat.",
  },
  {
    name: "Doctor Portal",
    body: "Live queue, EHR, AI scribe, and one-click discharge approval.",
  },
  {
    name: "Receptionist & Clinic Portal",
    body: "Triage board, walk-in QR onboarding, billing, and pharmacy sync.",
  },
  {
    name: "Super Admin Dashboard",
    body: "Multi-clinic oversight, financial analytics, payroll, and audit logs.",
  },
  {
    name: "Inventory Management",
    body: "Medicines, equipment, and OT supplies with automated low-stock alerts.",
  },
  {
    name: "Corporate Wellness & Emergency",
    body: "Workforce stress analytics and multi-portal SOS response.",
  },
];

export const PORTALS_HEADER = {
  headline: "Six Portals. One System.",
  subtext: "Every role in your facility gets a purpose-built workspace.",
};

/* ────────────────────  TECHNOLOGY STEPPER  ─────────────── */

export const STEPPER_HEADER = {
  headline: "The Architecture Behind Nexclinic.",
  subtext: "From first login to follow-up care, every layer works together.",
};

export const STEPS = [
  {
    title: "Omni-Channel Authentication",
    body: "Secure login, Google login, OTP, and strict role-based access.",
  },
  {
    title: "AI Clinical Scribe",
    body: "Live audio monitoring auto-generates structured SOAP notes.",
  },
  {
    title: "Smart Billing & Payments",
    body: "Dynamic UPI QR, Paytm, PhonePe, and Google Pay checkout.",
  },
  {
    title: "Automated Inventory",
    body: "Real-time stock tracking with low-stock and expiry alerts.",
  },
  {
    title: "Facility Analytics & Audit",
    body: "Visual dashboards, payroll engine, and full audit logs.",
  },
  {
    title: "Nexclinic AI Wellness",
    body: "AI therapy chat, mood tracking, guided meditation, and diet AI.",
  },
];

/* ─────────────────────  EXPLORE PANELS  ────────────────── */

export const EXPLORE_PANELS = [
  {
    index: "01",
    title: "Clinical Management",
    body: "EHR, triage boards, OT scheduling, and lab tracking.",
  },
  {
    index: "02",
    title: "AI Wellness Suite",
    body: "Nexclinic's mental health chat, cycle tracking, and diet AI.",
  },
  {
    index: "03",
    title: "Facility Operations",
    body: "Inventory, billing, payroll, and multi-clinic administration.",
  },
];

/* ────────────────────  SHOWCASE WIDGET  ────────────────── */

export const SHOWCASE = {
  headline: "Built to Run Your Entire Facility.",
  ctaApp: "Get the App",
  ctaDemo: "Book a Demo",
  widget: {
    label: "Live Queue Tracker",
    sublabel: "Average Wait Time",
    /* ⚠️ PLACEHOLDER METRIC — wire to real queue telemetry before launch. */
    value: "8 min",
  },
};

/* ────────────────────  RESOURCE LIBRARY  ───────────────── */

export const RESOURCES_HEADER = {
  headlineLead: "Nexclinic's Clinical",
  headlineGradient: "Resource Library",
  cta: "See all",
};

export const RESOURCES = [
  { title: "Implementing AI Scribe in Your OPD" },
  { title: "Reducing No-Shows with Predictive AI" },
  { title: "A Clinic's Guide to Digital Discharge Summaries" },
];

/* ─────────────────────  TESTIMONIALS  ──────────────────── */

/**
 * ⚠️ PLACEHOLDER TESTIMONIALS — names, roles and quotes are invented for
 * layout purposes only. Replace every entry with real, approved quotes from
 * named clinic partners (with written consent) before launch.
 */
export const TESTIMONIALS = [
  {
    featured: true,
    quote:
      "Our OPD documentation time dropped noticeably in the first month. Doctors stopped typing and started looking at patients again.",
    name: "Placeholder Name",
    role: "Medical Director, Placeholder Hospital",
  },
  {
    featured: false,
    quote:
      "One login for triage, billing and pharmacy meant the front desk stopped juggling three systems during the morning rush.",
    name: "Placeholder Name",
    role: "Operations Head, Placeholder Clinic Network",
  },
  {
    featured: false,
    quote:
      "The audit trail alone justified the switch. Every action in the facility is accounted for and exportable.",
    name: "Placeholder Name",
    role: "Compliance Lead, Placeholder Multi-Specialty",
  },
  {
    featured: false,
    quote:
      "Low-stock alerts have quietly removed a whole category of Monday-morning emergencies from our OT schedule.",
    name: "Placeholder Name",
    role: "Inventory Manager, Placeholder Care Group",
  },
];

export const TESTIMONIALS_HEADER = {
  headline: "Trusted by Healthcare Leaders.",
};

/* ────────────────────  PLATFORM TIMELINE  ──────────────── */

export const MILESTONES = [
  {
    year: "2023",
    body: "Nexclinic CMS core launched: Patient, Doctor, and Receptionist portals.",
  },
  {
    year: "2024",
    body: "Super Admin analytics and Inventory Management added.",
  },
  {
    year: "2025",
    body: "Nexclinic AI Wellness Suite launched: AI therapy, women's health tools.",
  },
  {
    year: "2026",
    body: "Corporate Wellness and Emergency Response modules added.",
  },
];

export const TIMELINE_CHIP = "Have a question?";

/* ───────────────────────  CONTACT  ─────────────────────── */

export const CONTACT = {
  headline: "Book a Demo",
  submit: "Request a Demo",
  volumeOptions: [
    "Under 25 beds / < 50 OPD per day",
    "25–100 beds / 50–200 OPD per day",
    "100–300 beds / 200–500 OPD per day",
    "300+ beds / 500+ OPD per day",
    "Multi-clinic network",
  ],
  /* ⚠️ PLACEHOLDER CONTACT DETAILS — replace with the real HQ record. */
  address: "Nexclinic HQ · 4th Floor, Prestige Tech Park, Bengaluru 560103, India",
  email: "hello@nexclinic.health",
  phone: "+91 80 4718 2200",
};

/* ────────────────────────  FOOTER  ─────────────────────── */

export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      "Patient Portal",
      "Doctor Portal",
      "Receptionist Portal",
      "Super Admin",
      "Inventory",
      "Corporate Wellness",
    ],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Data Security", "Terms of Service"],
  },
];

export const FOOTER_META = {
  copyright: `© ${new Date().getFullYear()} Nexclinic Health Systems. All rights reserved.`,
  tagline: "The operating system for modern healthcare facilities.",
};
