/**
 * ─────────────────────────────────────────────────────────────────────
 *  SAMPLE DATA for the role portals (patient, doctor, reception,
 *  inventory) and the shared patient profile.
 *
 *  All of it is MOCK DATA for a front-end test run. Nothing is fetched or
 *  persisted, no auth is enforced, and every person, reading and amount
 *  below is invented. Replace each export with real queries before this
 *  goes near a live facility.
 * ─────────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════ PEOPLE ═══════════════════════════ */

export type Vital = {
  id: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
  trend: "up" | "down" | "flat";
  tone: "accent" | "warm" | "cool";
};

export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  sex: string;
  bloodType: string;
  heightCm: number;
  weightKg: number;
  city: string;
  registered: string;
  dob: string;
  email: string;
  phone: string;
  clinic: string;
  doctor: string;
  status: "Stable" | "Follow-up" | "Critical";
  condition: string;
  vitals: Vital[];
  heartRate: { time: string; bpm: number }[];
  visits: { id: string; title: string; date: string; kind: string; doctor: string }[];
  courses: {
    id: string;
    title: string;
    detail: string;
    modules: number;
    status: "Completed" | "In progress";
  }[];
  activity: { id: string; title: string; detail: string; when: string; kind: string }[];
};

/** SAMPLE — heart-rate series shared by the patient charts. */
function hrSeries(seed: number) {
  const times = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
  ];
  let state = seed;
  return times.map((time) => {
    state = (state * 1103515245 + 12345) % 2147483648;
    const jitter = (state / 2147483648) * 28 - 14;
    return { time, bpm: Math.round(88 + jitter) };
  });
}

