-- ============================================================
-- UNITY GUILDS — DATABASE SCHEMA
-- Run this in the Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- Stores Discord-authenticated users with their guild and role
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'newsletter_team', 'mentor', 'community_specialist', 'twitch_staff', 'super_admin')),
  discord_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_guild ON users(guild);

-- ============================================================
-- NEWSLETTERS TABLE
-- Weekly newsletter posts per guild
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  issue_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  author_id UUID REFERENCES users(id),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild, issue_number)
);

CREATE INDEX idx_newsletters_guild ON newsletters(guild);
CREATE INDEX idx_newsletters_published ON newsletters(published);

-- ============================================================
-- EVENTS TABLE
-- Guild events with calendar integration
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  calendar_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_guild ON events(guild);
CREATE INDEX idx_events_date ON events(event_date);

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- Guild announcements with pinning support
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT DEFAULT '📣',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_guild ON announcements(guild);

-- ============================================================
-- SPOTLIGHT TABLE
-- Weekly guildie spotlight features
-- ============================================================
CREATE TABLE IF NOT EXISTS spotlight (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  member_name TEXT NOT NULL,
  member_handle TEXT,
  member_avatar TEXT,
  bio TEXT,
  twitch_url TEXT,
  achievement TEXT,
  featured_week TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spotlight_guild ON spotlight(guild);
CREATE INDEX idx_spotlight_current ON spotlight(is_current);

-- ============================================================
-- GUILD HALL RECAPS TABLE
-- Monthly meeting summaries
-- ============================================================
CREATE TABLE IF NOT EXISTS guild_hall_recaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  meeting_date DATE,
  topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recaps_guild ON guild_hall_recaps(guild);

-- ============================================================
-- HIGHLIGHTS TABLE
-- Guild event highlights with images
-- ============================================================
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  image_url TEXT,
  event_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_highlights_guild ON highlights(guild);

-- ============================================================
-- GUILDIE GAMES — MONTHS TABLE
-- One row per competition month
-- ============================================================
CREATE TABLE IF NOT EXISTS guildie_games_months (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_number INTEGER UNIQUE NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  challenge_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  start_date DATE,
  end_date DATE,
  winner_guild TEXT CHECK (winner_guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GUILDIE GAMES — SCORES TABLE
-- Scores per guild per month
-- ============================================================
CREATE TABLE IF NOT EXISTS guildie_games_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_id UUID NOT NULL REFERENCES guildie_games_months(id) ON DELETE CASCADE,
  guild TEXT NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  score INTEGER DEFAULT 0,
  score_unit TEXT DEFAULT 'points',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month_id, guild)
);

CREATE INDEX idx_scores_month ON guildie_games_scores(month_id);

-- ============================================================
-- SITE SETTINGS TABLE
-- Per-guild theme customization and section visibility
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild TEXT UNIQUE NOT NULL CHECK (guild IN ('women', 'black', 'latin', 'pride', 'ia')),
  theme_colors JSONB DEFAULT '{}',
  section_order TEXT[] DEFAULT ARRAY['home','newsletter','archive','announcements','events','spotlight','recaps','highlights','streams'],
  section_visibility JSONB DEFAULT '{"home":true,"newsletter":true,"archive":true,"announcements":true,"events":true,"spotlight":true,"recaps":true,"highlights":true,"streams":true}',
  custom_css TEXT,
  heading_font TEXT DEFAULT 'Playfair Display',
  body_font TEXT DEFAULT 'DM Sans',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_hall_recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE guildie_games_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE guildie_games_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES (anyone can read published content)
-- ============================================================

-- Users: only auth'd users can see user list
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = discord_id OR EXISTS (
    SELECT 1 FROM users u WHERE u.discord_id = auth.uid()::text AND u.role IN ('super_admin', 'twitch_staff', 'community_specialist')
  ));

-- Newsletters: anyone can read published issues
CREATE POLICY "Public read published newsletters" ON newsletters
  FOR SELECT USING (published = true);

-- Events: public read
CREATE POLICY "Public read events" ON events
  FOR SELECT USING (true);

-- Announcements: public read
CREATE POLICY "Public read announcements" ON announcements
  FOR SELECT USING (true);

-- Spotlight: public read
CREATE POLICY "Public read spotlight" ON spotlight
  FOR SELECT USING (true);

-- Recaps: public read
CREATE POLICY "Public read recaps" ON guild_hall_recaps
  FOR SELECT USING (true);

-- Highlights: public read
CREATE POLICY "Public read highlights" ON highlights
  FOR SELECT USING (true);

-- Games months: public read
CREATE POLICY "Public read games months" ON guildie_games_months
  FOR SELECT USING (true);

-- Games scores: public read
CREATE POLICY "Public read games scores" ON guildie_games_scores
  FOR SELECT USING (true);

-- Site settings: public read
CREATE POLICY "Public read site settings" ON site_settings
  FOR SELECT USING (true);

