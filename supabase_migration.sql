-- =============================================
-- Pulse — Supabase Database Setup
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Add new columns to existing research_sessions table
ALTER TABLE research_sessions
  ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_sessions_share_slug ON research_sessions(share_slug);

-- 2. Create the monitors table
CREATE TABLE IF NOT EXISTS monitors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  topic       TEXT NOT NULL,
  schedule    TEXT NOT NULL DEFAULT 'weekly',   -- 'daily' | 'weekly' | 'monthly'
  email       TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  next_run    TIMESTAMPTZ NOT NULL,
  last_run    TIMESTAMPTZ,
  last_report TEXT,
  last_score  INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for scheduler query (finds due active monitors)
CREATE INDEX IF NOT EXISTS idx_monitors_active_next_run ON monitors(active, next_run);
CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
