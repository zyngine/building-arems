-- EMS Building Naming Rights Schema
-- Run this in the Supabase SQL Editor or via supabase db push

-- ============================================================
-- ROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bay', 'office', 'common', 'utility', 'bedroom', 'corridor')),
  description text,
  price integer NOT NULL,
  coordinates jsonb NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rooms_sort_order ON rooms (sort_order);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_public" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert_service" ON rooms FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "rooms_update_service" ON rooms FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "rooms_delete_service" ON rooms FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================
-- DONATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid UNIQUE NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  dedication_text text,
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'sold')),
  donor_phone text,
  donor_email text,
  donor_address text,
  pledge_amount integer,
  payment_method text CHECK (payment_method IN ('cash', 'check', 'credit', 'pledge_card', 'other')),
  internal_notes text,
  donated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

CREATE INDEX idx_donations_room_id ON donations (room_id);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donations_select_public" ON donations FOR SELECT USING (true);
CREATE POLICY "donations_insert_service" ON donations FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "donations_update_service" ON donations FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "donations_delete_service" ON donations FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================
-- CAMPAIGN SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text DEFAULT 'Capital Campaign',
  campaign_goal integer,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_settings_select_public" ON campaign_settings FOR SELECT USING (true);
CREATE POLICY "campaign_settings_update_service" ON campaign_settings FOR UPDATE USING (auth.role() = 'service_role');

INSERT INTO campaign_settings (campaign_name, is_active) VALUES ('AREMS Capital Campaign', true);

-- ============================================================
-- ENABLE REALTIME ON DONATIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
