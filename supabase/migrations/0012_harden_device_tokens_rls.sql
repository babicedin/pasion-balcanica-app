-- Tighten anonymous write access for push tokens.
-- We keep anon/authenticated EXECUTE on register_device_token(...)
-- and remove direct INSERT/UPDATE paths on the table itself.

alter table if exists public.device_tokens enable row level security;

drop policy if exists "device_tokens_anon_insert" on public.device_tokens;
drop policy if exists "device_tokens_anon_update" on public.device_tokens;

-- Ensure clients can only write through the SECURITY DEFINER RPC.
revoke insert, update on table public.device_tokens from anon, authenticated;

