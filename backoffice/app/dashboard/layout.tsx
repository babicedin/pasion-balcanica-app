import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { Sidebar } from "@/components/sidebar";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return (
      <main className="hero-bg min-h-screen flex items-center justify-center px-5 py-12">
        <div className="relative w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Logo className="h-10 w-auto" />
          </div>
          <div className="card p-7 text-center">
            <h1 className="h-title mb-2">Not authorized</h1>
            <p className="text-sm text-muted mb-5">
              Your account exists but isn&apos;t marked as an admin. Ask a
              project maintainer to flip <code className="font-mono text-brand-purple">is_admin</code>
              {" "}on your profile row.
            </p>
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  const userLabel = profile.full_name || profile.email || user.email || "Admin";
  const userSub = profile.full_name ? profile.email || user.email : null;

  return (
    <div className="min-h-screen bg-surface-muted">
      <Sidebar userLabel={userLabel} userSub={userSub} />
      <div className="md:pl-[268px]">
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-6 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
