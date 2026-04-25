"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-600 hover:text-brand-red hover:bg-brand-red/8 transition-colors duration-200 ease-apple-out"
    >
      <LogOut size={16} strokeWidth={1.75} />
      Sign out
    </button>
  );
}