export const PATIENTS: Patient[] = [
  {
    id: "p-1001",
    name: "Clara Martin",
    initials: "CM",
    age: 34,
    sex: "Female",
    bloodType: "A+",
    heightCm: 168,
    weightKg: 61,
    city: "Lyon, France",
    registered: "03 February 2023",
    dob: "21 July 1992",
    email: "clara.martin@mail.fr",
    phone: "+33 6 48 72 95 31",
    clinic: "Sunrise Multi-Specialty — Koramangala",
    doctor: "Dr. Priya Nair",
    status: "Stable",
    condition: "Routine cardiology follow-up",
    vitals: [
      { id: "temp", label: "Temperature", value: "36.6", unit: "°C", delta: "+1.4%", trend: "up", tone: "accent" },
      { id: "sugar", label: "Blood Sugar", value: "120", unit: "mg / dL", delta: "+2.1%", trend: "up", tone: "warm" },
      { id: "bp", label: "Blood Pressure", value: "80 / 120", unit: "mmHg", delta: "−0.4%", trend: "down", tone: "cool" },
      { id: "spo2", label: "Oxygen level", value: "95", unit: "% SpO₂", delta: "+1.2%", trend: "up", tone: "accent" },
    ],
    heartRate: hrSeries(7),
    visits: [
      { id: "v-1", title: "Complete Blood Count (CBC)", date: "24 April 2026", kind: "Lab", doctor: "Dr. Shimron Hetmyer" },
      { id: "v-2", title: "Clinic Visit Appointment", date: "31 May 2026", kind: "OPD", doctor: "Dr. Shilpa Rao" },
      { id: "v-3", title: "Video Consultation Chat", date: "02 June 2026", kind: "Tele", doctor: "Dr. Kartik Aryan" },
    ],
    courses: [
      { id: "c-1", title: "Understanding your heart report", detail: "Key principles and good practice", modules: 6, status: "Completed" },
      { id: "c-2", title: "Mobile wellness tracking", detail: "Build an intuitive routine", modules: 8, status: "Completed" },
      { id: "c-3", title: "Guided breathing programme", detail: "From first session to daily habit", modules: 5, status: "In progress" },
    ],
    activity: [
      { id: "a-1", title: "Consultation completed", detail: "Cardiology · Dr. Priya Nair", when: "Today", kind: "visit" },
      { id: "a-2", title: "Lab report submitted", detail: "Lipid profile uploaded to the vault", when: "Yesterday", kind: "report" },
      { id: "a-3", title: "Badge earned", detail: "14-day mood tracking streak", when: "2 days ago", kind: "badge" },
    ],
  },
  {
    id: "p-1002",
    name: "Arya Wijaya Kusuma",
    initials: "AK",
    age: 41,
    sex: "Male",
    bloodType: "O+",
    heightCm: 174,
    weightKg: 78,
    city: "Bengaluru, India",
    registered: "12 August 2024",
    dob: "04 March 1985",
    email: "arya.kusuma@example.com",
    phone: "+91 98867 41220",
    clinic: "Sunrise Whitefield",
    doctor: "Dr. Sameer Kulkarni",
    status: "Follow-up",
    condition: "Post-operative knee review",
    vitals: [
      { id: "temp", label: "Temperature", value: "37.1", unit: "°C", delta: "+0.6%", trend: "up", tone: "warm" },
      { id: "sugar", label: "Blood Sugar", value: "142", unit: "mg / dL", delta: "+4.8%", trend: "up", tone: "warm" },
      { id: "bp", label: "Blood Pressure", value: "86 / 132", unit: "mmHg", delta: "+1.9%", trend: "up", tone: "warm" },
      { id: "spo2", label: "Oxygen level", value: "97", unit: "% SpO₂", delta: "+0.3%", trend: "flat", tone: "accent" },
    ],
    heartRate: hrSeries(19),
    visits: [
      { id: "v-1", title: "Post-op physiotherapy", date: "18 April 2026", kind: "OPD", doctor: "Dr. Sameer Kulkarni" },
      { id: "v-2", title: "Knee X-ray review", date: "02 May 2026", kind: "Imaging", doctor: "Dr. Shilpa Rao" },
    ],
    courses: [
      { id: "c-1", title: "Rebuilding strength safely", detail: "Guided post-op recovery", modules: 7, status: "In progress" },
    ],
    activity: [
      { id: "a-1", title: "Physiotherapy session logged", detail: "Week 6 of 12", when: "Today", kind: "visit" },
      { id: "a-2", title: "Imaging uploaded", detail: "Right knee, AP and lateral", when: "3 days ago", kind: "report" },
    ],
  },
  {
    id: "p-1003",
    name: "Sherly Indriani",
    initials: "SI",
    age: 29,
    sex: "Female",
    bloodType: "B+",
    heightCm: 162,
    weightKg: 55,
    city: "Bengaluru, India",
    registered: "27 January 2025",
    dob: "16 November 1996",
    email: "sherly.indriani@example.com",
    phone: "+91 90084 33517",
    clinic: "Sunrise Mind & Wellness",
    doctor: "Dr. Fatima Sheikh",
    status: "Stable",
    condition: "Anxiety management programme",
    vitals: [
      { id: "temp", label: "Temperature", value: "36.4", unit: "°C", delta: "−0.2%", trend: "down", tone: "accent" },
      { id: "sugar", label: "Blood Sugar", value: "96", unit: "mg / dL", delta: "−1.1%", trend: "down", tone: "accent" },
      { id: "bp", label: "Blood Pressure", value: "74 / 112", unit: "mmHg", delta: "−0.8%", trend: "down", tone: "cool" },
      { id: "spo2", label: "Oxygen level", value: "99", unit: "% SpO₂", delta: "+0.4%", trend: "up", tone: "accent" },
    ],
    heartRate: hrSeries(31),
    visits: [
      { id: "v-1", title: "Therapy session 8", date: "26 April 2026", kind: "Tele", doctor: "Dr. Fatima Sheikh" },
      { id: "v-2", title: "Wellness review", date: "20 May 2026", kind: "OPD", doctor: "Dr. Fatima Sheikh" },
    ],
    courses: [
      { id: "c-1", title: "Sleep reset", detail: "Six weeks to a steadier night", modules: 6, status: "Completed" },
      { id: "c-2", title: "Grounding techniques", detail: "Short practices for hard days", modules: 4, status: "In progress" },
    ],
    activity: [
      { id: "a-1", title: "Mood entry recorded", detail: "Calm · 4 of 5", when: "Today", kind: "badge" },
      { id: "a-2", title: "Session completed", detail: "Therapy · 50 minutes", when: "Yesterday", kind: "visit" },
    ],
  },
  {
    id: "p-1004",
    name: "Nafiu Efandyar Maulidy",
    initials: "NM",
    age: 52,
    sex: "Male",
    bloodType: "AB+",
    heightCm: 171,
    weightKg: 84,
    city: "Bengaluru, India",
    registered: "09 December 2023",
    dob: "30 September 1973",
    email: "nafiu.m@example.com",
    phone: "+91 99450 77812",
    clinic: "Sunrise Multi-Specialty — Koramangala",
    doctor: "Dr. Vivek Bhatt",
    status: "Critical",
    condition: "Uncontrolled hypertension — under observation",
    vitals: [
      { id: "temp", label: "Temperature", value: "37.8", unit: "°C", delta: "+2.6%", trend: "up", tone: "warm" },
      { id: "sugar", label: "Blood Sugar", value: "188", unit: "mg / dL", delta: "+9.4%", trend: "up", tone: "warm" },
      { id: "bp", label: "Blood Pressure", value: "98 / 158", unit: "mmHg", delta: "+6.1%", trend: "up", tone: "warm" },
      { id: "spo2", label: "Oxygen level", value: "92", unit: "% SpO₂", delta: "−1.8%", trend: "down", tone: "cool" },
    ],
    heartRate: hrSeries(53),
    visits: [
      { id: "v-1", title: "Emergency triage", date: "27 April 2026", kind: "ER", doctor: "Dr. Vivek Bhatt" },
      { id: "v-2", title: "Cardiology consult", date: "28 April 2026", kind: "OPD", doctor: "Dr. Priya Nair" },
    ],
    courses: [],
    activity: [
      { id: "a-1", title: "Admitted to Ward 3", detail: "Bed 12 · under observation", when: "Today", kind: "visit" },
      { id: "a-2", title: "Medication adjusted", detail: "Anti-hypertensive dose revised", when: "Today", kind: "report" },
    ],
  },
];

