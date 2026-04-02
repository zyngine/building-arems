-- Seed rooms for AREMS Building Naming Rights
-- Coordinates match floorplan-v4.html SVG layout (x, y, width, height in SVG units)
-- Prices are in cents.

-- ============================================================
-- UPDATE CAMPAIGN GOAL ($2,000,000 = 200000000 cents)
-- ============================================================
UPDATE campaign_settings SET campaign_goal = 200000000;

-- ============================================================
-- BUNK ROOMS (10 total @ $25,000 each)
-- 6 across the top row, 4 down the left column
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('bunk-1',  'Bunk Room 1',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 0, "y": 0, "w": 42, "h": 48}', 10),
  ('bunk-2',  'Bunk Room 2',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 42, "y": 0, "w": 42, "h": 48}', 11),
  ('bunk-3',  'Bunk Room 3',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 84, "y": 0, "w": 42, "h": 48}', 12),
  ('bunk-4',  'Bunk Room 4',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 126, "y": 0, "w": 42, "h": 48}', 13),
  ('bunk-5',  'Bunk Room 5',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 168, "y": 0, "w": 42, "h": 48}', 14),
  ('bunk-6',  'Bunk Room 6',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 210, "y": 0, "w": 40, "h": 48}', 15),
  ('bunk-7',  'Bunk Room 7',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 0, "y": 78, "w": 52, "h": 46}', 16),
  ('bunk-8',  'Bunk Room 8',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 0, "y": 124, "w": 52, "h": 45}', 17),
  ('bunk-9',  'Bunk Room 9',  'bedroom', 'Individual crew bunk room', 2500000, '{"x": 0, "y": 169, "w": 52, "h": 46}', 18),
  ('bunk-10', 'Bunk Room 10', 'bedroom', 'Individual crew bunk room', 2500000, '{"x": 0, "y": 215, "w": 52, "h": 45}', 19);

-- ============================================================
-- APPARATUS BAYS (6 naming sections @ $50,000 each)
-- Bay 1 & 2: pull-through, each split into 2 sections (top/bottom)
-- Bay 3 & 4: single-entry (behind Daily Supply rooms)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('bay-1a', 'Bay 1A', 'bay', 'Pull-through apparatus bay (north half)', 5000000, '{"x": 250, "y": 0, "w": 94, "h": 130}', 1),
  ('bay-1b', 'Bay 1B', 'bay', 'Pull-through apparatus bay (south half)', 5000000, '{"x": 250, "y": 130, "w": 94, "h": 130}', 2),
  ('bay-2a', 'Bay 2A', 'bay', 'Pull-through apparatus bay (north half)', 5000000, '{"x": 344, "y": 0, "w": 93, "h": 130}', 3),
  ('bay-2b', 'Bay 2B', 'bay', 'Pull-through apparatus bay (south half)', 5000000, '{"x": 344, "y": 130, "w": 93, "h": 130}', 4),
  ('bay-3',  'Bay 3',  'bay', 'Single-entry apparatus bay', 5000000, '{"x": 437, "y": 84, "w": 94, "h": 176}', 5),
  ('bay-4',  'Bay 4',  'bay', 'Single-entry apparatus bay', 5000000, '{"x": 531, "y": 84, "w": 94, "h": 176}', 6);

