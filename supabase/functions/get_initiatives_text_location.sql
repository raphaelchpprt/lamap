-- Function to get all initiatives with location in text format
-- This solves the WKB binary format issue

CREATE OR REPLACE FUNCTION get_all_initiatives_with_text_location()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  location TEXT,  -- Will be WKT text format: "POINT(lng lat)"
  verified BOOLEAN,
  image_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  youtube TEXT,
  tiktok TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT
    id,
    name,
    type,
    description,
    address,
    ST_AsText(location) as location,  -- Convert geography to WKT text
    verified,
    image_url,
    website,
    phone,
    email,
    opening_hours,
    facebook,
    instagram,
    twitter,
    linkedin,
    youtube,
    tiktok,
    user_id,
    created_at,
    updated_at
  FROM initiatives
  ORDER BY created_at DESC;
$$ LANGUAGE sql STABLE;
