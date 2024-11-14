-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.companies;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contacts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.keywords;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.api_keys;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.enrichment_queue;

-- Create more permissive policies for public access
CREATE POLICY "Enable public read access" ON public.companies
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable public read access" ON public.contacts
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable public read access" ON public.keywords
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable public read access" ON public.api_keys
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable public read access" ON public.enrichment_queue
    FOR SELECT TO public USING (true);

-- Grant necessary permissions to public role
GRANT USAGE ON SCHEMA public TO public;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO public;

-- Enable security definer on views
ALTER VIEW public.vw_company_contacts SET (security_invoker = false);
ALTER MATERIALIZED VIEW public.mvw_company_stats SET (security_invoker = false);