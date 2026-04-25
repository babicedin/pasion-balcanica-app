import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StatCard = {
  label: string;
  href: string;
  count: number;
  icon: React.ReactNode;
  hint: string;
};

export default async function DashboardHome() {
  const supabase = createSupabaseServerClient();

  const [places, food, numbers] = await Promise.all([
    supabase.from("places_to_visit").select("id", { count: "exact", head: true }),
    supabase.from("food_spots").select("id", { count: "exact", head: true }),
    supabase.from("important_numbers").select("id", { count: "exact", head: true }),
  ]);

  const cards: StatCard[] = [
    {
      label: "Places to visit",
      href: "/dashboard/places",
      count: places.count ?? 0,
      icon: <MapPin size={18} strokeWidth={1.75} />,
      hint: "Sights, monuments and landmarks.",
    },
    {
      label: "Food & drink",
      href: "/dashboard/food",
      count: food.count ?? 0,
      icon: <UtensilsCrossed size={18} strokeWidth={1.75} />,
      hint: "Restaurants, cafés and markets.",
    },
    {
      label: "Important numbers",
      href: "/dashboard/numbers",
      count: numbers.count ?? 0,
      icon: <Phone size={18} strokeWidth={1.75} />,
      hint: "Emergency, transport and info.",
    },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="h-section">Overview</p>
        <h1 className="h-display mt-2">Welcome back</h1>
        <p className="text-muted mt-1 max-w-xl">
          A snapshot of what&apos;s currently in the Pasion Balcanica app.
          Drill into any area to add, edit or publish content.
        </p>
      </header>

      <section aria-label="Content stats">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="card card-hover p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-surface-muted text-brand-purple">
                  {c.icon}
                </div>
                <ArrowRight
                  size={16}
                  className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
                />
              </div>
              <div>
                <div className="text-sm text-muted">{c.label}</div>
                <div className="mt-1 text-3xl font-semibold tracking-tightish text-brand-ink tabular-nums">
                  {c.count}
                </div>
                <div className="text-xs text-neutral-500 mt-1">{c.hint}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Quick actions" className="card p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tightish text-brand-ink">
              Quick actions
            </h2>
            <p className="text-sm text-muted mt-1">
              Jump straight to the most common tasks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/places" className="btn-secondary">
              <MapPin size={16} strokeWidth={1.75} />
              Manage places
            </Link>
            <Link href="/dashboard/food" className="btn-secondary">
              <UtensilsCrossed size={16} strokeWidth={1.75} />
              Manage food
            </Link>
            <Link href="/dashboard/numbers" className="btn-secondary">
              <Phone size={16} strokeWidth={1.75} />
              Manage numbers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
