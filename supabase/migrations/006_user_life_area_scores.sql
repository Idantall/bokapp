-- Migration: User Life Area Baseline Scores
-- Tracks initial and ongoing scores for each life area per user

-- Table to store user's baseline and current scores for life areas
CREATE TABLE IF NOT EXISTS user_life_area_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_area_id UUID NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  baseline_score INT CHECK (baseline_score >= 0 AND baseline_score <= 10),
  current_score INT CHECK (current_score >= 0 AND current_score <= 10),
  is_focus_area BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, life_area_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_life_area_scores_user 
  ON user_life_area_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_life_area_scores_area 
  ON user_life_area_scores(life_area_id);

-- RLS Policies
ALTER TABLE user_life_area_scores ENABLE ROW LEVEL SECURITY;

-- Users can read their own scores
CREATE POLICY user_life_area_scores_select 
  ON user_life_area_scores FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own scores
CREATE POLICY user_life_area_scores_insert 
  ON user_life_area_scores FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY user_life_area_scores_update 
  ON user_life_area_scores FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to get user's life area score
CREATE OR REPLACE FUNCTION get_life_area_score(
  p_user_id UUID,
  p_life_area_id UUID
)
RETURNS INT AS $$
DECLARE
  v_score INT;
BEGIN
  SELECT COALESCE(current_score, baseline_score, 5)
  INTO v_score
  FROM user_life_area_scores
  WHERE user_id = p_user_id 
    AND life_area_id = p_life_area_id;
  
  -- Return 5 (neutral) if no score exists
  RETURN COALESCE(v_score, 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_life_area_score TO authenticated;