export function findPatient(id: string) {
  return PATIENTS.find((patient) => patient.id === id);
}

/** The patient whose own portal is shown when "Patient" is picked at login. */
export const SIGNED_IN_PATIENT = PATIENTS[0];

/* ═══════════════════════ DOCTOR / RECEPTION ═══════════════════════ */

export const DOCTOR_PROFILE = {
  name: "Dr. Shabrina Putri",
  short: "Shabrina",
  initials: "SP",
  speciality: "General Medicine",
  clinic: "Sunrise Multi-Specialty — Koramangala",
};

export const RECEPTION_PROFILE = {
  name: "Kavya Reddy",
  short: "Kavya",
  initials: "KR",
  role: "Front Desk Lead",
  clinic: "Sunrise Multi-Specialty — Koramangala",
};

/** SAMPLE — headline counters on the doctor and reception dashboards. */
export const CLINIC_REPORT = [
  { id: "patients", label: "Patients", value: 1032, tone: "indigo" },
  { id: "consults", label: "Consultation", value: 207, tone: "teal" },
  { id: "inject", label: "Injections", value: 128, tone: "rose" },
  { id: "surgery", label: "Surgery", value: 48, tone: "amber" },
];

export type ScheduleBlock = {
  id: string;
  title: string;
  detail: string;
  day: number;
  start: string;
  end: string;
  tone: "indigo" | "teal" | "rose" | "amber";
  people: number;
  /** How many day columns the block covers in the week strip. */
  span: number;
  /** Row it sits on, so overlapping blocks never collide. */
  row: number;
};

