type StatusBadgeProps = {
  published: boolean;
  publishedLabel?: string;
  draftLabel?: string;
};

export function StatusBadge({
  published,
  publishedLabel = "Published",
  draftLabel = "Draft",
}: StatusBadgeProps) {
  return published ? (
    <span className="badge-success">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {publishedLabel}
    </span>
  ) : (
    <span className="badge-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
      {draftLabel}
    </span>
  );
}
