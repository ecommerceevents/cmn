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
    CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- Contacts table
CREATE TABLE public.contacts (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id),
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
    CONSTRAINT contacts_pkey PRIMARY KEY (id)
);

-- Keywords table
CREATE TABLE public.keywords (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT keywords_pkey PRIMARY KEY (id),
    CONSTRAINT keywords_keyword_unique UNIQUE (keyword)
);

-- API Keys table
CREATE TABLE public.api_keys (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT api_keys_pkey PRIMARY KEY (id),
    CONSTRAINT api_keys_service_unique UNIQUE (service)
);

-- Create indexes
CREATE INDEX idx_companies_website ON public.companies(website);
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_keywords_keyword ON public.keywords(keyword);

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