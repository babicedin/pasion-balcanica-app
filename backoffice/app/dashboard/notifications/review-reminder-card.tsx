"use client";

import { Clock3, Loader2, Star, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Auto-reminder dashboard widget.
 *
 * Most of the time the admin doesn't touch this — the daily Vercel cron
 * runs at 09:00 UTC and dispatches the 48h review push to every device
 * in the eligibility window. This card just shows the queue size and
 * gives the admin a manual "Run now" button for ad-hoc dispatch (useful
 * when verifying the pipeline or recovering from a missed cron run).
 */
export function ReviewReminderCard({ eligible }: { eligible: number }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    eligible: number;
    sent: number;
    failed: number;
    pruned: number;
  } | null>(null);

  async function runNow() {
    if (eligible === 0) {
      if (
        !confirm(
          "No devices are in the 47–49h window right now. Running anyway will hit the database, send nothing, and log a no-op. Continue?"
        )
      ) {
        return;
      }
    } else if (
      !confirm(
        `Send the review reminder push to ${eligible} eligible device${eligible === 1 ? "" : "s"} now?`
      )
    ) {
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/notifications/run-reminders", {
      method: "POST",
    });
    setRunning(false);

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      setError((detail as { error?: string }).error ?? `HTTP ${res.status}`);
      return;
    }

    const data = (await res.json()) as {
      eligible: number;
      sent: number;
      failed: number;
      pruned: number;
    };
    setResult(data);
    router.refresh();
  }

  return (
    <div className="card p-6 md:p-7 space-y-4">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-brand-purple/10 text-brand-purple p-2.5 shrink-0">
          <Star size={20} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-semibold text-brand-ink">
            Auto review reminder
          </h2>
          <p className="text-sm text-muted">
            Every device that installed the app gets one localized push
            48 hours later, asking for a Google review. The mobile app
            deep-links the tap straight into the Review tab.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface-muted/40 p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            <Clock3 size={11} strokeWidth={2} />
            Schedule
          </div>
          <div className="mt-1 text-sm text-brand-ink">
            Daily, 09:00 UTC
          </div>
          <div className="text-xs text-muted">
            Configured via <code className="font-mono">vercel.json</code> cron.
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-muted/40 p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            <Zap size={11} strokeWidth={2} />
            Eligible right now
          </div>
          <div className="mt-1 text-sm text-brand-ink">
            {eligible} device{eligible === 1 ? "" : "s"}
          </div>
          <div className="text-xs text-muted">
            Installed 47–49h ago, no reminder sent yet.
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Triggered. Eligible: {result.eligible} · Delivered: {result.sent} · Failed: {result.failed}
          {result.pruned > 0 && ` · Pruned ${result.pruned} dead token${result.pruned === 1 ? "" : "s"}`}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runNow}
          disabled={running}
          className="btn-secondary"
        >
          {running ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Zap size={14} />
              Run reminder now
            </>
          )}
        </button>
        <span className="text-xs text-muted">
          Use to test the pipeline or recover from a missed cron run.
        </span>
      </div>
    </div>
  );
}
