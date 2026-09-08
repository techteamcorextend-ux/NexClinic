/** SAMPLE report history per patient, for the surgeon's Reports tab. */
export type ClinicalReport = {
  id: string;
  patientId: string;
  patient: string;
  title: string;
  kind: "Lab" | "Imaging" | "Discharge" | "Consultation" | "Prescription";
  issued: string;
  by: string;
  summary: string;
};

export const REPORTS: ClinicalReport[] = [
  { id: "RPT-5012", patientId: "p-1001", patient: "Clara Martin", title: "Lipid profile", kind: "Lab", issued: "07 Sep 2026", by: "Dr. Priya Nair", summary: "LDL 118 mg/dL, HDL 54, triglycerides 132. Within target on current therapy." },
  { id: "RPT-5011", patientId: "p-1001", patient: "Clara Martin", title: "Consultation summary", kind: "Consultation", issued: "07 Sep 2026", by: "Dr. Priya Nair", summary: "Intermittent palpitations, no red flags. Continue beta blocker." },
  { id: "RPT-5008", patientId: "p-1002", patient: "Arya Wijaya Kusuma", title: "Right knee X-ray", kind: "Imaging", issued: "05 Sep 2026", by: "Dr. Shilpa Rao", summary: "Hardware in situ, alignment satisfactory, no loosening." },
  { id: "RPT-5007", patientId: "p-1002", patient: "Arya Wijaya Kusuma", title: "Physiotherapy discharge note", kind: "Discharge", issued: "04 Sep 2026", by: "Dr. Sameer Kulkarni", summary: "Week 6 milestones met. Continue home programme, review in 4 weeks." },
  { id: "RPT-5004", patientId: "p-1003", patient: "Sherly Indriani", title: "Session 8 clinical note", kind: "Consultation", issued: "03 Sep 2026", by: "Dr. Fatima Sheikh", summary: "Sleep improved, PHQ-9 down 4 points. Continue grounding practice." },
  { id: "RPT-5003", patientId: "p-1003", patient: "Sherly Indriani", title: "Repeat prescription", kind: "Prescription", issued: "03 Sep 2026", by: "Dr. Fatima Sheikh", summary: "Escitalopram 10 mg once daily, 30 days." },
  { id: "RPT-4999", patientId: "p-1004", patient: "Nafiu Efandyar Maulidy", title: "Complete blood count", kind: "Lab", issued: "02 Sep 2026", by: "Dr. Vivek Bhatt", summary: "Mild leucocytosis. Repeat in 48 hours." },
  { id: "RPT-4998", patientId: "p-1004", patient: "Nafiu Efandyar Maulidy", title: "Admission summary", kind: "Discharge", issued: "01 Sep 2026", by: "Dr. Vivek Bhatt", summary: "Admitted Ward 3 for BP observation. Anti-hypertensive dose revised." },
];

export const REPORT_KINDS = [
  "All types",
  "Lab",
  "Imaging",
  "Discharge",
  "Consultation",
  "Prescription",
];
