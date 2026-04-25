import { fetchGoogleMapsReviews } from "google-reviews-api";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

type ScrapedReview = {
  content: string;
  url?: string;
  date?: Date | null;
  attributes?: {
    rating?: number;
    "user-name"?: string;
    "user-image-url"?: string;
    "user-url"?: string;
  };
};

export type ImportedReview = {
  externalReviewId: string;
  quote: string;
  rating: number;
  author: string;
  sourceUrl: string | null;
  authorAvatarUrl: string | null;
  reviewCreatedAt: string | null;
  rawPayload: unknown;
};

export function extractPlaceIdFromGoogleMapsUrl(url: string): string | null {
  const match = url.match(/([0-9a-f]{8,}:0x[0-9a-f]{8,})/i);
  return match?.[1] ?? null;
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function makeExternalId(review: ScrapedReview, index: number) {
  const urlPart = review.url?.trim();
  if (urlPart) return urlPart;
  const author = review.attributes?.["user-name"]?.trim() ?? "anonymous";
  const quote = review.content.trim();
  return `generated-${hashString(`${author}|${quote}|${index}`)}`;
}

type CleanedScrapedReview = {
  review_id?: string;
  time?: {
    published?: number;
    last_edited?: number;
  };
  author?: {
    name?: string;
    profile_url?: string;
    url?: string;
  };
  review?: {
    rating?: number;
    text?: string;
  };
};

const execFileAsync = promisify(execFile);

function microsToIso(value: number | undefined) {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(Math.floor(value / 1000)).toISOString();
}

export async function fetchReviewsFromGoogleScraper(params: {
  sourceUrl: string;
  placeId?: string;
  targetReviews: number;
  hl?: string;
  gl?: string;
}): Promise<ImportedReview[]> {
  let cleanedRows: CleanedScrapedReview[] = [];
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "fetch-google-reviews.mjs");
    const { stdout } = await execFileAsync(
      process.execPath,
      [scriptPath, params.sourceUrl, String(params.targetReviews)],
      { maxBuffer: 1024 * 1024 * 10 }
    );
    const parsed = JSON.parse(stdout) as unknown;
    cleanedRows = Array.isArray(parsed) ? (parsed as CleanedScrapedReview[]) : [];
  } catch {
    cleanedRows = [];
  }

  let reviews: ImportedReview[] = cleanedRows
    .filter((review) => review.review?.text?.trim())
    .slice(0, params.targetReviews)
    .map((review, index) => {
      const rating = Number(review.review?.rating ?? 5);
      const safeRating = Number.isFinite(rating)
        ? Math.max(1, Math.min(5, Math.round(rating)))
        : 5;

      return {
        externalReviewId: review.review_id?.trim() || `review-${index}`,
        quote: review.review?.text?.trim() ?? "",
        rating: safeRating,
        author: review.author?.name?.trim() || "Anonymous",
        sourceUrl: review.author?.url?.trim() || null,
        authorAvatarUrl: review.author?.profile_url?.trim() || null,
        reviewCreatedAt: microsToIso(review.time?.published),
        rawPayload: review,
      } satisfies ImportedReview;
    });

  // Fallback to previous package if clean scraper returns no text reviews.
  if (reviews.length === 0 && params.placeId) {
    const raw = (await fetchGoogleMapsReviews(params.placeId, "", {
      targetReviews: params.targetReviews,
      hl: params.hl ?? "en",
      gl: params.gl ?? "ba",
    })) as { reviews?: ScrapedReview[] };
    reviews = (raw.reviews ?? [])
      .filter((review) => review.content?.trim())
      .map((review, index) => {
        const rating = Number(review.attributes?.rating ?? 5);
        const safeRating = Number.isFinite(rating)
          ? Math.max(1, Math.min(5, Math.round(rating)))
          : 5;

        return {
          externalReviewId: makeExternalId(review, index),
          quote: review.content.trim(),
          rating: safeRating,
          author: (review.attributes?.["user-name"] ?? "").trim() || "Anonymous",
          sourceUrl: review.url?.trim() || null,
          authorAvatarUrl: review.attributes?.["user-image-url"]?.trim() || null,
          reviewCreatedAt: review.date ? review.date.toISOString() : null,
          rawPayload: review,
        } satisfies ImportedReview;
      });
  }

  const deduped = new Map<string, ImportedReview>();
  for (const review of reviews) deduped.set(review.externalReviewId, review);
  return [...deduped.values()];
}
