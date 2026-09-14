import { Badge } from "@/components/ui/badge";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "purple" | "pink";

/**
 * Central mapping from a status string to a badge tone. Every badge still
 * renders its label as text, so colour is never the only signal.
 */
const TONES: Record<string, Tone> = {
  // People
  Active: "success",
  Inactive: "neutral",
  // Payroll
  Paid: "success",
  Pending: "warning",
  // Purchase orders
  "Awaiting approval": "warning",
  Approved: "info",
  Rejected: "danger",
  Received: "success",
  // Equipment
  Operational: "success",
  "Due Soon": "warning",
  Overdue: "danger",
  // Stock
  "In Stock": "success",
  "Low Stock": "warning",
  "Expiring Soon": "danger",
  // Clinics
  "Under Maintenance": "warning",
  // Incidents
  Open: "warning",
  Investigating: "info",
  Resolved: "success",
  Low: "neutral",
  Medium: "warning",
  High: "danger",
  Critical: "danger",
  // Payments
  Settled: "success",
  Refunded: "info",
  Placed: "warning",
  "In transit": "info",
  // Programs
  Running: "success",
  Enrolling: "info",
  Completed: "neutral",
  Closed: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "neutral"}>{status}</Badge>;
}

export default StatusBadge;
