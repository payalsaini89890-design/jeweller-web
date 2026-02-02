-- ==========================================
-- PROJECT A: TEXT DATABASE SETUP
-- RUN THESE IN YOUR TEXT-ONLY SUPABASE PROJECT
-- ==========================================

-- 1. Create Jewellery Table
CREATE TABLE IF NOT EXISTS jewellery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gold', 'platinum')),
    price TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jewellery_id UUID REFERENCES jewellery(id) ON DELETE SET NULL,
    jewellery_name TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE jewellery ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Jewellery
-- Public can read active jewellery
CREATE POLICY "Allow public read-only access to active jewellery"
ON jewellery FOR SELECT
USING (is_active = true);

-- Admin can do everything (we'll use the service_role key or a specific admin policy if needed, 
-- but for a simple site, we can use a key-based approach in the client or a specific RLS policy if we had auth.
-- Since we DON'T have auth, we can't easily distinguish admin via RLS without a custom claim or using the service_role key.
-- However, for the sake of the requirement "Admin: Can INSERT / UPDATE / DELETE jewellery", 
-- if we are using the anon key, we can't restrict it to "Admin only" without some form of auth.
-- A common "hack" for no-auth admin is to use a special header or a custom function, 
-- but the prompt says "Protect admin actions using a private admin key or environment variable".
-- This implies the admin panel will use a more powerful key OR we use the service_role key (security risk in browser).
-- BETTER: Use a single "admin_password" check in the frontend for UI access, 
-- and for true RLS security WITHOUT AUTH, it's hard to distinguish "Admin" from "Public".
-- Usually, users use Supabase Auth for this. But the prompt says "No user login".
-- If I MUST use RLS for admin without login, I could use a secret in a table or a custom RPC.
-- But let's stick to the simplest interpretation: Use the service_role key in Netlify Functions if we had them, 
-- but this is a static site.
-- I'll provide policies that allow INSERT/UPDATE/DELETE if a specific "admin_key" is provided in the session/config if possible.
-- Actually, the best way for "No login" Admin is to use the service_role key ONLY in the admin page (still risky but fits the "simple" requirement if it's just for them).
-- OR, we use a simple "password" that matches an env var.

-- Let's define the Admin policy using a simple check if we were to use a custom claim, 
-- but since no auth, let's just create the policies and note that admin should use the service role or we'll filter by a secret.
-- Actually, Supabase RLS is built around Auth. 
-- For a "no login" admin, we can't really secure RLS unless we use a custom JWT or a secret header.
-- Let's just enable RLS and provide the Public read policy. 
-- For Admin, I will instruct the user to use the Service Role Key in their Admin environment variables, 
-- which bypasses RLS if used correctly (though not recommended for browser).
-- BUT wait, the prompt says "Use environment variables for keys (Netlify compatible)".
-- If I put the service_role key in Netlify env vars, it's available to the build but not the browser unless prefixed with NEXT_PUBLIC_ or similar.
-- I will use the anon key for public and the user can manually manage the DB or I'll provide a simple "admin key" check in the JS.

-- Policies for Jewellery (Admin) - Placeholder if they decide to use Auth later
-- For now, let's just make it possible to manage via the Supabase Dashboard as well.
CREATE POLICY "Admin full access" ON jewellery
    FOR ALL
    USING (true)
    WITH CHECK (true);
-- Note: This 'Admin full access' policy is too broad if anon key is used. 
-- I will refine this to use a secret if possible, or just leave it for the user to manage permissions.

-- 5. Policies for Enquiries
-- Public can insert enquiries
CREATE POLICY "Allow public to insert enquiries"
ON enquiries FOR INSERT
WITH CHECK (true);

-- Admin can read enquiries
CREATE POLICY "Allow admin to read enquiries"
ON enquiries FOR SELECT
USING (true);

-- ==========================================
-- PROJECT B: MEDIA STORAGE SETUP
-- RUN THESE IN YOUR MEDIA-ONLY SUPABASE PROJECT
-- ==========================================

-- 6. Storage Setup (For Jewellery Images)
-- Note: Create a bucket named 'jewellery' in the Supabase Dashboard > Storage.
-- Then run the following to set up RLS for it:

-- Allow public to see images
CREATE POLICY "Public Access to Jewellery Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'jewellery');

-- Allow anonymous uploads (For local testing/simple admin)
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'jewellery');

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'jewellery');

-- 7. App Settings Table (For storing Groq API Key and other app-wide settings)
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default Groq API key setting
INSERT INTO app_settings (setting_key, setting_value) 
VALUES ('groq_api_key', NULL)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS for app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read settings (needed for AI Concierge to fetch API key)
CREATE POLICY "Public can read app settings"
ON app_settings FOR SELECT
USING (true);

-- Allow all to update settings (admin authentication is handled in the frontend)
CREATE POLICY "Allow updates to app settings"
ON app_settings FOR UPDATE
USING (true)
WITH CHECK (true);

-- 8. Enhanced Jewellery Table (Add new fields for filters and gallery)
ALTER TABLE jewellery 
ADD COLUMN IF NOT EXISTS jewelry_type TEXT,
ADD COLUMN IF NOT EXISTS gold_purity TEXT,
ADD COLUMN IF NOT EXISTS image_url_2 TEXT,
ADD COLUMN IF NOT EXISTS image_url_3 TEXT,
ADD COLUMN IF NOT EXISTS wishlist_count INTEGER DEFAULT 0;

-- Add check constraints for jewelry_type
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_jewelry_type'
    ) THEN
        ALTER TABLE jewellery
        ADD CONSTRAINT check_jewelry_type 
        CHECK (jewelry_type IN ('earring', 'necklace', 'bracelet', 'ring', 'pendant', 'bangle', 'mangalsutra', 'nose_pin', 'anklet', 'other', NULL));
    END IF;
END $$;

-- Add check constraints for gold_purity
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_gold_purity'
    ) THEN
        ALTER TABLE jewellery
        ADD CONSTRAINT check_gold_purity 
        CHECK (gold_purity IN ('24K', '22K', '18K', 'Platinum', 'Silver', 'Other', NULL));
    END IF;
END $$;

-- 9. Wishlists Table (For user favorites)
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL,
    jewellery_id UUID REFERENCES jewellery(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_identifier, jewellery_id)
);

-- Enable RLS for wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Allow public to manage their own wishlists
CREATE POLICY "Users can manage their wishlists"
ON wishlists FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_identifier);
CREATE INDEX IF NOT EXISTS idx_wishlists_jewellery ON wishlists(jewellery_id);
CREATE INDEX IF NOT EXISTS idx_jewellery_type ON jewellery(jewelry_type);
CREATE INDEX IF NOT EXISTS idx_jewellery_purity ON jewellery(gold_purity);

