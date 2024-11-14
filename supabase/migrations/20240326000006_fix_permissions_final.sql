-- Drop all existing policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('DROP POLICY IF EXISTS %I ON %I.%I;',
                   pol.policyname, 
                   pol.schemaname, 
                   pol.tablename),
            E'\n'
        )
        FROM pg_policies pol
        WHERE pol.schemaname = 'public'
    );
END $$;

-- Reset permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table-specific permissions
GRANT SELECT ON public.companies TO anon, authenticated;
GRANT SELECT ON public.contacts TO anon, authenticated;
GRANT SELECT ON public.keywords TO anon, authenticated;
GRANT SELECT ON public.api_keys TO anon, authenticated;
GRANT SELECT ON public.enrichment_queue TO anon, authenticated;
GRANT SELECT ON public.rate_limits TO anon, authenticated;

-- Grant view permissions
GRANT SELECT ON public.vw_company_contacts TO anon, authenticated;
GRANT SELECT ON public.mvw_company_stats TO anon, authenticated;

-- Create new RLS policies
CREATE POLICY "Enable read access for all users" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.contacts
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.keywords
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.api_keys
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.enrichment_queue
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.rate_limits
    FOR SELECT USING (true);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure public role has necessary permissions
GRANT USAGE ON SCHEMA public TO public;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO public;