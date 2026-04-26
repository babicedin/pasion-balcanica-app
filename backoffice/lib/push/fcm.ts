import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import {
  getMessaging,
  type MulticastMessage,
  type SendResponse,
} from "firebase-admin/messaging";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Lazy singleton init of the Firebase Admin SDK. Reads the service-account
 * JSON from `FCM_SERVICE_ACCOUNT_JSON` (the entire JSON pasted into one
 * Vercel env var). We never instantiate twice — Next.js HMR calls the
 * route handler module repeatedly and `initializeApp` throws if duplicated.
 */
function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0]!;

  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FCM_SERVICE_ACCOUNT_JSON not set. Paste the entire service-account JSON into the Vercel env var."
    );
  }
  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error("FCM_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }
  return initializeApp({ credential: cert(parsed) });
}

export type DeviceTokenRow = {
  id: string;
  token: string;
  locale: "en" | "es";
};

export type Localized<T extends string = string> = {
  en: T;
  es: T;
};

/**
 * Send a notification to a list of devices, picking the EN or ES variant
 * for each based on the device's persisted locale. Returns per-device
 * success counts and the list of tokens FCM rejected as permanently
 * invalid (UNREGISTERED / NOT_FOUND) — caller is expected to delete those
 * from the device_tokens table so they don't keep getting picked up.
 *
 * Splits into 500-token batches, the FCM HTTP v1 hard limit per
 * sendEachForMulticast call.
 */
export async function sendLocalizedPush({
  devices,
  title,
  body,
  data,
}: {
  devices: DeviceTokenRow[];
  title: Localized;
  body: Localized;
  data?: Record<string, string>;
}) {
  if (devices.length === 0) {
    return { success: 0, failure: 0, invalidTokens: [] as string[] };
  }

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  // Group by locale so we send the right localized payload to each
  // bucket. Bucket-then-batch keeps each message identical within a
  // multicast call (which is what FCM expects).
  const byLocale: Record<"en" | "es", DeviceTokenRow[]> = { en: [], es: [] };
  for (const d of devices) byLocale[d.locale].push(d);

  let success = 0;
  let failure = 0;
  const invalidTokens: string[] = [];

  for (const locale of ["en", "es"] as const) {
    const bucket = byLocale[locale];
    if (bucket.length === 0) continue;

    for (let i = 0; i < bucket.length; i += 500) {
      const slice = bucket.slice(i, i + 500);
      const message: MulticastMessage = {
        notification: {
          title: title[locale],
          body: body[locale],
        },
        data: data ?? {},
        tokens: slice.map((d) => d.token),
        android: {
          priority: "high",
          notification: {
            // Default channel — Flutter's FCM plugin auto-creates
            // "Miscellaneous" if we don't specify. Good enough for now.
            sound: "default",
          },
        },
      };

      const result = await messaging.sendEachForMulticast(message);
      success += result.successCount;
      failure += result.failureCount;

      result.responses.forEach((r: SendResponse, idx: number) => {
        if (r.success) return;
        const code = r.error?.code ?? "";
        // FCM error codes that mean "this token is dead, stop sending":
        // https://firebase.google.com/docs/cloud-messaging/manage-tokens#detect-invalid-token-responses-from-the-fcm-backend
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(slice[idx]!.token);
        }
      });
    }
  }

  return { success, failure, invalidTokens };
}

/** Drop tokens that FCM said are permanently dead. */
export async function pruneInvalidTokens(tokens: string[]) {
  if (tokens.length === 0) return 0;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("device_tokens").delete().in("token", tokens);
  if (error) {
    throw new Error(`Failed to prune invalid tokens: ${error.message}`);
  }
  return tokens.length;
}
