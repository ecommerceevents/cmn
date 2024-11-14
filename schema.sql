-- Users and Authentication
CREATE TABLE public.cmn_users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK (role IN ('admin', 'user', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_users_pkey PRIMARY KEY (id)
);

-- User Sessions
CREATE TABLE public.cmn_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.cmn_users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_sessions_pkey PRIMARY KEY (id)
);

-- User Activity Log
CREATE TABLE public.cmn_user_activity (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.cmn_users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_user_activity_pkey PRIMARY KEY (id)
);

-- Data Import Jobs
CREATE TABLE public.cmn_import_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.cmn_users(id),
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    row_count INTEGER,
    processed_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_import_jobs_pkey PRIMARY KEY (id)
);

-- Data Export Jobs
CREATE TABLE public.cmn_export_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.cmn_users(id),
    export_type TEXT NOT NULL,
    filters JSONB,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    file_url TEXT,
    row_count INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_export_jobs_pkey PRIMARY KEY (id)
);

-- Data Enrichment Queue
CREATE TABLE public.cmn_enrichment_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    service TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    last_error TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_enrichment_queue_pkey PRIMARY KEY (id)
);

-- API Rate Limits
CREATE TABLE public.cmn_rate_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    service TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    calls_per_second INTEGER,
    calls_per_minute INTEGER,
    calls_per_hour INTEGER,
    calls_per_day INTEGER,
    current_usage JSONB,
    reset_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_rate_limits_pkey PRIMARY KEY (id),
    CONSTRAINT cmn_rate_limits_service_endpoint_unique UNIQUE (service, endpoint)
);

-- Webhook Configurations
CREATE TABLE public.cmn_webhooks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    secret_key TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_webhooks_pkey PRIMARY KEY (id)
);

-- Webhook Delivery Log
CREATE TABLE public.cmn_webhook_deliveries (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES public.cmn_webhooks(id),
    event TEXT NOT NULL,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempt_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_webhook_deliveries_pkey PRIMARY KEY (id)
);

-- System Settings
CREATE TABLE public.cmn_system_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT cmn_system_settings_pkey PRIMARY KEY (id)
);

-- Create additional indexes
CREATE INDEX idx_cmn_users_email ON public.cmn_users(email);
CREATE INDEX idx_cmn_sessions_token ON public.cmn_sessions(token);
CREATE INDEX idx_cmn_sessions_user_id ON public.cmn_sessions(user_id);
CREATE INDEX idx_cmn_user_activity_user_id ON public.cmn_user_activity(user_id);
CREATE INDEX idx_cmn_import_jobs_user_id ON public.cmn_import_jobs(user_id);
CREATE INDEX idx_cmn_export_jobs_user_id ON public.cmn_export_jobs(user_id);
CREATE INDEX idx_cmn_enrichment_queue_status ON public.cmn_enrichment_queue(status, scheduled_for);
CREATE INDEX idx_cmn_webhook_deliveries_webhook_id ON public.cmn_webhook_deliveries(webhook_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_cmn_users_updated_at
    BEFORE UPDATE ON public.cmn_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_import_jobs_updated_at
    BEFORE UPDATE ON public.cmn_import_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_export_jobs_updated_at
    BEFORE UPDATE ON public.cmn_export_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_enrichment_queue_updated_at
    BEFORE UPDATE ON public.cmn_enrichment_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_rate_limits_updated_at
    BEFORE UPDATE ON public.cmn_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_webhooks_updated_at
    BEFORE UPDATE ON public.cmn_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cmn_system_settings_updated_at
    BEFORE UPDATE ON public.cmn_system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();