-- ============================================================
-- STAFF WRITE POLICIES (guild staff can edit their guild's content)
-- ============================================================

-- Helper: Check if current user is staff for a specific guild
-- Staff = newsletter_team, mentor, community_specialist, twitch_staff, super_admin
CREATE OR REPLACE FUNCTION is_guild_staff(check_guild TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE discord_id = auth.uid()::text
    AND (
      (guild = check_guild AND role IN ('newsletter_team', 'mentor', 'community_specialist', 'twitch_staff'))
      OR role = 'super_admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE discord_id = auth.uid()::text
    AND role IN ('super_admin', 'twitch_staff', 'community_specialist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Newsletters: staff can read drafts for their guild
CREATE POLICY "Staff read all newsletters for their guild" ON newsletters
  FOR SELECT USING (is_guild_staff(guild));

-- Newsletters: staff can insert/update for their guild
CREATE POLICY "Staff insert newsletters" ON newsletters
  FOR INSERT WITH CHECK (is_guild_staff(guild));

CREATE POLICY "Staff update newsletters" ON newsletters
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Staff delete newsletters" ON newsletters
  FOR DELETE USING (is_guild_staff(guild));

-- Events: staff can manage
CREATE POLICY "Staff insert events" ON events
  FOR INSERT WITH CHECK (is_guild_staff(guild));

CREATE POLICY "Staff update events" ON events
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Staff delete events" ON events
  FOR DELETE USING (is_guild_staff(guild));

-- Announcements: staff can manage
CREATE POLICY "Staff insert announcements" ON announcements
  FOR INSERT WITH CHECK (is_guild_staff(guild));

CREATE POLICY "Staff update announcements" ON announcements
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Staff delete announcements" ON announcements
  FOR DELETE USING (is_guild_staff(guild));

-- Spotlight: staff can manage
CREATE POLICY "Staff insert spotlight" ON spotlight
  FOR INSERT WITH CHECK (is_guild_staff(guild));

CREATE POLICY "Staff update spotlight" ON spotlight
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Staff delete spotlight" ON spotlight
  FOR DELETE USING (is_guild_staff(guild));

-- Recaps: staff can manage
CREATE POLICY "Staff insert recaps" ON guild_hall_recaps
  FOR INSERT WITH CHECK (is_guild_staff(guild));

CREATE POLICY "Staff update recaps" ON guild_hall_recaps
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Staff delete recaps" ON guild_hall_recaps
  FOR DELETE USING (is_guild_staff(guild));

-- Highlights: staff can manage
CREATE POLICY "Staff insert highlights" ON highlights
  FOR INSERT WITH CHECK (is_guild_staff(guild));

CREATE POLICY "Staff update highlights" ON highlights
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Staff delete highlights" ON highlights
  FOR DELETE USING (is_guild_staff(guild));

-- Games months: only super admin
CREATE POLICY "Super admin insert games months" ON guildie_games_months
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "Super admin update games months" ON guildie_games_months
  FOR UPDATE USING (is_super_admin());

-- Games scores: super admin can update
CREATE POLICY "Super admin insert games scores" ON guildie_games_scores
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "Super admin update games scores" ON guildie_games_scores
  FOR UPDATE USING (is_super_admin());

-- Site settings: guild staff can update their guild's settings
CREATE POLICY "Staff update site settings" ON site_settings
  FOR UPDATE USING (is_guild_staff(guild));

CREATE POLICY "Super admin insert site settings" ON site_settings
  FOR INSERT WITH CHECK (is_super_admin());

-- ============================================================
-- SEED DATA — Guildie Games Months
-- ============================================================
INSERT INTO guildie_games_months (month_number, challenge_name, status, start_date, end_date, winner_guild) VALUES
  (1, 'Longest VC Session', 'completed', '2026-01-01', '2026-01-31', 'black'),
  (2, 'Most Clips Submitted', 'active', '2026-02-01', '2026-02-28', NULL),
  (3, 'TBA', 'upcoming', '2026-03-01', '2026-03-31', NULL),
  (4, 'TBA', 'upcoming', '2026-04-01', '2026-04-30', NULL),
  (5, 'TBA', 'upcoming', '2026-05-01', '2026-05-31', NULL),
  (6, 'TBA', 'upcoming', '2026-06-01', '2026-06-30', NULL),
  (7, 'TBA', 'upcoming', '2026-07-01', '2026-07-31', NULL),
  (8, 'TBA', 'upcoming', '2026-08-01', '2026-08-31', NULL),
  (9, 'TBA', 'upcoming', '2026-09-01', '2026-09-30', NULL),
  (10, 'TBA', 'upcoming', '2026-10-01', '2026-10-31', NULL),
  (11, 'TBA', 'upcoming', '2026-11-01', '2026-11-30', NULL),
  (12, 'TBA', 'upcoming', '2026-12-01', '2026-12-31', NULL)
ON CONFLICT (month_number) DO NOTHING;

-- Seed scores for Month 1 (completed)
INSERT INTO guildie_games_scores (month_id, guild, score, score_unit)
SELECT m.id, g.guild, g.score, 'VC Hours'
FROM guildie_games_months m
CROSS JOIN (VALUES
  ('black', 147),
  ('women', 105),
  ('pride', 81),
  ('latin', 62),
  ('ia', 44)
) AS g(guild, score)
WHERE m.month_number = 1
ON CONFLICT (month_id, guild) DO NOTHING;

-- Seed scores for Month 2 (active)
INSERT INTO guildie_games_scores (month_id, guild, score, score_unit)
SELECT m.id, g.guild, g.score, 'clips submitted'
FROM guildie_games_months m
CROSS JOIN (VALUES
  ('women', 47),
  ('black', 38),
  ('ia', 30),
  ('pride', 22),
  ('latin', 16)
) AS g(guild, score)
WHERE m.month_number = 2
ON CONFLICT (month_id, guild) DO NOTHING;

-- Seed default site settings for each guild
INSERT INTO site_settings (guild) VALUES
  ('women'), ('black'), ('latin'), ('pride'), ('ia')
ON CONFLICT (guild) DO NOTHING;

-- ============================================================
-- STORAGE BUCKET (run separately in Supabase dashboard)
-- Create bucket: guild-images (public)
-- ============================================================
-- Note: Storage bucket creation is done via the Supabase dashboard:
-- 1. Go to Storage in your Supabase project
-- 2. Create a new bucket called "guild-images"
-- 3. Set it to "Public" so images can be displayed on the site
-- 4. Add policy: authenticated users can upload to their guild's folder
