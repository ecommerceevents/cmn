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

-- Lenders table (from existing schema)
CREATE TABLE public.cmn_lenders (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    firm_name TEXT,
    contact TEXT,
    website TEXT,
    description TEXT,
    finders_fee_agreement BOOLEAN,
    address TEXT,
    address_street_1 TEXT,
    address_street_2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    phone TEXT,
    fax TEXT,
    company_email_1 TEXT,
    company_email_2 TEXT,
    networks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cmn_lenders_pkey PRIMARY KEY (id)
);

-- Companies table
CREATE TABLE public.cmn_companies (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
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
    tech_stack JSONB,
    funding_rounds JSONB,
    last_enrichment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cmn_companies_pkey PRIMARY KEY (id)
);

-- Contacts table
CREATE TABLE public.cmn_contacts (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.cmn_companies(id),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cmn_contacts_pkey PRIMARY KEY (id)
);

-- Keywords table
CREATE TABLE public.cmn_keywords (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cmn_keywords_pkey PRIMARY KEY (id),
    CONSTRAINT cmn_keywords_keyword_unique UNIQUE (keyword)
);

-- API Keys table
CREATE TABLE public.cmn_api_keys (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cmn_api_keys_pkey PRIMARY KEY (id),
    CONSTRAINT cmn_api_keys_service_unique UNIQUE (service)
);

-- Create indexes
CREATE INDEX idx_cmn_lenders_website ON public.cmn_lenders(website);
CREATE INDEX idx_cmn_companies_website ON public.cmn_companies(website);
CREATE INDEX idx_cmn_companies_name ON public.cmn_companies(name);
CREATE INDEX idx_cmn_contacts_email ON public.cmn_contacts(email);
CREATE INDEX idx_cmn_contacts_company_id ON public.cmn_contacts(company_id);
CREATE INDEX idx_cmn_keywords_keyword ON public.cmn_keywords(keyword);

-- Create updated_at triggers
CREATE TRIGGER update_cmn_lenders_updated_at
    BEFORE UPDATE ON public.cmn_lenders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_companies_updated_at
    BEFORE UPDATE ON public.cmn_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_contacts_updated_at
    BEFORE UPDATE ON public.cmn_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_keywords_updated_at
    BEFORE UPDATE ON public.cmn_keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_api_keys_updated_at
    BEFORE UPDATE ON public.cmn_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.cmn_lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmn_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmn_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmn_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cmn_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.cmn_lenders
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.cmn_companies
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.cmn_contacts
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.cmn_keywords
    FOR SELECT
    TO authenticated
    USING (true);

-- Create views for common queries
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
FROM public.cmn_companies c
LEFT JOIN public.cmn_contacts cnt ON c.id = cnt.company_id;

-- Create materialized view for company statistics
CREATE MATERIALIZED VIEW public.mvw_company_stats AS
SELECT 
    c.industry,
    COUNT(DISTINCT c.id) as company_count,
    COUNT(DISTINCT cnt.id) as contact_count,
    AVG(c.employee_count_min) as avg_employee_count_min,
    AVG(c.employee_count_max) as avg_employee_count_max
FROM public.cmn_companies c
LEFT JOIN public.cmn_contacts cnt ON c.id = cnt.company_id
GROUP BY c.industry;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_company_stats()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mvw_company_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view
CREATE TRIGGER refresh_company_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON public.cmn_companies
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_company_stats();