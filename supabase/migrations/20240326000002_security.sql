-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.companies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.contacts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.keywords
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.api_keys
    FOR SELECT TO authenticated USING (true);

-- Create policies for jobs
CREATE POLICY "Enable read access for authenticated users" ON public.import_jobs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.export_jobs
    FOR SELECT TO authenticated USING (true);

-- Create policies for queue and limits
CREATE POLICY "Enable read access for authenticated users" ON public.enrichment_queue
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.rate_limits
    FOR SELECT TO authenticated USING (true);