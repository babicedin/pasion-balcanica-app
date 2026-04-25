declare module "google-reviews-api" {
  export function fetchGoogleMapsReviews(
    placeId: string,
    nextPageToken?: string,
    options?: {
      hl?: string;
      gl?: string;
      targetReviews?: number;
    }
  ): Promise<{
    reviews?: unknown[];
    nextPageToken?: string | null;
  }>;
}
