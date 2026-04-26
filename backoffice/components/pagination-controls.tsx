import Link from "next/link";

type Props = {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
};

export function PaginationControls({ basePath, page, pageSize, total }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-muted">
        Showing {from}-{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        {canPrev ? (
          <Link href={`${basePath}?page=${page - 1}`} className="btn-secondary">
            Previous
          </Link>
        ) : (
          <span className="btn-secondary pointer-events-none opacity-50">Previous</span>
        )}
        <span className="text-xs text-neutral-500">
          Page {page} of {totalPages}
        </span>
        {canNext ? (
          <Link href={`${basePath}?page=${page + 1}`} className="btn-secondary">
            Next
          </Link>
        ) : (
          <span className="btn-secondary pointer-events-none opacity-50">Next</span>
        )}
      </div>
    </div>
  );
}
