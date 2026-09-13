"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Printer, Receipt, Trash2 } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@/components/ui/table";
import { DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { RECEPTION_NAV } from "@/lib/portal-nav";
import { PATIENTS, RECEPTION_PROFILE } from "@/lib/portal-data";
import { DOCTOR_OPTIONS } from "@/lib/roles";
import { isLow } from "@/lib/clinic-types";
import { downloadPdf } from "@/lib/downloads";

type CartLine = { stockId: string; name: string; qty: number; price: number };

export default function BillingView() {
  const { state, dispatch } = useClinic();

  const [patient, setPatient] = useState(PATIENTS[0].name);
  const [doctor, setDoctor] = useState(DOCTOR_OPTIONS[0].split(" — ")[0]);
  const [consultFee, setConsultFee] = useState(800);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lastBill, setLastBill] = useState<string | null>(null);

  const medicines = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return state.stock
      .filter((item) => item.category === "Medicine" || item.category === "OT Supply")
      .filter((item) => (needle ? item.name.toLowerCase().includes(needle) : true))
      .slice(0, 6);
  }, [state.stock, search]);

  const addLine = (stockId: string) => {
    const item = state.stock.find((entry) => entry.id === stockId);
    if (!item) return;
    setCart((current) => {
      const existing = current.find((line) => line.stockId === stockId);
      if (existing) {
        return current.map((line) =>
          line.stockId === stockId ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...current, { stockId, name: item.name, qty: 1, price: item.price }];
    });
  };

  const setQty = (stockId: string, qty: number) =>
    setCart((current) =>
      current.map((line) => (line.stockId === stockId ? { ...line, qty } : line)),
    );

  const medicinesTotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
  const total = medicinesTotal + consultFee;

  /** Raises the bill and draws the same quantities out of pharmacy stock. */
  const generateBill = () => {
    const ref = `BILL-${Math.floor(4400 + Math.random() * 500)}`;
    dispatch({
      type: "bill/create",
      bill: {
        patientName: patient,
        doctor,
        lines: cart.map(({ name, qty, price, stockId }) => ({ name, qty, price, stockId })),
        consultFee,
        total,
      },
    });
    if (cart.length > 0) {
      dispatch({
        type: "stock/consume",
        lines: cart.map((line) => ({ stockId: line.stockId, qty: line.qty })),
        ref,
      });
    }
    setLastBill(ref);
    printBill(ref);
    setCart([]);
  };

  const printBill = (ref: string) =>
    downloadPdf(ref.toLowerCase(), {
      title: `Nexclinic — Invoice ${ref}`,
      subtitle: `${patient} · ${doctor}`,
      lines: [
        `Patient: ${patient}`,
        `Clinician: ${doctor}`,
        "",
        "Items",
        ...cart.map(
          (line) =>
            `  ${line.name} x${line.qty} @ Rs. ${line.price} = Rs. ${line.qty * line.price}`,
        ),
        `  Consultation fee = Rs. ${consultFee}`,
        "",
        `Total: Rs. ${total.toLocaleString("en-IN")}`,
        "",
        "Sample output generated in the browser. Not a tax invoice.",
      ],
    });

  return (
    <PortalShell
      theme="clinic"
      nav={RECEPTION_NAV}
      backdrop="grid"
      title="Billing & checkout"
      subtitle="Medicines added here are drawn out of pharmacy stock"
      user={{
        id: RECEPTION_PROFILE.id,
        name: RECEPTION_PROFILE.name,
        initials: RECEPTION_PROFILE.initials,
        role: RECEPTION_PROFILE.role,
        email: RECEPTION_PROFILE.email,
      }}
      actions={<NoticeBell audience="reception" />}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          {/* ── Who ── */}
          <Reveal>
            <PCard>
              <SectionTitle title="Bill for" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="bill-patient">Patient</Label>
                  <select
                    id="bill-patient"
                    value={patient}
                    onChange={(event) => setPatient(event.target.value)}
                    className="h-12 w-full rounded-chip border border-p-line bg-p-card px-3 text-base text-p-ink focus:border-p-accent focus:outline-none"
                  >
                    {PATIENTS.map((entry) => (
                      <option key={entry.id}>{entry.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="bill-doctor">Clinician</Label>
                  <select
                    id="bill-doctor"
                    value={doctor}
                    onChange={(event) => setDoctor(event.target.value)}
                    className="h-12 w-full rounded-chip border border-p-line bg-p-card px-3 text-base text-p-ink focus:border-p-accent focus:outline-none"
                  >
                    {DOCTOR_OPTIONS.map((option) => (
                      <option key={option} value={option.split(" — ")[0]}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="bill-fee">Consultation fee (₹)</Label>
                  <Input
                    id="bill-fee"
                    type="number"
                    min={0}
                    value={consultFee}
                    onChange={(event) => setConsultFee(Number(event.target.value) || 0)}
                  />
                </div>
              </div>
            </PCard>
          </Reveal>

          {/* ── Medicine search ── */}
          <Reveal delay={0.05}>
            <PCard>
              <SectionTitle title="Add medicines and supplies" />
              <div className="mt-4">
                <Label htmlFor="med-search">Search pharmacy stock</Label>
                <Input
                  id="med-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Paracetamol, sutures, insulin…"
                />
              </div>

              <ul className="mt-4 list-none space-y-2">
                {medicines.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-p-line px-4 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-p-ink">
                        {item.name}
                      </span>
                      <span className="block text-xs text-p-muted">
                        {item.qty} {item.unit} in stock · ₹{item.price} each
                      </span>
                    </span>
                    {isLow(item) ? <PPill tone="Critical">Low</PPill> : null}
                    <button
                      type="button"
                      onClick={() => addLine(item.id)}
                      disabled={item.qty === 0}
                      className="inline-flex items-center gap-1.5 rounded-full bg-p-grad px-4 py-2 text-xs font-semibold text-white transition-transform duration-300 hover:scale-105 disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:scale-100"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add
                    </button>
                  </li>
                ))}
                {medicines.length === 0 ? (
                  <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                    Nothing in stock matches “{search}”.
                  </li>
                ) : null}
              </ul>
            </PCard>
          </Reveal>

          {/* ── Recent bills ── */}
          <Reveal delay={0.1}>
            <PCard>
              <SectionTitle title="Recent bills" />
              <div className="mt-4">
                <TableScroll label="Recent bills">
                  <Table className="min-w-[620px]">
                    <TableCaption>Bills raised at this desk.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Clinician</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Raised</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-semibold">{bill.id}</TableCell>
                          <TableCell className="text-p-muted">{bill.patientName}</TableCell>
                          <TableCell className="text-p-muted">{bill.doctor}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            ₹{bill.total.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-p-muted">{bill.at}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableScroll>
              </div>
            </PCard>
          </Reveal>
        </div>

        {/* ── Cart / checkout ── */}
        <Reveal delay={0.08}>
          <PCard className="sticky top-4 h-fit">
            <SectionTitle title="Checkout" />

            <ul className="mt-4 list-none space-y-2">
              {cart.map((line) => (
                <li
                  key={line.stockId}
                  className="flex items-center gap-2 rounded-2xl border border-p-line px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-p-ink">
                      {line.name}
                    </span>
                    <span className="block text-xs text-p-muted">₹{line.price} each</span>
                  </span>
                  <Input
                    type="number"
                    min={1}
                    aria-label={`Quantity of ${line.name}`}
                    value={line.qty}
                    onChange={(event) =>
                      setQty(line.stockId, Math.max(1, Number(event.target.value) || 1))
                    }
                    className="h-10 w-16 px-2 text-center text-sm"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() =>
                      setCart((current) =>
                        current.filter((entry) => entry.stockId !== line.stockId),
                      )
                    }
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-p-line text-p-muted transition-colors hover:border-rose-300 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {cart.length === 0 ? (
                <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                  No items yet. Search the pharmacy above.
                </li>
              ) : null}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-p-line pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-p-muted">Medicines</dt>
                <dd className="font-medium tabular-nums text-p-ink">
                  ₹{medicinesTotal.toLocaleString("en-IN")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-p-muted">Consultation</dt>
                <dd className="font-medium tabular-nums text-p-ink">
                  ₹{consultFee.toLocaleString("en-IN")}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-p-line pt-2">
                <dt className="font-semibold text-p-ink">Total</dt>
                <dd className="text-lg font-bold tabular-nums text-p-ink">
                  ₹{total.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-2.5">
              <MorphButton
                doneLabel="Bill generated"
                onClick={generateBill}
                className="w-full bg-p-grad text-white"
              >
                <Receipt className="h-4 w-4" aria-hidden="true" />
                Generate bill
              </MorphButton>

              {lastBill ? (
                <DownloadButton
                  fileLabel={`Invoice ${lastBill}`}
                  className="w-full bg-p-soft text-p-ink hover:bg-p-soft/70"
                  onDownload={() => printBill(lastBill)}
                >
                  <Printer className="hidden" aria-hidden="true" />
                  Print {lastBill}
                </DownloadButton>
              ) : null}
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Generating the bill deducts every line from pharmacy stock. Anything that
              falls below its reorder level pushes an alert to the{" "}
              <Link href="/inventory/stock" className="font-semibold underline">
                inventory manager
              </Link>
              .
            </p>
          </PCard>
        </Reveal>
      </div>
    </PortalShell>
  );
}