-- ============================================================
-- KITCHENS (2 total @ $100,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('kitchen-west', 'Kitchen (West)', 'common', 'Full crew kitchen in the living quarters', 10000000, '{"x": 115, "y": 58, "w": 135, "h": 50}', 20),
  ('kitchen-2',    'Kitchen 2',      'common', 'Kitchen in the admin wing',                10000000, '{"x": 830, "y": 0, "w": 50, "h": 50}', 21);

-- ============================================================
-- MEETING ROOM & DAY ROOM (@ $250,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('day-room',     'Day Room',     'common', 'Crew day room for rest and recreation',           25000000, '{"x": 115, "y": 108, "w": 135, "h": 152}', 22),
  ('meeting-room', 'Meeting Room', 'common', 'Conference room for training and community events', 25000000, '{"x": 757, "y": 62, "w": 111, "h": 113}', 23);

-- ============================================================
-- OFFICES (8 total @ $10,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('office-1', 'Office 1', 'office', 'Administrative office', 1000000, '{"x": 65, "y": 240, "w": 50, "h": 20}', 30),
  ('office-2', 'Office 2', 'office', 'Administrative office', 1000000, '{"x": 880, "y": 0, "w": 50, "h": 50}', 31),
  ('office-3', 'Office 3', 'office', 'Administrative office', 1000000, '{"x": 880, "y": 50, "w": 50, "h": 55}', 32),
  ('office-4', 'Office 4', 'office', 'Administrative office', 1000000, '{"x": 880, "y": 105, "w": 50, "h": 55}', 33),
  ('office-5', 'Office 5', 'office', 'Administrative office', 1000000, '{"x": 625, "y": 200, "w": 60, "h": 60}', 34),
  ('office-6', 'Office 6', 'office', 'Administrative office', 1000000, '{"x": 685, "y": 200, "w": 60, "h": 60}', 35),
  ('office-7', 'Office 7', 'office', 'Administrative office', 1000000, '{"x": 745, "y": 200, "w": 60, "h": 60}', 36),
  ('office-8', 'Office 8', 'office', 'Administrative office', 1000000, '{"x": 805, "y": 200, "w": 60, "h": 60}', 37);

-- ============================================================
-- HALLWAYS (2 total @ $50,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('hallway-west', 'West Hallway', 'common', 'Main hallway connecting the living quarters', 5000000, '{"x": 0, "y": 48, "w": 250, "h": 10}', 40),
  ('hallway-east', 'East Hallway', 'common', 'Horseshoe corridor connecting admin wing offices', 5000000, '{"x": 625, "y": 175, "w": 305, "h": 15}', 41);

-- ============================================================
-- FLAG PLAZA (1 @ $25,000)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('flag-plaza', 'Flag Plaza', 'common', 'Outdoor flag display and memorial plaza at the station entrance', 2500000, '{"x": 875, "y": 265, "w": 48, "h": 28}', 42);

-- ============================================================
-- UTILITY ROOMS (9 total @ $5,000 each)
-- ============================================================
INSERT INTO rooms (slug, name, type, description, price, coordinates, sort_order) VALUES
  ('storage-1',      'Storage 1',      'utility', 'General storage',                   500000, '{"x": 0, "y": 58, "w": 52, "h": 20}', 50),
  ('storage-2',      'Storage 2',      'utility', 'General storage',                   500000, '{"x": 65, "y": 192, "w": 50, "h": 28}', 51),
  ('daily-supply-1', 'Daily Supply 1', 'utility', 'Daily supplies storage',            500000, '{"x": 437, "y": 0, "w": 94, "h": 84}', 52),
  ('daily-supply-2', 'Daily Supply 2', 'utility', 'Daily supplies storage',            500000, '{"x": 531, "y": 0, "w": 94, "h": 84}', 53),
  ('oxygen-storage', 'Oxygen Storage', 'utility', 'Medical oxygen equipment storage',  500000, '{"x": 625, "y": 0, "w": 100, "h": 50}', 54),
  ('mechanical',     'Mechanical',     'utility', 'HVAC and mechanical systems',       500000, '{"x": 725, "y": 0, "w": 105, "h": 50}', 55),
  ('supply-room',    'Supply Room',    'utility', 'General supply storage',            500000, '{"x": 637, "y": 62, "w": 58, "h": 56}', 56),
  ('office-supply',  'Office Supply',  'utility', 'Office supplies and equipment',     500000, '{"x": 695, "y": 62, "w": 62, "h": 56}', 57),
  ('laundry',        'Laundry',        'utility', 'Crew laundry facilities',           500000, '{"x": 65, "y": 220, "w": 50, "h": 20}', 58);
