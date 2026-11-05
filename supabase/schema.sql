-- ============================================================================
-- RESOLVE MUN 2.0 — SUPABASE POSTGRES SCHEMA & RLS POLICIES
-- Venue: Meridian School, Kompally, Hyderabad | 27–29 November 2026
-- ============================================================================

-- 1. SITE SETTINGS TABLE (Single-row configuration for passes, prices & UPI)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'global',
  registrations_open boolean NOT NULL DEFAULT true,
  delegate_open boolean NOT NULL DEFAULT true,
  delegation_open boolean NOT NULL DEFAULT true,
  oc_open boolean NOT NULL DEFAULT true,
  eb_open boolean NOT NULL DEFAULT false,
  socials_open boolean NOT NULL DEFAULT false,
  secretariat_open boolean NOT NULL DEFAULT true,
  round_name text NOT NULL DEFAULT 'Priority Round Applications',
  delegate_fee numeric NOT NULL DEFAULT 2500,
  delegation_fee numeric NOT NULL DEFAULT 2200,
  oc_fee_full numeric NOT NULL DEFAULT 1500,
  oc_fee_no_transport numeric NOT NULL DEFAULT 1000,
  oc_fee_basic numeric NOT NULL DEFAULT 750,
  socials_fee numeric NOT NULL DEFAULT 999,
  upi_id text NOT NULL DEFAULT '6301550628@nyes',
  upi_payee text NOT NULL DEFAULT 'Bejugam Aditya',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (
  id, registrations_open, delegate_open, delegation_open, oc_open,
  eb_open, socials_open, secretariat_open, round_name,
  delegate_fee, delegation_fee, oc_fee_full, oc_fee_no_transport, oc_fee_basic,
  socials_fee, upi_id, upi_payee
) VALUES (
  'global', true, true, true, true,
  false, false, true, 'Priority Round Applications',
  2500, 2200, 1500, 1000, 750,
  999, '6301550628@nyes', 'Bejugam Aditya'
) ON CONFLICT (id) DO NOTHING;

-- 2. DELEGATES TABLE (Individual & Delegation Delegates)
CREATE TABLE IF NOT EXISTS public.delegates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegate_id text UNIQUE NOT NULL,
  user_id text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  school text NOT NULL,
  dob text,
  grade text,
  address text,
  transport text DEFAULT 'No',
  experience text,
  pref1_committee text,
  pref1_portfolio1 text,
  pref1_portfolio2 text,
  pref2_committee text,
  pref2_portfolio1 text,
  pref2_portfolio2 text,
  pref3_committee text,
  pref3_portfolio1 text,
  pref3_portfolio2 text,
  delegation_name text,
  head_delegate_name text,
  delegation_code text DEFAULT 'Independent',
  registration_fee numeric DEFAULT 2500,
  payment_utr text,
  payment_screenshot_url text,
  payment_status text NOT NULL DEFAULT 'PENDING_VERIFICATION',
  status text NOT NULL DEFAULT 'Pending',
  allocated_committee text,
  allocated_country text,
  referral_code text,
  additional_info text,
  qr_token text,
  check_in_day1 text NOT NULL DEFAULT 'Absent',
  check_in_day2 text NOT NULL DEFAULT 'Absent',
  check_in_day3 text NOT NULL DEFAULT 'Absent',
  last_check_in timestamptz,
  allotment_email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delegates_email ON public.delegates (lower(email));
CREATE INDEX IF NOT EXISTS idx_delegates_user_id ON public.delegates (user_id);
CREATE INDEX IF NOT EXISTS idx_delegates_delegate_id ON public.delegates (delegate_id);

