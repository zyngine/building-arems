-- Seed rooms for AREMS Building Naming Rights
-- Coordinates are percentage-based (x, y, width, height) relative to the blueprint image.
-- These are initial estimates and may need visual adjustment.
-- Prices are in cents.

-- ============================================================
-- UPDATE CAMPAIGN GOAL ($2,000,000 = 200000000 cents)
-- ============================================================
UPDATE campaign_settings SET campaign_goal = 200000000;

-- ============================================================
-- BUNK ROOMS (10 total @ $25,000 each)
-- 6 across the top row, 4 down the left side
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('bunk-1', 'Bunk Room 1', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 3.5, "y": 8, "width": 4, "height": 8}', 10),
  ('bunk-2', 'Bunk Room 2', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 8, "y": 8, "width": 4, "height": 8}', 11),
  ('bunk-3', 'Bunk Room 3', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 12.5, "y": 8, "width": 4, "height": 8}', 12),
  ('bunk-4', 'Bunk Room 4', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 17, "y": 8, "width": 4, "height": 8}', 13),
  ('bunk-5', 'Bunk Room 5', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 21.5, "y": 8, "width": 4, "height": 8}', 14),
  ('bunk-6', 'Bunk Room 6', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 26, "y": 8, "width": 4, "height": 8}', 15),
  ('bunk-7', 'Bunk Room 7', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 3, "y": 30, "width": 5.5, "height": 7}', 16),
  ('bunk-8', 'Bunk Room 8', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 3, "y": 38, "width": 5.5, "height": 7}', 17),
  ('bunk-9', 'Bunk Room 9', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 3, "y": 46, "width": 5.5, "height": 7}', 18),
  ('bunk-10', 'Bunk Room 10', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 3, "y": 54, "width": 5.5, "height": 7}', 19);

-- ============================================================
-- APPARATUS BAYS (6 total @ $50,000 each)
-- Side-by-side bays in the large central area
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('bay-1', 'Apparatus Bay 1', 'bay', 'Primary apparatus storage bay', 5000000, '{"x": 23, "y": 30, "width": 3.2, "height": 46}', 1),
  ('bay-2', 'Apparatus Bay 2', 'bay', 'Apparatus storage bay', 5000000, '{"x": 26.2, "y": 30, "width": 3.2, "height": 46}', 2),
  ('bay-3', 'Apparatus Bay 3', 'bay', 'Apparatus storage bay', 5000000, '{"x": 29.4, "y": 30, "width": 3.2, "height": 46}', 3),
  ('bay-4', 'Apparatus Bay 4', 'bay', 'Apparatus storage bay', 5000000, '{"x": 32.6, "y": 30, "width": 3.2, "height": 46}', 4),
  ('bay-5', 'Apparatus Bay 5', 'bay', 'Apparatus storage bay', 5000000, '{"x": 35.8, "y": 30, "width": 3.2, "height": 46}', 5),
  ('bay-6', 'Apparatus Bay 6', 'bay', 'Apparatus storage bay', 5000000, '{"x": 39, "y": 30, "width": 3.2, "height": 46}', 6);

