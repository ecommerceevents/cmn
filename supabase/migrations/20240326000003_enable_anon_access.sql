-- Enable anonymous access to read-only operations
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Enable read access for all users" ON public.companies
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON public.contacts
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON public.keywords
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON public.api_keys
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON public.enrichment_queue
    FOR SELECT
    USING (true);