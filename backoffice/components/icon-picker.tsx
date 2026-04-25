"use client";

import {
  Anchor,
  Apple,
  AlertCircle,
  AlertTriangle,
  Ambulance,
  Beef,
  Beer,
  Bike,
  Building,
  Building2,
  Bus,
  Cake,
  Candy,
  Car,
  Carrot,
  ChefHat,
  Cherry,
  ChevronDown,
  Citrus,
  Coffee,
  Compass,
  Cookie,
  Croissant,
  Cross,
  CupSoda,
  Drumstick,
  Egg,
  Fish,
  Flame,
  Flower2,
  Gem,
  Gift,
  GlassWater,
  Globe,
  Grape,
  HandHeart,
  Hammer,
  Headphones,
  HelpCircle,
  Hospital,
  IceCream,
  Info,
  Landmark,
  LifeBuoy,
  type LucideIcon,
  Map,
  MapPin,
  Martini,
  Milk,
  Music,
  Palette,
  Paintbrush,
  Phone,
  PhoneCall,
  Pill,
  Pizza,
  Plane,
  Popcorn,
  Salad,
  Sandwich,
  Scissors,
  Search,
  Shield,
  ShieldAlert,
  Shirt,
  Ship,
  ShoppingBag,
  ShoppingCart,
  Siren,
  Soup,
  Sparkles,
  Stethoscope,
  Store,
  Tag,
  Train,
  Utensils,
  UtensilsCrossed,
  Watch,
  Wine,
  BookOpen,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type IconGroup = "food" | "service" | "shop" | "all";

/**
 * Icon catalogue. Each entry maps a lowercase kebab-case slug (what we store
 * in the database) to its Lucide component. Group tags let the picker narrow
 * the grid depending on whether we're picking a food icon or a service one.
 */
export const ICON_LIBRARY: ReadonlyArray<{
  slug: string;
  label: string;
  Icon: LucideIcon;
  groups: IconGroup[];
}> = [
  // ── Food & drink ────────────────────────────────────────
  { slug: "utensils", label: "Utensils", Icon: Utensils, groups: ["food"] },
  { slug: "utensils-crossed", label: "Utensils crossed", Icon: UtensilsCrossed, groups: ["food"] },
  { slug: "chef-hat", label: "Chef hat", Icon: ChefHat, groups: ["food"] },
  { slug: "coffee", label: "Coffee", Icon: Coffee, groups: ["food"] },
  { slug: "pizza", label: "Pizza", Icon: Pizza, groups: ["food"] },
  { slug: "sandwich", label: "Sandwich", Icon: Sandwich, groups: ["food"] },
  { slug: "soup", label: "Soup", Icon: Soup, groups: ["food"] },
  { slug: "salad", label: "Salad", Icon: Salad, groups: ["food"] },
  { slug: "croissant", label: "Croissant", Icon: Croissant, groups: ["food"] },
  { slug: "cookie", label: "Cookie", Icon: Cookie, groups: ["food"] },
  { slug: "cake", label: "Cake", Icon: Cake, groups: ["food"] },
  { slug: "ice-cream", label: "Ice cream", Icon: IceCream, groups: ["food"] },
  { slug: "candy", label: "Candy", Icon: Candy, groups: ["food"] },
  { slug: "popcorn", label: "Popcorn", Icon: Popcorn, groups: ["food"] },
  { slug: "apple", label: "Apple", Icon: Apple, groups: ["food"] },
  { slug: "cherry", label: "Cherry", Icon: Cherry, groups: ["food"] },
  { slug: "grape", label: "Grape", Icon: Grape, groups: ["food"] },
  { slug: "citrus", label: "Citrus", Icon: Citrus, groups: ["food"] },
  { slug: "carrot", label: "Carrot", Icon: Carrot, groups: ["food"] },
  { slug: "beef", label: "Beef", Icon: Beef, groups: ["food"] },
  { slug: "drumstick", label: "Drumstick", Icon: Drumstick, groups: ["food"] },
  { slug: "fish", label: "Fish", Icon: Fish, groups: ["food"] },
  { slug: "egg", label: "Egg", Icon: Egg, groups: ["food"] },
  { slug: "milk", label: "Milk", Icon: Milk, groups: ["food"] },
  { slug: "beer", label: "Beer", Icon: Beer, groups: ["food"] },
  { slug: "wine", label: "Wine", Icon: Wine, groups: ["food"] },
  { slug: "martini", label: "Martini", Icon: Martini, groups: ["food"] },
  { slug: "glass-water", label: "Glass of water", Icon: GlassWater, groups: ["food"] },
  { slug: "cup-soda", label: "Cup of soda", Icon: CupSoda, groups: ["food"] },
  { slug: "store", label: "Store", Icon: Store, groups: ["food", "shop"] },
  { slug: "shopping-bag", label: "Shopping bag", Icon: ShoppingBag, groups: ["food", "shop"] },
  { slug: "shopping-cart", label: "Shopping cart", Icon: ShoppingCart, groups: ["food", "shop"] },

  // ── Service / important numbers ─────────────────────────
  { slug: "phone", label: "Phone", Icon: Phone, groups: ["service"] },
  { slug: "phone-call", label: "Phone call", Icon: PhoneCall, groups: ["service"] },
  { slug: "alert-triangle", label: "Alert triangle", Icon: AlertTriangle, groups: ["service"] },
  { slug: "alert-circle", label: "Alert circle", Icon: AlertCircle, groups: ["service"] },
  { slug: "ambulance", label: "Ambulance", Icon: Ambulance, groups: ["service"] },
  { slug: "hospital", label: "Hospital", Icon: Hospital, groups: ["service"] },
  { slug: "stethoscope", label: "Stethoscope", Icon: Stethoscope, groups: ["service"] },
  { slug: "pill", label: "Pill", Icon: Pill, groups: ["service"] },
  { slug: "cross", label: "Medical cross", Icon: Cross, groups: ["service"] },
  { slug: "shield", label: "Shield", Icon: Shield, groups: ["service"] },
  { slug: "shield-alert", label: "Shield alert", Icon: ShieldAlert, groups: ["service"] },
  { slug: "siren", label: "Siren", Icon: Siren, groups: ["service"] },
  { slug: "flame", label: "Flame", Icon: Flame, groups: ["service"] },
  { slug: "life-buoy", label: "Life buoy", Icon: LifeBuoy, groups: ["service"] },
  { slug: "bus", label: "Bus", Icon: Bus, groups: ["service"] },
  { slug: "train", label: "Train", Icon: Train, groups: ["service"] },
  { slug: "plane", label: "Plane", Icon: Plane, groups: ["service"] },
  { slug: "ship", label: "Ship", Icon: Ship, groups: ["service"] },
  { slug: "anchor", label: "Anchor", Icon: Anchor, groups: ["service"] },
  { slug: "car", label: "Car", Icon: Car, groups: ["service"] },
  { slug: "bike", label: "Bike", Icon: Bike, groups: ["service"] },
  { slug: "compass", label: "Compass", Icon: Compass, groups: ["service"] },
  { slug: "globe", label: "Globe", Icon: Globe, groups: ["service"] },
  { slug: "map", label: "Map", Icon: Map, groups: ["service"] },
  { slug: "map-pin", label: "Map pin", Icon: MapPin, groups: ["service"] },
  { slug: "landmark", label: "Landmark", Icon: Landmark, groups: ["service"] },
  { slug: "building", label: "Building", Icon: Building, groups: ["service"] },
  { slug: "building-2", label: "Office building", Icon: Building2, groups: ["service"] },
  { slug: "info", label: "Info", Icon: Info, groups: ["service"] },
  { slug: "help-circle", label: "Help", Icon: HelpCircle, groups: ["service"] },
  { slug: "zap", label: "Zap", Icon: Zap, groups: ["service"] },

  // ── Shopping ────────────────────────────────────────────
  { slug: "shirt", label: "Shirt", Icon: Shirt, groups: ["shop"] },
  { slug: "watch", label: "Watch", Icon: Watch, groups: ["shop"] },
  { slug: "gem", label: "Gem", Icon: Gem, groups: ["shop"] },
  { slug: "gift", label: "Gift", Icon: Gift, groups: ["shop"] },
  { slug: "tag", label: "Tag", Icon: Tag, groups: ["shop"] },
  { slug: "scissors", label: "Scissors", Icon: Scissors, groups: ["shop"] },
  { slug: "hammer", label: "Hammer", Icon: Hammer, groups: ["shop"] },
  { slug: "palette", label: "Palette", Icon: Palette, groups: ["shop"] },
  { slug: "paintbrush", label: "Paintbrush", Icon: Paintbrush, groups: ["shop"] },
  { slug: "flower", label: "Flower", Icon: Flower2, groups: ["shop"] },
  { slug: "sparkles", label: "Sparkles", Icon: Sparkles, groups: ["shop"] },
  { slug: "book", label: "Book", Icon: BookOpen, groups: ["shop"] },
  { slug: "music", label: "Music", Icon: Music, groups: ["shop"] },
  { slug: "headphones", label: "Headphones", Icon: Headphones, groups: ["shop"] },
  { slug: "hand-heart", label: "Hand heart", Icon: HandHeart, groups: ["shop"] },
];

/** Lucide component for a given slug; falls back to HelpCircle. */
export function iconBySlug(slug: string | null | undefined): LucideIcon {
  if (!slug) return HelpCircle;
  return ICON_LIBRARY.find((i) => i.slug === slug)?.Icon ?? HelpCircle;
}

/**
 * Small round icon preview, handy for lists and selects.
 */
export function IconPreview({
  slug,
  size = 16,
  className,
}: {
  slug: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const Icon = iconBySlug(slug);
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

type IconPickerProps = {
  value: string;
  onChange: (slug: string) => void;
  group?: IconGroup;
  id?: string;
  /** Optional placeholder when no value is selected yet. */
  placeholder?: string;
  /** Additional classes for the trigger button. */
  className?: string;
};

/**
 * Popover-style icon picker. The trigger shows the current selection;
 * clicking opens a searchable grid of available icons.
 */
export function IconPicker({
  value,
  onChange,
  group = "all",
  id,
  placeholder = "Select icon",
  className,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const base =
      group === "all"
        ? ICON_LIBRARY
        : ICON_LIBRARY.filter((i) => i.groups.includes(group));
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (i) => i.slug.includes(q) || i.label.toLowerCase().includes(q)
    );
  }, [group, query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
      queueMicrotask(() => searchRef.current?.focus());
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [open]);

  const selected = ICON_LIBRARY.find((i) => i.slug === value);
  const SelectedIcon = selected?.Icon ?? HelpCircle;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between gap-2 text-left w-full"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <SelectedIcon
            size={16}
            strokeWidth={1.75}
            className={selected ? "text-brand-purple" : "text-neutral-400"}
          />
          <span className="truncate text-sm">
            {selected ? selected.label : value || placeholder}
          </span>
        </span>
        <ChevronDown size={14} className="text-neutral-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-72 card p-2 shadow-pop">
          <div className="relative mb-2">
            <Search
              size={13}
              strokeWidth={1.75}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="input py-1.5 pl-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-6 gap-1 max-h-60 overflow-y-auto">
            {options.map(({ slug, Icon, label }) => (
              <button
                key={slug}
                type="button"
                onClick={() => {
                  onChange(slug);
                  setOpen(false);
                  setQuery("");
                }}
                title={label}
                className={cn(
                  "aspect-square grid place-items-center rounded-lg hover:bg-surface-muted transition-colors",
                  value === slug &&
                    "bg-brand-purple/10 text-brand-purple ring-1 ring-brand-purple/30"
                )}
              >
                <Icon size={18} strokeWidth={1.75} />
              </button>
            ))}
            {options.length === 0 && (
              <div className="col-span-6 text-center text-sm text-neutral-500 py-6">
                No icons match “{query}”.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
