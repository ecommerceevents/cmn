-- Enable public access to all necessary tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Grant specific permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure RLS is enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable public read access" ON public.companies;
DROP POLICY IF EXISTS "Enable public read access" ON public.contacts;
DROP POLICY IF EXISTS "Enable public read access" ON public.keywords;
DROP POLICY IF EXISTS "Enable public read access" ON public.api_keys;
DROP POLICY IF EXISTS "Enable public read access" ON public.enrichment_queue;

-- Create new policies with proper permissions
CREATE POLICY "Enable public and auth read access" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "Enable public and auth read access" ON public.contacts
    FOR SELECT USING (true);

CREATE POLICY "Enable public and auth read access" ON public.keywords
    FOR SELECT USING (true);

CREATE POLICY "Enable public and auth read access" ON public.api_keys
    FOR SELECT USING (true);

CREATE POLICY "Enable public and auth read access" ON public.enrichment_queue
    FOR SELECT USING (true);

-- Grant access to views
GRANT SELECT ON public.vw_company_contacts TO anon, authenticated;
GRANT SELECT ON public.mvw_company_stats TO anon, authenticated;