import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Turn human-readable text into a safe slug for use as a primary key.
 *
 *   "Fine Dining"        -> "fine_dining"
 *   "Café & Pastelería"  -> "cafe_pasteleria"
 *   "   24h pharmacy!"   -> "24h_pharmacy"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

