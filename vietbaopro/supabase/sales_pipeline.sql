-- ============================================
-- SALES PIPELINE & EMAIL AUTOMATION SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CUSTOMER EVENTS - Tracking all user interactions
CREATE TABLE IF NOT EXISTS public.customer_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'resource_download', 'checkout_view', 'checkout_abandon', 'purchase', 'login'
    event_data JSONB DEFAULT '{}', -- metadata: course_id, resource_id, page_url, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMER PIPELINE - Sales funnel tracking
CREATE TABLE IF NOT EXISTS public.customer_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT,
    phone TEXT,
    stage TEXT DEFAULT 'visitor' CHECK (stage IN ('visitor', 'lead', 'prospect', 'hot_lead', 'customer', 'repeat_customer')),
    source TEXT, -- 'organic', 'facebook', 'google', 'referral'
    tags TEXT[] DEFAULT '{}', -- ['free_resource_x', 'interested_course_y']
    notes TEXT,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMAIL SEQUENCES - Define automation sequences
CREATE TABLE IF NOT EXISTS public.email_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL, -- 'resource_download', 'checkout_abandon', 'purchase'
    trigger_filter JSONB DEFAULT '{}', -- Optional filter: {"resource_id": "xxx"} or {"course_id": "xxx"}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EMAIL SEQUENCE STEPS - Individual emails in a sequence
CREATE TABLE IF NOT EXISTS public.email_sequence_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE NOT NULL,
    step_order INTEGER NOT NULL,
    delay_hours INTEGER DEFAULT 0, -- Hours to wait before sending
    subject TEXT NOT NULL,
    content TEXT NOT NULL, -- HTML template with variables: {{name}}, {{course_name}}, {{resource_name}}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMAIL QUEUE - Scheduled emails waiting to be sent
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE,
    step_id UUID REFERENCES public.email_sequence_steps(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}', -- Store context: course_name, resource_name, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customer_events_email ON public.customer_events(email);
CREATE INDEX IF NOT EXISTS idx_customer_events_type ON public.customer_events(event_type);
CREATE INDEX IF NOT EXISTS idx_customer_events_created ON public.customer_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_pipeline_stage ON public.customer_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_customer_pipeline_email ON public.customer_pipeline(email);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.email_queue(scheduled_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access on customer_events"
    ON public.customer_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access on customer_pipeline"
    ON public.customer_pipeline FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access on email_sequences"
    ON public.email_sequences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access on email_sequence_steps"
    ON public.email_sequence_steps FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin full access on email_queue"
    ON public.email_queue FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service role can insert events (for API)
CREATE POLICY "Service can insert events"
    ON public.customer_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service can insert/update pipeline"
    ON public.customer_pipeline FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service can update pipeline"
    ON public.customer_pipeline FOR UPDATE
    USING (true);

-- ============================================
-- SAMPLE DATA - Default Email Sequences
-- ============================================

-- Welcome Nurture Sequence
INSERT INTO public.email_sequences (name, description, trigger_event, is_active)
VALUES (
    'Welcome Nurture',
    'Chuỗi email chào mừng và nuôi dưỡng khách hàng sau khi tải tài nguyên miễn phí',
    'resource_download',
    true
) ON CONFLICT DO NOTHING;

-- Cart Abandonment Sequence
INSERT INTO public.email_sequences (name, description, trigger_event, is_active)
VALUES (
    'Cart Abandonment',
    'Nhắc nhở khách hàng hoàn tất thanh toán',
    'checkout_abandon',
    true
) ON CONFLICT DO NOTHING;

-- Post-Purchase Cross-sell Sequence
INSERT INTO public.email_sequences (name, description, trigger_event, is_active)
VALUES (
    'Post-Purchase Cross-sell',
    'Giới thiệu sản phẩm liên quan sau khi mua hàng',
    'purchase',
    true
) ON CONFLICT DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
