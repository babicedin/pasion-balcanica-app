import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  extractPlaceIdFromGoogleMapsUrl,
  fetchReviewsFromGoogleScraper,
} from "@/lib/reviews/google-scraper";

export const runtime = "nodejs";

async function isSignedInAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return Boolean(data?.is_admin);
}

function hasSyncSecret(request: NextRequest) {
  const secret = process.env.REVIEWS_SYNC_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

function describeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : JSON.stringify(message);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export async function POST(request: NextRequest) {
  const allowSecret = hasSyncSecret(request);
  const allowAdminSession = await isSignedInAdmin();
  if (!allowSecret && !allowAdminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const sourceUrl = process.env.GOOGLE_REVIEWS_SOURCE_URL ?? "";
  const explicitPlaceId = process.env.GOOGLE_REVIEWS_PLACE_ID ?? "";
  const placeId =
    explicitPlaceId.trim() || extractPlaceIdFromGoogleMapsUrl(sourceUrl);

  if (!placeId) {
    return NextResponse.json(
      { error: "Missing GOOGLE_REVIEWS_PLACE_ID or parseable source URL." },
      { status: 400 }
    );
  }

  const targetReviews = Number(process.env.GOOGLE_REVIEWS_TARGET ?? 50);
  const hl = process.env.GOOGLE_REVIEWS_HL ?? "en";
  const gl = process.env.GOOGLE_REVIEWS_GL ?? "ba";

  const { data: run, error: runInsertError } = await admin
    .from("review_sync_runs")
    .insert({
      source: "google_scraper",
      status: "running",
      metadata: { placeId, targetReviews, sourceUrl },
    })
    .select("id")
    .single();

  if (runInsertError) {
    return NextResponse.json(
      { error: runInsertError.message },
      { status: 500 }
    );
  }

  try {
    const imported = await fetchReviewsFromGoogleScraper({
      sourceUrl,
      placeId,
      targetReviews,
      hl,
      gl,
    });

    const rows = imported.map((review, idx) => ({
      source: "google_scraper",
      external_review_id: review.externalReviewId,
      quote_en: review.quote,
      quote_es: review.quote,
      author: review.author,
      rating: review.rating,
      source_url: review.sourceUrl,
      source_review_url: review.sourceUrl,
      author_avatar_url: review.authorAvatarUrl,
      review_created_at: review.reviewCreatedAt,
      review_updated_at: review.reviewCreatedAt,
      fetched_at: new Date().toISOString(),
      display_order: idx,
      raw_payload: review.rawPayload,
    }));

    let upsertedCount = 0;
    if (rows.length > 0) {
      const externalIds = rows
        .map((row) => row.external_review_id)
        .filter((value): value is string => Boolean(value));

      const { data: existing, error: existingError } = await admin
        .from("reviews")
        .select("id, external_review_id")
        .in("external_review_id", externalIds);
      if (existingError) throw existingError;

      const existingByExternalId = new Map(
        (existing ?? []).map((item) => [item.external_review_id as string, item.id as string])
      );

      const updates = rows.filter((row) =>
        existingByExternalId.has(row.external_review_id)
      );
      const inserts = rows.filter(
        (row) => !existingByExternalId.has(row.external_review_id)
      );

      if (updates.length > 0) {
        const updateResults = await Promise.all(
          updates.map((row) =>
            admin
              .from("reviews")
              .update(row)
              .eq("id", existingByExternalId.get(row.external_review_id)!)
          )
        );
        const firstUpdateError = updateResults.find((result) => result.error)?.error;
        if (firstUpdateError) throw firstUpdateError;
      }

      if (inserts.length > 0) {
        const { error: insertError } = await admin.from("reviews").insert(inserts);
        if (insertError) throw insertError;
      }

      upsertedCount = updates.length + inserts.length;
    }

    const { error: runUpdateError } = await admin
      .from("review_sync_runs")
      .update({
        status: "success",
        reviews_fetched: imported.length,
        reviews_upserted: upsertedCount,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    if (runUpdateError) throw runUpdateError;

    return NextResponse.json({
      ok: true,
      fetched: imported.length,
      upserted: upsertedCount,
      placeId,
    });
  } catch (error) {
    const message = describeError(error);
    await admin
      .from("review_sync_runs")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
