-- Support Tables

-- Import Jobs table
CREATE TABLE public.import_jobs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    row_count INTEGER,
    processed_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT import_jobs_pkey PRIMARY KEY (id)
);

-- Export Jobs table
CREATE TABLE public.export_jobs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    export_type TEXT NOT NULL,
    filters JSONB,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    file_url TEXT,
    row_count INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT export_jobs_pkey PRIMARY KEY (id)
);

-- Enrichment Queue table
CREATE TABLE public.enrichment_queue (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    service TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    last_error TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enrichment_queue_pkey PRIMARY KEY (id)
);

-- Rate Limits table
CREATE TABLE public.rate_limits (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    calls_per_second INTEGER,
    calls_per_minute INTEGER,
    calls_per_hour INTEGER,
    calls_per_day INTEGER,
    current_usage JSONB,
    reset_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rate_limits_pkey PRIMARY KEY (id),
    CONSTRAINT rate_limits_service_endpoint_unique UNIQUE (service, endpoint)
);

-- Create indexes
CREATE INDEX idx_import_jobs_status ON public.import_jobs(status);
CREATE INDEX idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX idx_enrichment_queue_status ON public.enrichment_queue(status, scheduled_for);
CREATE INDEX idx_rate_limits_service ON public.rate_limits(service);

-- Create updated_at triggers
CREATE TRIGGER update_import_jobs_updated_at
    BEFORE UPDATE ON public.import_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_jobs_updated_at
    BEFORE UPDATE ON public.export_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrichment_queue_updated_at
    BEFORE UPDATE ON public.enrichment_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views
CREATE VIEW public.vw_company_contacts AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.industry,
    c.website,
    cnt.id as contact_id,
    cnt.first_name,
    cnt.last_name,
    cnt.email,
    cnt.title,
    cnt.department
FROM public.companies c
LEFT JOIN public.contacts cnt ON c.id = cnt.company_id;

-- Create materialized view for analytics with a unique index
CREATE MATERIALIZED VIEW public.mvw_company_stats AS
SELECT 
    industry,
    COUNT(DISTINCT c.id) as company_count,
    COUNT(DISTINCT cnt.id) as contact_count,
    AVG(c.employee_count_min) as avg_employee_count_min,
    AVG(c.employee_count_max) as avg_employee_count_max
FROM public.companies c
LEFT JOIN public.contacts cnt ON c.id = cnt.company_id
GROUP BY industry;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_mvw_company_stats_industry ON public.mvw_company_stats(industry);

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_company_stats()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mvw_company_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for materialized view refresh
CREATE TRIGGER refresh_company_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON public.companies
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_company_stats();