-- Bulk reorder helper + notifications active-device index

create or replace function public.reorder_content(
  p_table text,
  p_ids uuid[]
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table not in (
    'places_to_visit',
    'food_spots',
    'shops',
    'important_numbers',
    'reviews'
  ) then
    raise exception 'Unsupported table for reorder: %', p_table;
  end if;

  execute format(
    'update public.%I as t
       set display_order = src.ord - 1
      from unnest($1::uuid[]) with ordinality as src(id, ord)
     where t.id = src.id',
    p_table
  )
  using p_ids;
end;
$$;

grant execute on function public.reorder_content(text, uuid[]) to authenticated;

create index if not exists idx_device_tokens_last_seen_at
  on public.device_tokens (last_seen_at desc);
