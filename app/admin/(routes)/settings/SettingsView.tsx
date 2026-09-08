"use client";

import { useState } from "react";
import {
  Building2,
  DatabaseBackup,
  MessageCircle,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeading, Reveal } from "@/components/admin/ui";
import { DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { CLINIC_INFO } from "@/lib/roles";
import { useClinic } from "@/lib/clinic-store";
import { downloadCsv } from "@/lib/downloads";

const PERMISSIONS = [
  { role: "Super Admin", scope: "Everything except inventory and stock", edit: true },
  { role: "Surgeon", scope: "Consultations, records, scribe, reports", edit: true },
  { role: "Receptionist", scope: "Queue, requests, billing, onboarding", edit: true },
  { role: "Inventory", scope: "Stock, suppliers, orders, equipment only", edit: true },
  { role: "Nurse", scope: "Queue and vitals, read-only billing", edit: false },
];

const BACKUPS = [
  { at: "08 Sep 2026, 02:00", size: "1.8 GB", status: "Completed" },
  { at: "07 Sep 2026, 02:00", size: "1.8 GB", status: "Completed" },
  { at: "06 Sep 2026, 02:00", size: "1.7 GB", status: "Completed" },
];

export default function SettingsView() {
  const { state } = useClinic();
  const [whatsapp, setWhatsapp] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div className="pb-2">
      <Reveal>
        <Card>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Clinic profile</TabsTrigger>
              <TabsTrigger value="billing">Billing &amp; GST</TabsTrigger>
              <TabsTrigger value="roles">Roles &amp; permissions</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
            </TabsList>

            {/* ── Clinic profile ── */}
            <TabsContent value="profile">
              <CardHeading title="Clinic profile" description="Shown on bills and portals" />
              <form
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="sm:col-span-2">
                  <Label htmlFor="clinic-name">Clinic name</Label>
                  <Input id="clinic-name" defaultValue={CLINIC_INFO.name} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="clinic-address">Address</Label>
                  <Input id="clinic-address" defaultValue={CLINIC_INFO.address} />
                </div>
                <div>
                  <Label htmlFor="clinic-phone">Phone</Label>
                  <Input id="clinic-phone" defaultValue={CLINIC_INFO.phone} />
                </div>
                <div>
                  <Label htmlFor="clinic-email">Email</Label>
                  <Input id="clinic-email" defaultValue={CLINIC_INFO.email} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="clinic-hours">Opening hours</Label>
                  <Input id="clinic-hours" defaultValue={CLINIC_INFO.hours} />
                </div>
                <div className="sm:col-span-2">
                  <MorphButton type="submit" doneLabel="Profile saved">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                    Save clinic profile
                  </MorphButton>
                </div>
              </form>
            </TabsContent>

            {/* ── Billing & GST ── */}
            <TabsContent value="billing">
              <CardHeading title="Billing and GST" description="Applied to every invoice" />
              <form
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" defaultValue="29ABCDE1234F1Z5" />
                </div>
                <div>
                  <Label htmlFor="gst-rate">Default GST rate (%)</Label>
                  <Input id="gst-rate" type="number" defaultValue={12} min={0} max={28} />
                </div>
                <div>
                  <Label htmlFor="consult-fee">Standard consultation fee (₹)</Label>
                  <Input id="consult-fee" type="number" defaultValue={800} min={0} />
                </div>
                <div>
                  <Label htmlFor="invoice-prefix">Invoice prefix</Label>
                  <Input id="invoice-prefix" defaultValue="BILL-" />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <MorphButton type="submit" doneLabel="Billing saved">
                    <Receipt className="h-4 w-4" aria-hidden="true" />
                    Save billing settings
                  </MorphButton>
                  <DownloadButton
                    fileLabel="Bill register CSV"
                    className="bg-admin-bg px-4 py-2.5 text-admin-ink hover:bg-admin-bg/70"
                    onDownload={() =>
                      downloadCsv(
                        "bill-register",
                        ["Bill", "Patient", "Clinician", "Total", "Raised"],
                        state.bills.map((bill) => [
                          bill.id,
                          bill.patientName,
                          bill.doctor,
                          bill.total,
                          bill.at,
                        ]),
                      )
                    }
                  >
                    Bill register
                  </DownloadButton>
                </div>
              </form>
            </TabsContent>

            {/* ── Roles & permissions ── */}
            <TabsContent value="roles">
              <CardHeading
                title="Roles and permissions"
                description="Portal boundaries"
              />
              <ul className="mt-5 list-none space-y-2.5">
                {PERMISSIONS.map((row) => (
                  <li
                    key={row.role}
                    className="flex flex-wrap items-center gap-3 rounded-chip border border-admin-line px-4 py-3.5"
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-admin-bg text-admin-pink"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-admin-ink">
                        {row.role}
                      </span>
                      <span className="block truncate text-xs text-admin-muted">
                        {row.scope}
                      </span>
                    </span>
                    <Switch defaultChecked={row.edit} aria-label={`Edit rights for ${row.role}`} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-chip bg-admin-bg px-4 py-3 text-xs leading-relaxed text-admin-muted">
                Super Admin deliberately excludes stock, suppliers, orders and equipment.
                Those sit with the Inventory role, and neither can see the other&apos;s
                modules in navigation.
              </p>
            </TabsContent>

            {/* ── WhatsApp ── */}
            <TabsContent value="whatsapp">
              <CardHeading
                title="WhatsApp integration"
                description="Reports, reminders and bills"
              />
              <div className="mt-5 flex items-start justify-between gap-4 rounded-chip bg-admin-bg px-4 py-3.5">
                <span className="flex items-start gap-3">
                  <MessageCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-medium text-admin-ink">
                      Send reports and bills over WhatsApp
                    </span>
                    <span className="block text-xs text-admin-muted">
                      {whatsapp
                        ? "Enabled — clinicians can send a report straight from the consultation screen."
                        : "Disabled — the send button is hidden in the consultation screen."}
                    </span>
                  </span>
                </span>
                <Switch
                  checked={whatsapp}
                  onCheckedChange={setWhatsapp}
                  aria-label="WhatsApp integration"
                />
              </div>

              <form
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <div>
                  <Label htmlFor="wa-number">Business number</Label>
                  <Input id="wa-number" defaultValue="+91 80 4718 2200" />
                </div>
                <div>
                  <Label htmlFor="wa-template">Default template</Label>
                  <Input id="wa-template" defaultValue="nexclinic_report_v3" />
                </div>
                <div className="sm:col-span-2">
                  <MorphButton type="submit" doneLabel="Integration saved">
                    Save WhatsApp settings
                  </MorphButton>
                </div>
              </form>
            </TabsContent>

            {/* ── Backups ── */}
            <TabsContent value="backups">
              <CardHeading title="Backups" description="Nightly, encrypted at rest" />
              <div className="mt-5 flex items-start justify-between gap-4 rounded-chip bg-admin-bg px-4 py-3.5">
                <span className="flex items-start gap-3">
                  <DatabaseBackup
                    className="mt-0.5 h-5 w-5 shrink-0 text-admin-pink"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-medium text-admin-ink">
                      Automatic nightly backup
                    </span>
                    <span className="block text-xs text-admin-muted">
                      Runs at 02:00 IST and retains 30 days.
                    </span>
                  </span>
                </span>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                  aria-label="Automatic nightly backup"
                />
              </div>

              <ul className="mt-5 list-none space-y-2">
                {BACKUPS.map((backup) => (
                  <li
                    key={backup.at}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-chip border border-admin-line px-4 py-3"
                  >
                    <span className="text-sm text-admin-ink">{backup.at}</span>
                    <span className="text-xs text-admin-muted">{backup.size}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      {backup.status}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <MorphButton doneLabel="Backup queued">Run backup now</MorphButton>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </Reveal>
    </div>
  );
}