/** SAMPLE — this week's appointment blocks (day 0 = Monday). */
export const SCHEDULE: ScheduleBlock[] = [
  { id: "s-1", title: "Check Up", detail: "Routine health check-ups", day: 0, start: "09:00", end: "11:00", tone: "indigo", people: 14, span: 2, row: 1 },
  { id: "s-2", title: "Consultation online", detail: "Tele-consult roster", day: 0, start: "14:00", end: "16:00", tone: "indigo", people: 9, span: 2, row: 3 },
  { id: "s-3", title: "Vaccine injection", detail: "Routine immunisation", day: 1, start: "10:00", end: "12:30", tone: "teal", people: 22, span: 2, row: 2 },
  { id: "s-4", title: "Surgery", detail: "Elective procedures", day: 3, start: "08:00", end: "13:00", tone: "rose", people: 2, span: 2, row: 1 },
  { id: "s-5", title: "Antenatal clinic", detail: "Scheduled reviews", day: 4, start: "11:00", end: "13:00", tone: "amber", people: 11, span: 2, row: 3 },
  { id: "s-6", title: "Follow-up block", detail: "Post-op and discharge reviews", day: 5, start: "09:30", end: "12:00", tone: "indigo", people: 17, span: 2, row: 2 },
];

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** SAMPLE — patients seen per weekday, for the reception footfall chart. */
export const PATIENTS_PER_DAY = [
  { day: "Tue", count: 96 },
  { day: "Wed", count: 118 },
  { day: "Thu", count: 134 },
  { day: "Fri", count: 121 },
  { day: "Sat", count: 152 },
];

export type QueueEntry = {
  id: string;
  patientId: string;
  name: string;
  initials: string;
  reason: string;
  token: string;
  waited: string;
  state: "In consult" | "Waiting" | "Ready" | "Checked in";
};

/** SAMPLE — the doctor's live queue. */
export const DOCTOR_QUEUE: QueueEntry[] = [
  { id: "q-1", patientId: "p-1001", name: "Clara Martin", initials: "CM", reason: "Cardiology follow-up", token: "A-14", waited: "In consult", state: "In consult" },
  { id: "q-2", patientId: "p-1002", name: "Arya Wijaya Kusuma", initials: "AK", reason: "Post-op knee review", token: "A-15", waited: "6 min", state: "Ready" },
  { id: "q-3", patientId: "p-1003", name: "Sherly Indriani", initials: "SI", reason: "Anxiety programme review", token: "A-16", waited: "13 min", state: "Waiting" },
  { id: "q-4", patientId: "p-1004", name: "Nafiu Efandyar Maulidy", initials: "NM", reason: "Hypertension — observation", token: "A-17", waited: "21 min", state: "Waiting" },
];

export type Arrival = {
  id: string;
  patientId: string;
  name: string;
  initials: string;
  slot: string;
  doctor: string;
  kind: string;
  state: "Checked in" | "Expected" | "No show";
};

/** SAMPLE — the front desk's arrivals board. */
export const ARRIVALS: Arrival[] = [
  { id: "r-1", patientId: "p-1002", name: "Arya Wijaya Kusuma", initials: "AK", slot: "09:00 – 11:00", doctor: "Dr. Sameer Kulkarni", kind: "Orthopaedics", state: "Checked in" },
  { id: "r-2", patientId: "p-1003", name: "Sherly Indriani", initials: "SI", slot: "09:30 – 11:00", doctor: "Dr. Fatima Sheikh", kind: "Psychiatry", state: "Checked in" },
  { id: "r-3", patientId: "p-1004", name: "Nafiu Efandyar Maulidy", initials: "NM", slot: "10:00 – 11:30", doctor: "Dr. Vivek Bhatt", kind: "General Medicine", state: "Expected" },
  { id: "r-4", patientId: "p-1001", name: "Clara Martin", initials: "CM", slot: "11:00 – 12:00", doctor: "Dr. Priya Nair", kind: "Cardiology", state: "Expected" },
];

/* ═══════════════════════════ INVENTORY ═══════════════════════════ */

export const INVENTORY_KPIS = [
  {
    id: "expired",
    label: "Expired or blocked",
    value: "₹ 2,48,500",
    delta: "+12.5% from last month",
    trend: "up" as const,
    alert: true,
  },
  {
    id: "due",
    label: "Due within next month",
    value: "₹ 14,25,600",
    delta: "+8.2% from last month",
    trend: "up" as const,
    alert: false,
  },
  {
    id: "lead",
    label: "Average time to restock",
    value: "16 days",
    delta: "−2 days from last month",
    trend: "down" as const,
    alert: false,
  },
  {
    id: "onhand",
    label: "Stock value on hand",
    value: "₹ 1,86,54,000",
    delta: "Across 4 facilities",
    trend: "flat" as const,
    alert: false,
  },
];

