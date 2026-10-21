-- Add a manual adjustment to campaign_settings so the total raised can be
-- edited independently of room donations (offline gifts, general donations,
-- corrections, etc.). Stored in cents, like all other money columns.

ALTER TABLE campaign_settings
  ADD COLUMN IF NOT EXISTS manual_adjustment integer NOT NULL DEFAULT 0;