-- ============================================================
-- KITCHENS (2 total @ $100,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('kitchen-1', 'Kitchen (West Wing)', 'common', 'Full crew kitchen in the west wing', 10000000, '{"x": 10, "y": 19, "width": 10, "height": 10}', 20),
  ('kitchen-2', 'Kitchen (East Wing)', 'common', 'Full crew kitchen in the east wing', 10000000, '{"x": 66, "y": 9, "width": 9, "height": 10}', 21);

-- ============================================================
-- MEETING ROOM (1 @ $250,000)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('meeting-room', 'Meeting Room', 'common', 'Large conference and meeting room for training and community events', 25000000, '{"x": 60, "y": 22, "width": 13, "height": 16}', 22);

-- ============================================================
-- DAY ROOM (1 @ $250,000)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('day-room', 'Day Room', 'common', 'Crew day room for rest and recreation', 25000000, '{"x": 10, "y": 38, "width": 12, "height": 18}', 23);

-- ============================================================
-- OFFICES (8 total @ $10,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('office-1', 'Office 1', 'office', 'Administrative office', 1000000, '{"x": 78, "y": 9, "width": 5, "height": 10}', 30),
  ('office-2', 'Office 2', 'office', 'Administrative office', 1000000, '{"x": 10, "y": 64, "width": 8, "height": 8}', 31),
  ('office-3', 'Office 3', 'office', 'Administrative office', 1000000, '{"x": 48, "y": 70, "width": 6, "height": 8}', 32),
  ('office-4', 'Office 4', 'office', 'Administrative office', 1000000, '{"x": 54, "y": 70, "width": 6, "height": 8}', 33),
  ('office-5', 'Office 5', 'office', 'Administrative office', 1000000, '{"x": 60, "y": 70, "width": 6, "height": 8}', 34),
  ('office-6', 'Office 6', 'office', 'Administrative office', 1000000, '{"x": 66, "y": 70, "width": 6, "height": 8}', 35),
  ('office-7', 'Office 7', 'office', 'Administrative office', 1000000, '{"x": 74, "y": 45, "width": 6, "height": 9}', 36),
  ('office-8', 'Office 8', 'office', 'Administrative office', 1000000, '{"x": 74, "y": 55, "width": 6, "height": 9}', 37);

-- ============================================================
-- HALLWAYS (2 total @ $50,000 each)
-- Type "common" (not "corridor") since these are naming opportunities
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('hallway-west', 'West Wing Hallway', 'common', 'Main hallway connecting the west wing living quarters', 5000000, '{"x": 8, "y": 17, "width": 14, "height": 3}', 40),
  ('hallway-east', 'East Wing Hallway', 'common', 'Main hallway connecting the east wing offices and meeting areas', 5000000, '{"x": 46, "y": 17, "width": 32, "height": 3}', 41);

-- ============================================================
-- FLAG PLAZA (1 @ $25,000)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('flag-plaza', 'Flag Plaza', 'common', 'Outdoor flag display and memorial plaza at the station entrance', 2500000, '{"x": 78, "y": 72, "width": 6, "height": 8}', 42);

-- ============================================================
-- UTILITY ROOMS (9 total @ $5,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('storage-1', 'Storage Room 1', 'utility', 'General storage', 500000, '{"x": 3, "y": 19, "width": 5.5, "height": 8}', 50),
  ('storage-2', 'Storage Room 2', 'utility', 'General storage', 500000, '{"x": 3, "y": 70, "width": 5.5, "height": 8}', 51),
  ('daily-supply-1', 'Daily Supply 1', 'utility', 'Daily supplies storage', 500000, '{"x": 37, "y": 9, "width": 5.5, "height": 9}', 52),
  ('daily-supply-2', 'Daily Supply 2', 'utility', 'Daily supplies storage', 500000, '{"x": 42.5, "y": 9, "width": 5.5, "height": 9}', 53),
  ('oxygen-storage', 'Oxygen Storage', 'utility', 'Medical oxygen equipment storage', 500000, '{"x": 49, "y": 9, "width": 6, "height": 9}', 54),
  ('mechanical', 'Mechanical Room', 'utility', 'HVAC and mechanical systems', 500000, '{"x": 56, "y": 9, "width": 7, "height": 9}', 55),
  ('supply-room', 'Supply Room', 'utility', 'General supply storage', 500000, '{"x": 48, "y": 24, "width": 6, "height": 8}', 56),
  ('office-supply', 'Office Supply Room', 'utility', 'Office supplies and equipment', 500000, '{"x": 54, "y": 24, "width": 5, "height": 8}', 57),
  ('laundry', 'Laundry Room', 'utility', 'Crew laundry facilities', 500000, '{"x": 3, "y": 62, "width": 5.5, "height": 7}', 58);