/** SAMPLE — monthly consumption value, ₹ lakh. */
export const CONSUMPTION = [
  { month: "Jul", value: 42 },
  { month: "Aug", value: 51 },
  { month: "Sep", value: 47 },
  { month: "Oct", value: 62 },
  { month: "Nov", value: 58 },
  { month: "Dec", value: 71 },
];

/** SAMPLE — restock lead-time trend, days. */
export const LEAD_TIME = [
  { month: "Jul", days: 24 },
  { month: "Aug", days: 23 },
  { month: "Sep", days: 21 },
  { month: "Oct", days: 20 },
  { month: "Nov", days: 18 },
  { month: "Dec", days: 16 },
];

export type StockOrder = {
  id: string;
  vendor: string;
  vendorTag: string;
  requester: string;
  requesterRole: string;
  raised: string;
  state: "Unsent" | "Viewed" | "Approved";
  total: string;
  lines: { label: string; amount: string }[];
  subTotal: string;
  balance: string;
};

/** SAMPLE — open restock orders shown in the dark working panel. */
export const STOCK_ORDERS: StockOrder[] = [
  {
    id: "REQ-1001",
    vendor: "MedSupply India",
    vendorTag: "Pharmacy",
    requester: "Joseph Thomas",
    requesterRole: "Pharmacist",
    raised: "In 2 days",
    state: "Unsent",
    total: "₹ 68,750",
    lines: [
      { label: "Antibiotics", amount: "₹ 24,990" },
      { label: "Analgesics", amount: "₹ 21,250" },
      { label: "Antidiabetics", amount: "₹ 22,510" },
    ],
    subTotal: "₹ 68,750",
    balance: "₹ 68,750",
  },
  {
    id: "REQ-1002",
    vendor: "Kritika Surgicals",
    vendorTag: "OT supplies",
    requester: "Meera Pillai",
    requesterRole: "Head Nurse",
    raised: "In 4 days",
    state: "Viewed",
    total: "₹ 21,480",
    lines: [
      { label: "Sutures", amount: "₹ 9,990" },
      { label: "Drapes", amount: "₹ 6,250" },
      { label: "Gloves", amount: "₹ 5,240" },
    ],
    subTotal: "₹ 21,480",
    balance: "₹ 21,480",
  },
  {
    id: "REQ-1003",
    vendor: "BrightWave Diagnostics",
    vendorTag: "Lab reagents",
    requester: "Arjun Sethi",
    requesterRole: "Lab Technician",
    raised: "In 5 days",
    state: "Unsent",
    total: "₹ 47,980",
    lines: [
      { label: "Haematology reagents", amount: "₹ 15,990" },
      { label: "Biochemistry kits", amount: "₹ 21,250" },
      { label: "QC and controls", amount: "₹ 10,740" },
    ],
    subTotal: "₹ 47,980",
    balance: "₹ 47,980",
  },
  {
    id: "REQ-1004",
    vendor: "Nova Diagnostics",
    vendorTag: "Imaging",
    requester: "Divya Kamath",
    requesterRole: "Inventory Clerk",
    raised: "In 16 days",
    state: "Viewed",
    total: "₹ 55,230",
    lines: [
      { label: "Contrast media", amount: "₹ 31,000" },
      { label: "Film and print", amount: "₹ 14,230" },
      { label: "Consumables", amount: "₹ 10,000" },
    ],
    subTotal: "₹ 55,230",
    balance: "₹ 55,230",
  },
  {
    id: "REQ-1005",
    vendor: "Aster Pharma Distributors",
    vendorTag: "Pharmacy",
    requester: "Joseph Thomas",
    requesterRole: "Pharmacist",
    raised: "In 19 days",
    state: "Approved",
    total: "₹ 6,880",
    lines: [
      { label: "Antiseptics", amount: "₹ 3,880" },
      { label: "Dressings", amount: "₹ 3,000" },
    ],
    subTotal: "₹ 6,880",
    balance: "₹ 0",
  },
];
