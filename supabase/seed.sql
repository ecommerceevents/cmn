-- Seed API Keys
INSERT INTO public.api_keys (service, api_key, is_active) VALUES
('apollo', 'dummy_apollo_key', true),
('builtwith', 'dummy_builtwith_key', true),
('scrapin', 'dummy_scrapin_key', true);

-- Seed Companies
INSERT INTO public.companies (
    name, website, industry, employee_count_min, employee_count_max,
    annual_revenue_min, annual_revenue_max, founded_year, linkedin_url,
    description, headquarters_city, headquarters_state, headquarters_country,
    tech_stack
) VALUES
('TechCorp Solutions', 'https://techcorp.com', 'Financial Technology', 100, 500,
 1000000, 5000000, 2015, 'https://linkedin.com/company/techcorp',
 'Leading fintech solutions provider', 'New York', 'NY', 'USA',
 '[{"name": "React", "category": "Frontend"}, {"name": "Node.js", "category": "Backend"}]'::jsonb),

('Capital Ventures', 'https://capitalventures.com', 'Venture Capital', 50, 200,
 10000000, 50000000, 2010, 'https://linkedin.com/company/capitalventures',
 'Innovative venture capital firm', 'San Francisco', 'CA', 'USA',
 '[{"name": "Salesforce", "category": "CRM"}, {"name": "HubSpot", "category": "Marketing"}]'::jsonb),

('LendTech Inc', 'https://lendtech.com', 'Lending', 200, 1000,
 5000000, 20000000, 2012, 'https://linkedin.com/company/lendtech',
 'Digital lending platform', 'Boston', 'MA', 'USA',
 '[{"name": "Python", "category": "Backend"}, {"name": "AWS", "category": "Cloud"}]'::jsonb),

('DataFlow Analytics', 'https://dataflow.ai', 'Data Analytics', 75, 300,
 3000000, 15000000, 2018, 'https://linkedin.com/company/dataflow',
 'AI-powered data analytics platform', 'Austin', 'TX', 'USA',
 '[{"name": "TensorFlow", "category": "AI"}, {"name": "PostgreSQL", "category": "Database"}]'::jsonb),

('BlockChain Solutions', 'https://bcsolutions.io', 'Blockchain', 25, 100,
 500000, 3000000, 2020, 'https://linkedin.com/company/bcsolutions',
 'Enterprise blockchain solutions', 'Miami', 'FL', 'USA',
 '[{"name": "Ethereum", "category": "Blockchain"}, {"name": "Solidity", "category": "Smart Contracts"}]'::jsonb);

-- Seed Contacts
INSERT INTO public.contacts (
    company_id, first_name, last_name, email, phone, title,
    department, linkedin_url, is_verified, verification_date, verification_method
) VALUES
((SELECT id FROM public.companies WHERE name = 'TechCorp Solutions'),
 'John', 'Smith', 'john.smith@techcorp.com', '+1-555-0123',
 'Chief Technology Officer', 'Technology',
 'https://linkedin.com/in/johnsmith', true, CURRENT_TIMESTAMP, 'apollo'),

((SELECT id FROM public.companies WHERE name = 'Capital Ventures'),
 'Sarah', 'Johnson', 'sarah.j@capitalventures.com', '+1-555-0124',
 'Managing Partner', 'Investment',
 'https://linkedin.com/in/sarahjohnson', true, CURRENT_TIMESTAMP, 'apollo'),

((SELECT id FROM public.companies WHERE name = 'LendTech Inc'),
 'Michael', 'Brown', 'michael.b@lendtech.com', '+1-555-0125',
 'Head of Sales', 'Sales',
 'https://linkedin.com/in/michaelbrown', true, CURRENT_TIMESTAMP, 'apollo'),

((SELECT id FROM public.companies WHERE name = 'DataFlow Analytics'),
 'Emily', 'Chen', 'emily.chen@dataflow.ai', '+1-555-0126',
 'Lead Data Scientist', 'Research',
 'https://linkedin.com/in/emilychen', true, CURRENT_TIMESTAMP, 'apollo'),

((SELECT id FROM public.companies WHERE name = 'BlockChain Solutions'),
 'David', 'Kumar', 'david.k@bcsolutions.io', '+1-555-0127',
 'Blockchain Architect', 'Engineering',
 'https://linkedin.com/in/davidkumar', true, CURRENT_TIMESTAMP, 'apollo');

-- Seed Keywords
INSERT INTO public.keywords (keyword, category, is_active, priority) VALUES
('fintech', 'Industry', true, 1),
('lending', 'Product', true, 2),
('capital markets', 'Industry', true, 1),
('investment banking', 'Industry', true, 1),
('venture capital', 'Industry', true, 2),
('blockchain', 'Technology', true, 3),
('artificial intelligence', 'Technology', true, 2),
('machine learning', 'Technology', true, 2),
('data analytics', 'Industry', true, 2),
('cryptocurrency', 'Industry', true, 3);

-- Seed Rate Limits
INSERT INTO public.rate_limits (
    service, endpoint, calls_per_second, calls_per_minute,
    calls_per_hour, calls_per_day
) VALUES
('apollo', '/v1/people/search', 1, 30, 500, 10000),
('apollo', '/v1/organizations/search', 1, 30, 500, 10000),
('builtwith', '/v1/domain', 1, 20, 300, 5000),
('scrapin', '/v1/linkedin/company', 1, 10, 200, 2000),
('scrapin', '/v1/linkedin/profile', 1, 10, 200, 2000);

-- Queue initial enrichment tasks
INSERT INTO public.enrichment_queue (
    entity_type, entity_id, service, priority, status
) 
SELECT 'company', id, service, 1, 'pending'
FROM public.companies
CROSS JOIN (
    SELECT unnest(ARRAY['apollo', 'builtwith', 'scrapin']) as service
) services;