-- 3. DELEGATIONS TABLE (School / Institutional Delegations)
CREATE TABLE IF NOT EXISTS public.delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegation_id text UNIQUE NOT NULL,
  delegation_name text NOT NULL,
  head_delegate_name text NOT NULL,
  inst_name text NOT NULL,
  adviser_name text,
  adviser_email text NOT NULL,
  adviser_phone text NOT NULL,
  size integer NOT NULL DEFAULT 6,
  delegates jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL DEFAULT 13200,
  payment_utr text,
  payment_screenshot_url text,
  referral_code text,
  additional_info text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delegations_email ON public.delegations (lower(adviser_email));

-- 4. OC APPLICATIONS TABLE (Organizing Committee - Salaried Role)
CREATE TABLE IF NOT EXISTS public.oc_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text UNIQUE NOT NULL,
  user_id text,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  school text NOT NULL,
  dob text NOT NULL,
  grade text NOT NULL,
  address text NOT NULL,
  transport text NOT NULL DEFAULT 'Yes',
  payment_tier text NOT NULL DEFAULT '1500_FULL',
  fee_amount numeric NOT NULL DEFAULT 1500,
  payment_utr text,
  payment_screenshot_url text,
  payment_status text NOT NULL DEFAULT 'PENDING_VERIFICATION',
  referral_code text,
  additional_info text,
  allocated_department text,
  status text NOT NULL DEFAULT 'Pending',
  check_in_day1 text NOT NULL DEFAULT 'Absent',
  check_in_day2 text NOT NULL DEFAULT 'Absent',
  check_in_day3 text NOT NULL DEFAULT 'Absent',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oc_applications_email ON public.oc_applications (lower(email));

-- 5. SECRETARIAT APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.secretariat_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text UNIQUE NOT NULL,
  user_id text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  instagram text,
  school_college text NOT NULL,
  residential_address text,
  dob text NOT NULL,
  grade text NOT NULL,
  previous_experiences text,
  position text NOT NULL,
  why_join text NOT NULL,
  contribution text NOT NULL,
  daily_commitment text NOT NULL,
  portfolio_url text,
  resume_url text,
  status text NOT NULL DEFAULT 'Pending',
  allocated_role text,
  check_in_day1 text NOT NULL DEFAULT 'Absent',
  check_in_day2 text NOT NULL DEFAULT 'Absent',
  check_in_day3 text NOT NULL DEFAULT 'Absent',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secretariat_applications_email ON public.secretariat_applications (lower(email));

-- 6. EB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.eb_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text UNIQUE NOT NULL,
  user_id text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  institute text NOT NULL,
  dob text,
  role_preference text,
  committees text,
  mun_count text,
  experience text,
  why_join text,
  cv_url text,
  referral_code text,
  status text NOT NULL DEFAULT 'Pending',
  allocated_committee text,
  allocated_role text,
  check_in_day1 text NOT NULL DEFAULT 'Absent',
  check_in_day2 text NOT NULL DEFAULT 'Absent',
  check_in_day3 text NOT NULL DEFAULT 'Absent',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eb_applications_email ON public.eb_applications (lower(email));

-- 7. CHECK-IN LOGS TABLE (3-Day QR Scanner Audit Trail)
CREATE TABLE IF NOT EXISTS public.check_in_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegate_id text NOT NULL,
  full_name text,
  email text,
  role text DEFAULT 'DELEGATE',
  day text NOT NULL DEFAULT 'Day 1',
  action_type text NOT NULL DEFAULT 'ENTRY',
  verified_by text NOT NULL DEFAULT 'Secretariat Desk',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_in_logs_delegate_id ON public.check_in_logs (delegate_id);

-- 8. ROW LEVEL SECURITY & GRANTS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oc_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretariat_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delegates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delegations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oc_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secretariat_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eb_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.check_in_logs TO anon, authenticated;

CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin update site_settings" ON public.site_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Access delegates" ON public.delegates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Access delegations" ON public.delegations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Access oc_applications" ON public.oc_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Access secretariat_applications" ON public.secretariat_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Access eb_applications" ON public.eb_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Access check_in_logs" ON public.check_in_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

