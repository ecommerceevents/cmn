-- Reset all permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        -- Create RLS policy for each table
        EXECUTE format(
            'CREATE POLICY "Enable read access for all users" ON public.%I FOR SELECT USING (true)',
            t
        );
    END LOOP;
END $$;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant view permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Ensure materialized view can be accessed
ALTER MATERIALIZED VIEW public.mvw_company_stats OWNER TO postgres;
GRANT SELECT ON public.mvw_company_stats TO anon, authenticated;

-- Create function to refresh stats
CREATE OR REPLACE FUNCTION public.refresh_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mvw_company_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;