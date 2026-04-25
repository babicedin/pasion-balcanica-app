declare module "google-maps-review-scraper" {
  export function scraper(
    url: string,
    options?: {
      sort_type?: "relevent" | "newest" | "highest_rating" | "lowest_rating";
      search_query?: string;
      pages?: number;
      clean?: boolean;
    }
  ): Promise<unknown[] | number>;
}
