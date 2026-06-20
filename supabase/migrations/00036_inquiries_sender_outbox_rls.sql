-- Migration 00036_inquiries_sender_outbox_rls.sql

-- 1. Drop existing permissive insert policy that allows insert without sender_id check
DROP POLICY IF EXISTS "inquiries_public_insert_active_offer" ON public.inquiries;

-- 2. Create a safe insert policy for inquiries
CREATE POLICY "inquiries_safe_insert_with_sender"
ON public.inquiries
AS PERMISSIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (
  (
    (auth.uid() IS NULL AND sender_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND sender_id = auth.uid())
  )
  AND
  exists (
    select 1
    from public.offers
    where offers.id = inquiries.offer_id
      and offers.company_id = inquiries.company_id
      and offers.status = 'active'
  )
);

-- 3. Create a select policy for the sender
CREATE POLICY "inquiries_sender_select_own"
ON public.inquiries
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (sender_id = auth.uid());
