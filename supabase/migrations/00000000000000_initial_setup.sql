-- Drop existing schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Core Tables

-- Companies table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    employee_count_min INTEGER,
    employee_count_max INTEGER,
    annual_revenue_min NUMERIC,
    annual_revenue_max NUMERIC,
    founded_year INTEGER,
    linkedin_url TEXT,
    twitter_url TEXT,
    facebook_url TEXT,
    description TEXT,
    logo_url TEXT,
    headquarters_address TEXT,
    headquarters_city TEXT,
    headquarters_state TEXT,
    headquarters_country TEXT,
    headquarters_postal_code TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    funding_rounds JSONB DEFAULT '[]'::jsonb,
    last_enrichment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    title TEXT,
    department TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_method TEXT,
    last_enrichment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Keywords table
CREATE TABLE public.keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT keywords_keyword_unique UNIQUE (keyword)
);

-- API Keys table
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT api_keys_service_unique UNIQUE (service)
);

-- Import Jobs table
CREATE TABLE public.import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Export Jobs table
CREATE TABLE public.export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_type TEXT NOT NULL,
    filters JSONB,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    file_url TEXT,
    row_count INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enrichment Queue table
CREATE TABLE public.enrichment_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rate Limits table
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    calls_per_second INTEGER,
    calls_per_minute INTEGER,
    calls_per_hour INTEGER,
    calls_per_day INTEGER,
    current_usage JSONB DEFAULT '{"current_minute": 0, "current_hour": 0, "current_day": 0}'::jsonb,
    reset_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rate_limits_service_endpoint_unique UNIQUE (service, endpoint)
);

-- Create indexes
CREATE INDEX idx_companies_website ON public.companies(website);
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_companies_industry ON public.companies(industry);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_contacts_name ON public.contacts(last_name, first_name);
CREATE INDEX idx_keywords_keyword ON public.keywords(keyword);
CREATE INDEX idx_keywords_category ON public.keywords(category);
CREATE INDEX idx_enrichment_queue_status ON public.enrichment_queue(status, scheduled_for);
CREATE INDEX idx_rate_limits_service ON public.rate_limits(service);

-- Create updated_at triggers
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at
    BEFORE UPDATE ON public.keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Create materialized view for analytics
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

-- Enable RLS
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