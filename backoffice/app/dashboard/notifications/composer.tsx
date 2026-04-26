"use client";

import { Bell, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export type NotificationRow = {
  id: string;
  kind: "broadcast" | "review_reminder";
  title_en: string;
  title_es: string;
  body_en: string;
  body_es: string;
  target_count: number;
  success_count: number;
  failure_count: number;
  sent_at: string;
};

export function NotificationsComposer({
  deviceCount,
  history,
}: {
  deviceCount: number;
  history: NotificationRow[];
}) {
  return <ComposerInner deviceCount={deviceCount} history={history} />;
}

function ComposerInner({
  deviceCount,
  history,
}: {
  deviceCount: number;
  history: NotificationRow[];
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lastResult, setLastResult] = useState<{
    targets: number;
    sent: number;
    failed: number;
  } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleValue = title.trim();
    const bodyValue = body.trim();

    if (!titleValue || !bodyValue) {
      setError("Title and body are required.");
      return;
    }

    if (
      !confirm(
        `Send this notification to all ${deviceCount} installed device${deviceCount === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return;
    }

    setSending(true);
    setError(null);
    setLastResult(null);

    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: titleValue,
        body: bodyValue,
      }),
    });

    setSending(false);

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      setError((detail as { error?: string }).error ?? `HTTP ${res.status}`);
      return;
    }

    const result = (await res.json()) as {
      targets: number;
      sent: number;
      failed: number;
    };
    setLastResult(result);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card p-6 md:p-7 space-y-5">
          <h2 className="text-base font-semibold text-brand-ink">
            Immediate notification test
          </h2>
          <p className="text-sm text-muted">
            Type a message and send it now to all active devices.
          </p>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              Title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="input"
              required
              placeholder="A new tour is live"
              maxLength={80}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              Body
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="textarea min-h-[110px]"
              required
              rows={4}
              placeholder="Join me Saturday at 11:00 — Yellow Bastion to Old Town."
              maxLength={350}
            />
          </label>
        </div>

        {error && (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {error}
          </div>
        )}

        {lastResult && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Sent. Targets: {lastResult.targets} · Delivered: {lastResult.sent} · Failed: {lastResult.failed}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={sending || deviceCount === 0} className="btn-accent">
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send to {deviceCount} device{deviceCount === 1 ? "" : "s"}
              </>
            )}
          </button>
          {deviceCount === 0 && (
            <span className="text-xs text-muted">
              No devices have registered yet — install the app at least once before sending.
            </span>
          )}
        </div>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-ink">Recent broadcasts</h2>
          <span className="text-xs text-muted inline-flex items-center gap-1.5">
            <Bell size={12} />
            Last 20
          </span>
        </div>

        {history.length === 0 ? (
          <div className="card p-6 text-sm text-muted">
            No notifications sent yet.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((n) => (
              <HistoryRow key={n.id} row={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HistoryRow({ row }: { row: NotificationRow }) {
  const sent = new Date(row.sent_at);
  const isReminder = row.kind === "review_reminder";
  return (
    <div className="card p-4 space-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-brand-ink truncate">
            {row.title_en}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isReminder && (
            <span className="rounded-md bg-brand-purple/10 text-brand-purple px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Auto
            </span>
          )}
          <span className="text-[11px] text-neutral-500">
            {sent.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="text-xs text-muted line-clamp-2">{row.body_en}</div>
      <div className="text-[11px] text-neutral-500 pt-1">
        {row.success_count} of {row.target_count} delivered
        {row.failure_count > 0 && ` · ${row.failure_count} failed`}
      </div>
    </div>
  );
}
