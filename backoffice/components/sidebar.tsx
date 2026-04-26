"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Home,
  Info,
  MapPin,
  UtensilsCrossed,
  Phone,
  Menu,
  ShoppingBag,
  Star,
  Tag,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
};

const contentNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <Home size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/places",
    label: "Places to visit",
    icon: <MapPin size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/food",
    label: "Food & drink",
    icon: <UtensilsCrossed size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/shops",
    label: "Shopping",
    icon: <ShoppingBag size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/numbers",
    label: "Important numbers",
    icon: <Phone size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    icon: <Star size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: <Bell size={18} strokeWidth={1.75} />,
  },
];

const settingsNavItems: NavItem[] = [
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: <Tag size={18} strokeWidth={1.75} />,
  },
  {
    href: "/dashboard/about",
    label: "Site & About",
    icon: <Info size={18} strokeWidth={1.75} />,
  },
];

type SidebarProps = {
  userLabel: string;
  userSub?: string | null;
};

export function Sidebar({ userLabel, userSub }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <MobileTopBar onOpen={() => setMobileOpen(true)} />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        aria-label="Primary"
        className={cn(
          "fixed z-50 top-0 bottom-0 left-0 w-[268px] flex flex-col bg-white/90 backdrop-blur-xl border-r border-line",
          "transition-transform duration-300 ease-apple-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center"
            aria-label="Pasion Balcanica home"
          >
            <Logo className="h-8 w-auto" priority />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 -mr-2 rounded-lg text-neutral-500 hover:bg-surface-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-2 space-y-5">
          <NavSection label="Content" items={contentNavItems} pathname={pathname} />
          <NavSection label="Settings" items={settingsNavItems} pathname={pathname} />
        </div>

        <div className="mt-auto px-3 pb-5 pt-4 border-t border-line">
          <div className="flex items-center gap-3 px-2 py-2">
            <div
              className="flex-shrink-0 h-9 w-9 rounded-full bg-brand-gradient text-white grid place-items-center text-xs font-semibold tracking-wide"
              aria-hidden
            >
              {initialsOf(userLabel)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-brand-ink truncate">
                {userLabel}
              </div>
              {userSub && (
                <div className="text-xs text-neutral-500 truncate">
                  {userSub}
                </div>
              )}
            </div>
          </div>
          <div className="mt-1">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <div className="px-3 pb-2">
        <span className="h-section">{label}</span>
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active}
              className="nav-link group"
            >
              <span
                className={cn(
                  "text-neutral-400 group-hover:text-brand-ink transition-colors",
                  active && "text-brand-purple"
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white/85 backdrop-blur-xl border-b border-line">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpen}
        className="p-2 -ml-2 rounded-lg text-neutral-700 hover:bg-surface-muted"
      >
        <Menu size={20} />
      </button>
      <Logo className="h-7 w-auto" />
      <div className="w-9" aria-hidden />
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return "PB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}
