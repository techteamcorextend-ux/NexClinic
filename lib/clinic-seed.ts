import type { ClinicState } from "./clinic-types";

/**
 * SAMPLE SEED DATA for the Nexclinic front end.
 *
 * This is the starting state of the client-side store. Everything here is
 * invented for a front-end test build — no patient, staff member, price or
 * phone number is real. Replace with server data before going live.
 */
export const CLINIC_SEED: ClinicState = {
  charts: {
    "p-1001": {
      vitals: [
        { id: "temp", label: "Temperature", value: "36.6", unit: "°C" },
        { id: "bp", label: "Blood pressure", value: "80 / 120", unit: "mmHg" },
        { id: "hr", label: "Heart rate", value: "88", unit: "bpm" },
        { id: "spo2", label: "Oxygen saturation", value: "95", unit: "%" },
        { id: "weight", label: "Weight", value: "61", unit: "kg" },
      ],
      diet: [
        "Low-sodium: under 2 g salt per day",
        "Two portions of oily fish per week",
        "No caffeine after 16:00",
        "30 minutes brisk walking, five days a week",
      ],
      notes: "Reports intermittent palpitations, no chest pain. Continue current medication.",
    },
    "p-1002": {
      vitals: [
        { id: "temp", label: "Temperature", value: "37.1", unit: "°C" },
        { id: "bp", label: "Blood pressure", value: "86 / 132", unit: "mmHg" },
        { id: "hr", label: "Heart rate", value: "92", unit: "bpm" },
        { id: "spo2", label: "Oxygen saturation", value: "97", unit: "%" },
        { id: "weight", label: "Weight", value: "78", unit: "kg" },
      ],
      diet: [
        "High protein: 1.4 g per kg body weight",
        "Vitamin D and calcium supplement",
        "Limit alcohol during recovery",
      ],
      notes: "Week 6 post-op. Range of motion improving, no effusion.",
    },
    "p-1003": {
      vitals: [
        { id: "temp", label: "Temperature", value: "36.4", unit: "°C" },
        { id: "bp", label: "Blood pressure", value: "74 / 112", unit: "mmHg" },
        { id: "hr", label: "Heart rate", value: "76", unit: "bpm" },
        { id: "spo2", label: "Oxygen saturation", value: "99", unit: "%" },
        { id: "weight", label: "Weight", value: "55", unit: "kg" },
      ],
      diet: [
        "Regular meal timing, no skipping breakfast",
        "Magnesium-rich foods in the evening",
        "Caffeine limited to one cup before noon",
      ],
      notes: "Sleep quality improved since session 6. Continue grounding practice.",
    },
    "p-1004": {
      vitals: [
        { id: "temp", label: "Temperature", value: "37.8", unit: "°C" },
        { id: "bp", label: "Blood pressure", value: "98 / 158", unit: "mmHg" },
        { id: "hr", label: "Heart rate", value: "104", unit: "bpm" },
        { id: "spo2", label: "Oxygen saturation", value: "92", unit: "%" },
        { id: "weight", label: "Weight", value: "84", unit: "kg" },
      ],
      diet: [
        "Strict low-sodium: under 1.5 g per day",
        "DASH pattern — vegetables at every meal",
        "No processed or tinned foods",
        "Fluid intake logged daily",
      ],
      notes: "Admitted for observation. Anti-hypertensive dose revised this morning.",
    },
  },

  appointments: [
    { id: "APT-3001", patientName: "Rohit Malhotra", phone: "+91 98450 11223", reason: "Chest tightness on exertion", date: "2026-09-09", time: "10:30", doctor: "Dr. Priya Nair", status: "pending", source: "web", createdAt: 1757300000000 },
    { id: "APT-3002", patientName: "Sneha Iyer", phone: "+91 99001 44556", reason: "Post-op dressing review", date: "2026-09-09", time: "11:15", doctor: "Dr. Sameer Kulkarni", status: "pending", source: "web", createdAt: 1757301000000 },
    { id: "APT-3003", patientName: "Imran Qureshi", phone: "+91 90084 77881", reason: "Anxiety follow-up", date: "2026-09-10", time: "09:45", doctor: "Dr. Fatima Sheikh", status: "pending", source: "phone", createdAt: 1757302000000 },
    { id: "APT-2990", patientName: "Clara Martin", phone: "+33 6 48 72 95 31", reason: "Cardiology follow-up", date: "2026-09-08", time: "09:00", doctor: "Dr. Priya Nair", status: "approved", source: "web", createdAt: 1757200000000 },
    { id: "APT-2991", patientName: "Arya Wijaya Kusuma", phone: "+91 98867 41220", reason: "Knee review", date: "2026-09-08", time: "09:40", doctor: "Dr. Sameer Kulkarni", status: "approved", source: "walk-in", createdAt: 1757201000000 },
    { id: "APT-2992", patientName: "Sherly Indriani", phone: "+91 90084 33517", reason: "Therapy session 9", date: "2026-09-08", time: "10:20", doctor: "Dr. Fatima Sheikh", status: "approved", source: "telehealth", createdAt: 1757202000000 },
  ],

  queue: [
    { id: "Q-1", patientId: "p-1001", name: "Clara Martin", initials: "CM", reason: "Cardiology follow-up", token: "A-14", priority: "medium", arrivedAt: "08:52", waitMinutes: 4, state: "in-consult" },
    { id: "Q-2", patientId: "p-1004", name: "Nafiu Efandyar Maulidy", initials: "NM", reason: "Hypertension — observation", token: "A-15", priority: "high", arrivedAt: "08:58", waitMinutes: 21, state: "waiting" },
    { id: "Q-3", patientId: "p-1002", name: "Arya Wijaya Kusuma", initials: "AK", reason: "Post-op knee review", token: "A-16", priority: "medium", arrivedAt: "09:06", waitMinutes: 13, state: "waiting" },
    { id: "Q-4", patientId: "p-1003", name: "Sherly Indriani", initials: "SI", reason: "Anxiety programme review", token: "A-17", priority: "low", arrivedAt: "09:14", waitMinutes: 6, state: "waiting" },
  ],

  stock: [
    { id: "S-01", name: "Amoxicillin 500 mg", category: "Medicine", qty: 1840, unit: "caps", reorderLevel: 600, expiry: "2027-06-18", price: 9, flaggedLow: false },
    { id: "S-02", name: "Metformin 850 mg", category: "Medicine", qty: 420, unit: "tabs", reorderLevel: 500, expiry: "2027-03-02", price: 4, flaggedLow: false },
    { id: "S-03", name: "Salbutamol Inhaler", category: "Medicine", qty: 96, unit: "units", reorderLevel: 80, expiry: "2026-10-27", price: 240, flaggedLow: false },
    { id: "S-04", name: "Paracetamol 650 mg", category: "Medicine", qty: 3260, unit: "tabs", reorderLevel: 1000, expiry: "2027-12-09", price: 2, flaggedLow: false },
    { id: "S-05", name: "Insulin Glargine", category: "Medicine", qty: 58, unit: "pens", reorderLevel: 90, expiry: "2026-11-15", price: 780, flaggedLow: false },
    { id: "S-06", name: "Ondansetron 4 mg", category: "Medicine", qty: 740, unit: "amps", reorderLevel: 300, expiry: "2026-09-21", price: 18, flaggedLow: true },
    { id: "S-07", name: "ECG Electrodes", category: "Equipment", qty: 2400, unit: "pcs", reorderLevel: 800, price: 12, flaggedLow: false },
    { id: "S-08", name: "Pulse Oximeter Probes", category: "Equipment", qty: 62, unit: "pcs", reorderLevel: 100, price: 640, flaggedLow: false },
    { id: "S-09", name: "Infusion Pump Tubing", category: "Equipment", qty: 88, unit: "sets", reorderLevel: 150, price: 210, flaggedLow: false },
    { id: "S-10", name: "Sterile Surgical Gloves 7.5", category: "OT Supply", qty: 1960, unit: "pairs", reorderLevel: 700, price: 28, flaggedLow: false },
    { id: "S-11", name: "Absorbable Sutures 3-0", category: "OT Supply", qty: 240, unit: "packs", reorderLevel: 300, price: 190, flaggedLow: false },
    { id: "S-12", name: "Povidone-Iodine 500 ml", category: "OT Supply", qty: 176, unit: "bottles", reorderLevel: 120, expiry: "2026-10-30", price: 165, flaggedLow: false },
    { id: "S-13", name: "Haematology Reagent Kit", category: "Reagent", qty: 34, unit: "kits", reorderLevel: 40, expiry: "2027-01-12", price: 2400, flaggedLow: false },
  ],

  stockLogs: [
    { id: "L-1", at: "08 Sep 2026, 09:12", kind: "receive", detail: "PO-2041 received — 21 line items", by: "Divya Kamath" },
    { id: "L-2", at: "07 Sep 2026, 17:40", kind: "order", detail: "PO-2048 placed with MedSupply India", by: "Divya Kamath" },
    { id: "L-3", at: "07 Sep 2026, 11:05", kind: "issue", detail: "Paracetamol 650 mg ×20 issued against BILL-4402", by: "Front desk" },
    { id: "L-4", at: "06 Sep 2026, 15:22", kind: "flag", detail: "Ondansetron 4 mg pinned as low stock", by: "Divya Kamath" },
  ],

  suppliers: [
    { id: "SUP-1", name: "MedSupply India", category: "Pharmacy", address: "Plot 14, Peenya Industrial Area, Bengaluru 560058", contact: "+91 80 2839 4410", distanceKm: 12.4, rating: 4.7 },
    { id: "SUP-2", name: "Kritika Surgicals", category: "OT supplies", address: "22 Mission Road, Bengaluru 560027", contact: "+91 80 2223 7788", distanceKm: 6.1, rating: 4.4 },
    { id: "SUP-3", name: "Nova Diagnostics", category: "Imaging", address: "Bellandur Gate, Outer Ring Road, Bengaluru 560103", contact: "+91 80 4114 9020", distanceKm: 9.8, rating: 4.2 },
    { id: "SUP-4", name: "Aster Pharma Distributors", category: "Pharmacy", address: "5th Cross, Jayanagar, Bengaluru 560041", contact: "+91 80 2663 1145", distanceKm: 14.9, rating: 4.6 },
    { id: "SUP-5", name: "BioLab Reagents", category: "Lab reagents", address: "Electronic City Phase 1, Bengaluru 560100", contact: "+91 80 2852 6677", distanceKm: 21.3, rating: 4.1 },
  ],

  orders: [
    { id: "PO-2048", supplierId: "SUP-1", supplier: "MedSupply India", items: [{ name: "Amoxicillin 500 mg", qty: 2000, price: 9 }, { name: "Paracetamol 650 mg", qty: 4000, price: 2 }], total: 26000, placedAt: "07 Sep 2026", status: "Placed" },
    { id: "PO-2047", supplierId: "SUP-2", supplier: "Kritika Surgicals", items: [{ name: "Absorbable Sutures 3-0", qty: 300, price: 190 }], total: 57000, placedAt: "05 Sep 2026", status: "In transit" },
    { id: "PO-2041", supplierId: "SUP-4", supplier: "Aster Pharma Distributors", items: [{ name: "Insulin Glargine", qty: 120, price: 780 }, { name: "Ondansetron 4 mg", qty: 500, price: 18 }], total: 102600, placedAt: "24 Aug 2026", status: "Received" },
    { id: "PO-2036", supplierId: "SUP-5", supplier: "BioLab Reagents", items: [{ name: "Haematology Reagent Kit", qty: 30, price: 2400 }], total: 72000, placedAt: "12 Aug 2026", status: "Received" },
  ],

  equipment: [
    { id: "EQ-1", name: "Siemens MRI 1.5T", location: "Imaging, Level 1", status: "Operational", lastService: "02 Aug 2026", nextService: "02 Feb 2027", logs: [{ id: "EL-1", at: "02 Aug 2026", note: "Annual preventive service completed", by: "Siemens Care" }] },
    { id: "EQ-2", name: "GE CT Scanner 64-slice", location: "Imaging, Level 1", status: "Service due", lastService: "18 Mar 2026", nextService: "18 Sep 2026", logs: [{ id: "EL-2", at: "18 Mar 2026", note: "Tube calibration, coolant top-up", by: "GE Service" }] },
    { id: "EQ-3", name: "OT Anaesthesia Workstation", location: "OT 1", status: "Under maintenance", lastService: "11 Feb 2026", nextService: "11 Sep 2026", logs: [{ id: "EL-3", at: "06 Sep 2026", note: "Flow sensor replaced, awaiting QA sign-off", by: "Biomed team" }] },
    { id: "EQ-4", name: "Dialysis Unit — Bay 2", location: "Dialysis", status: "Operational", lastService: "14 Jun 2026", nextService: "14 Sep 2026", logs: [] },
    { id: "EQ-5", name: "Autoclave Steriliser 120L", location: "CSSD", status: "Service due", lastService: "03 Jan 2026", nextService: "03 Jul 2026", logs: [{ id: "EL-5", at: "03 Jan 2026", note: "Gasket replaced", by: "Biomed team" }] },
  ],

  staff: [
    { id: "ST-1", name: "Dr. Priya Nair", initials: "PN", role: "Cardiologist", dept: "Cardiology", phone: "+91 98450 22101", email: "priya.nair@nexclinic.health", shiftStart: "09:00", shiftEnd: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], salary: { base: 285000, hra: 42000, allowance: 18000, bonus: 25000, taxPercent: 18 }, username: "priya.nair", accessRole: "Surgeon", active: true },
    { id: "ST-2", name: "Dr. Sameer Kulkarni", initials: "SK", role: "Orthopaedic Surgeon", dept: "Orthopaedics", phone: "+91 98450 22102", email: "sameer.k@nexclinic.health", shiftStart: "08:00", shiftEnd: "16:00", days: ["Mon", "Wed", "Fri", "Sat"], salary: { base: 262000, hra: 39000, allowance: 16000, bonus: 20000, taxPercent: 18 }, username: "sameer.k", accessRole: "Surgeon", active: true },
    { id: "ST-3", name: "Dr. Fatima Sheikh", initials: "FS", role: "Psychiatrist", dept: "Mind & Wellness", phone: "+91 98450 22103", email: "fatima.s@nexclinic.health", shiftStart: "10:00", shiftEnd: "18:00", days: ["Tue", "Wed", "Thu", "Fri"], salary: { base: 248000, hra: 36000, allowance: 15000, bonus: 12000, taxPercent: 15 }, username: "fatima.s", accessRole: "Surgeon", active: true },
    { id: "ST-4", name: "Kavya Reddy", initials: "KR", role: "Front Desk Lead", dept: "Front office", phone: "+91 98450 22104", email: "kavya.r@nexclinic.health", shiftStart: "08:00", shiftEnd: "16:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], salary: { base: 42000, hra: 8000, allowance: 4000, bonus: 3000, taxPercent: 8 }, username: "kavya.r", accessRole: "Receptionist", active: true },
    { id: "ST-5", name: "Meera Pillai", initials: "MP", role: "Head Nurse", dept: "Wards", phone: "+91 98450 22105", email: "meera.p@nexclinic.health", shiftStart: "07:00", shiftEnd: "15:00", days: ["Mon", "Tue", "Thu", "Fri", "Sun"], salary: { base: 78000, hra: 12000, allowance: 6000, bonus: 5000, taxPercent: 10 }, username: "meera.p", accessRole: "Nurse", active: true },
    { id: "ST-6", name: "Divya Kamath", initials: "DK", role: "Inventory Manager", dept: "Supply chain", phone: "+91 98450 22106", email: "divya.k@nexclinic.health", shiftStart: "09:00", shiftEnd: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], salary: { base: 56000, hra: 10000, allowance: 5000, bonus: 4000, taxPercent: 10 }, username: "divya.k", accessRole: "Inventory", active: true },
    { id: "ST-7", name: "Ananya Desai", initials: "AD", role: "Super Admin", dept: "Administration", phone: "+91 98450 22107", email: "ananya.d@nexclinic.health", shiftStart: "09:30", shiftEnd: "18:30", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], salary: { base: 165000, hra: 26000, allowance: 12000, bonus: 18000, taxPercent: 20 }, username: "ananya.d", accessRole: "Super Admin", active: true },
    { id: "ST-8", name: "Arjun Sethi", initials: "AS", role: "Lab Technician", dept: "Diagnostics", phone: "+91 98450 22108", email: "arjun.s@nexclinic.health", shiftStart: "07:30", shiftEnd: "15:30", days: ["Mon", "Tue", "Wed", "Thu", "Sat"], salary: { base: 51000, hra: 9000, allowance: 4500, bonus: 2500, taxPercent: 8 }, username: "arjun.s", accessRole: "Nurse", active: false },
  ],

  bills: [
    { id: "BILL-4402", patientName: "Clara Martin", doctor: "Dr. Priya Nair", lines: [{ name: "Paracetamol 650 mg", qty: 20, price: 2 }], consultFee: 800, total: 840, at: "07 Sep 2026" },
    { id: "BILL-4401", patientName: "Arya Wijaya Kusuma", doctor: "Dr. Sameer Kulkarni", lines: [{ name: "Absorbable Sutures 3-0", qty: 2, price: 190 }], consultFee: 900, total: 1280, at: "06 Sep 2026" },
  ],

  notices: [],
};
