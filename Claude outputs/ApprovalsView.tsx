"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  IndianRupee,
  PackageX,
  XCircle,
} from "lucide-react";
import { Card, CardHeading, EmptyState, GhostButton, GradientButton, Reveal } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/admin/StatusBadge";
import TextReveal from "@/components/motion/TextReveal";
import { useClinic } from "@/lib/clinic-store";
import { ADMIN_PROFILE } from "@/lib/admin-data";
import type { PurchaseOrder } from "@/lib/clinic-types";

/**
 * Purchase approvals.
 *
 * The inventory manager raises an order; nothing reaches a supplier until it
 * is approved here. Rejections carry a reason back to the manager.
 */
export default function ApprovalsView() {
  const { state, dispatch } = useClinic();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const pending = useMemo(
    () => state.orders.filter((order) => order.status === "Awaiting approval"),
    [state.orders],
  );
  const decided = useMemo(
    () =>
      state.orders
        .filter((order) => order.decidedAt && order.status !== "Awaiting approval")
        .slice(0, 8),
    [state.orders],
  );

  const pendingValue = pending.reduce((sum, order) => sum + order.total, 0);

  const approve = (id: string) =>
    dispatch({ type: "order/approve", id, by: ADMIN_PROFILE.name });

  const reject = (id: string) => {
    dispatch({
      type: "order/reject",
      id,
      reason: reason.trim() || "No reason given",
      by: ADMIN_PROFILE.name,
    });
    setRejecting(null);
    setReason("");
  };

  return (
    <div className="space-y-5 pb-2">
      <Reveal>
        <Card>
          <CardHeading
            title="Purchase approvals"
            description="Orders raised by the Inventory Manager. Nothing is sent to a supplier until you approve it."
          />
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-chip bg-admin-bg p-4">
              <dt className="text-xs font-medium text-admin-muted">Waiting on you</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-admin-ink">
                {pending.length}
              </dd>
            </div>
            <div className="rounded-chip bg-admin-bg p-4">
              <dt className="text-xs font-medium text-admin-muted">Value held</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-admin-ink">
                ₹{pendingValue.toLocaleString("en-IN")}
              </dd>
            </div>
            <div className="rounded-chip bg-admin-bg p-4">
              <dt className="text-xs font-medium text-admin-muted">Decided recently</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-admin-ink">
                {decided.length}
              </dd>
            </div>
          </dl>
        </Card>
      </Reveal>

      {/* ── Waiting for a decision ── */}
      <Reveal delay={0.06}>
        {pending.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="Nothing waiting"
            description="When the Inventory Manager raises a purchase order it appears here, and in your notifications."
          />
        ) : (
          <ul className="list-none space-y-4">
            {pending.map((order) => (
              <li key={order.id}>
                <OrderCard
                  order={order}
                  rejecting={rejecting === order.id}
                  reason={reason}
                  onReasonChange={setReason}
                  onApprove={() => approve(order.id)}
                  onStartReject={() => {
                    setRejecting(order.id);
                    setReason("");
                  }}
                  onCancelReject={() => setRejecting(null)}
                  onConfirmReject={() => reject(order.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      {/* ── Decided ── */}
      {decided.length > 0 ? (
        <Reveal delay={0.1}>
          <Card>
            <CardHeading title="Recent decisions" as="h3" />
            <ul className="mt-4 list-none divide-y divide-admin-line">
              {decided.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="font-mono text-sm font-semibold text-admin-ink">
                    {order.id}
                  </span>
                  <span className="text-sm text-admin-muted">{order.supplier}</span>
                  <span className="text-sm tabular-nums text-admin-muted">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                  <span className="ml-auto flex items-center gap-3">
                    {order.rejectionReason ? (
                      <span className="text-xs text-admin-muted">
                        {order.rejectionReason}
                      </span>
                    ) : null}
                    <span className="text-xs text-admin-muted">{order.decidedAt}</span>
                    <StatusBadge status={order.status} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      ) : null}
    </div>
  );
}

/* ══════════════════════════ One pending order ═══════════════════════ */

function OrderCard({
  order,
  rejecting,
  reason,
  onReasonChange,
  onApprove,
  onStartReject,
  onCancelReject,
  onConfirmReject,
}: {
  order: PurchaseOrder;
  rejecting: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onConfirmReject: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <TextReveal as="h3" className="font-mono text-base font-semibold text-admin-ink">
            {order.id}
          </TextReveal>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-admin-muted">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {order.supplier}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Raised {order.raisedAt ?? "—"} by {order.raisedBy ?? "Inventory"}
            </span>
          </p>
        </div>
        <p className="inline-flex items-center gap-1 text-xl font-semibold tabular-nums text-admin-ink">
          <IndianRupee className="h-4 w-4" aria-hidden="true" />
          {order.total.toLocaleString("en-IN")}
        </p>
      </div>

      <ul className="mt-4 list-none divide-y divide-admin-line rounded-chip bg-admin-bg px-4">
        {order.items.map((item) => (
          <li
            key={item.name}
            className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
          >
            <span className="font-medium text-admin-ink">{item.name}</span>
            <span className="tabular-nums text-admin-muted">
              {item.qty} × ₹{item.price.toLocaleString("en-IN")} ={" "}
              <span className="font-semibold text-admin-ink">
                ₹{(item.qty * item.price).toLocaleString("en-IN")}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {rejecting ? (
        <div className="mt-4 rounded-chip border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
          <Label htmlFor={`reason-${order.id}`}>Why are you rejecting this?</Label>
          <Input
            id={`reason-${order.id}`}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Over budget this quarter"
            className="mt-2"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <GradientButton
              onClick={onConfirmReject}
              className="bg-admin-grad-pink from-rose-500 to-rose-600"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Confirm rejection
            </GradientButton>
            <GhostButton onClick={onCancelReject}>Cancel</GhostButton>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <GradientButton onClick={onApprove}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Approve and place
          </GradientButton>
          <GhostButton onClick={onStartReject}>
            <PackageX className="h-4 w-4" aria-hidden="true" />
            Reject
          </GhostButton>
        </div>
      )}
    </Card>
  );
}
