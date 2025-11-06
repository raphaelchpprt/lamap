-- Migration: Add social media fields to initiatives table
-- Date: 2025-02-06
-- Purpose: Store social media links for initiatives

-- Add social media columns to initiatives table
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- Add comment for documentation
COMMENT ON COLUMN initiatives.facebook IS 'Facebook page or profile URL';
COMMENT ON COLUMN initiatives.instagram IS 'Instagram profile URL';
COMMENT ON COLUMN initiatives.twitter IS 'Twitter/X profile URL';
COMMENT ON COLUMN initiatives.linkedin IS 'LinkedIn company or profile URL';
COMMENT ON COLUMN initiatives.youtube IS 'YouTube channel URL';
COMMENT ON COLUMN initiatives.tiktok IS 'TikTok profile URL';
