-- ========================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- New Features: Life Area Scores & Baseline Ratings
-- ========================================

-- 1. Create user_life_area_scores table
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_life_area_scores_user 
  ON user_life_area_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_life_area_scores_area 
  ON user_life_area_scores(life_area_id);

-- 3. Enable RLS
ALTER TABLE user_life_area_scores ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY user_life_area_scores_select 
  ON user_life_area_scores FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY user_life_area_scores_insert 
  ON user_life_area_scores FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_life_area_scores_update 
  ON user_life_area_scores FOR UPDATE 
  USING (auth.uid() = user_id);

-- 5. Create function to get life area score
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

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_life_area_score TO authenticated;

-- ========================================
-- DONE! ✅
-- ========================================
-- This will enable:
-- - Baseline life area ratings during onboarding
-- - Tracking of focus areas
-- - Historical score progression
-- ========================================

