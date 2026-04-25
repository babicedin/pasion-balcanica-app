import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { CategoriesManager, type CategoryRow } from "@/components/categories-manager";

export default async function CategoriesPage() {
  const supabase = createSupabaseServerClient();

  const [{ data: food }, { data: shops }, { data: numbers }] = await Promise.all([
    supabase
      .from("food_categories")
      .select("slug, label_es, label_en, icon, display_order, is_published")
      .order("display_order", { ascending: true }),
    supabase
      .from("shop_categories")
      .select("slug, label_es, label_en, icon, display_order, is_published")
      .order("display_order", { ascending: true }),
    supabase
      .from("number_categories")
      .select("slug, label_es, label_en, icon, display_order, is_published")
      .order("display_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Categories"
        description="Manage the categories used for food spots, shops and important numbers. Changes take effect immediately in the forms and the mobile app."
      />

      <CategoriesManager
        initialFood={(food ?? []) as CategoryRow[]}
        initialShops={(shops ?? []) as CategoryRow[]}
        initialNumbers={(numbers ?? []) as CategoryRow[]}
      />
    </div>
  );
}
