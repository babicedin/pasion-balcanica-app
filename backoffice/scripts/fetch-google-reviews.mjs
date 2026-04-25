import { scraper } from "google-maps-review-scraper";

async function main() {
  const sourceUrl = process.argv[2];
  const targetReviewsRaw = process.argv[3] ?? "50";
  const targetReviews = Number.parseInt(targetReviewsRaw, 10) || 50;

  if (!sourceUrl) {
    throw new Error("Missing source URL.");
  }

  const pages = Math.max(1, Math.ceil(targetReviews / 10));
  const cleaned = await scraper(sourceUrl, {
    sort_type: "newest",
    pages,
    clean: true,
    search_query: "",
  });

  const rows = Array.isArray(cleaned) ? cleaned.slice(0, targetReviews) : [];
  process.stdout.write(JSON.stringify(rows));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(message);
  process.exit(1);
});
