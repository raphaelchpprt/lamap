æ-- Function to insert a new initiative with proper PostGIS format
-- This function is used by the import scripts to handle text-format locations

CREATE OR REPLACE FUNCTION insert_initiative(
  p_name TEXT,
  p_type TEXT,
  p_location_text TEXT,  -- Format: "POINT(longitude latitude)" - REQUIRED (no default)
  p_description TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_verified BOOLEAN DEFAULT FALSE,
  p_website TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_opening_hours JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_initiative_id UUID;
BEGIN
  -- Insert the initiative and return the ID
  INSERT INTO initiatives (
    name,
    type,
    description,
    address,
    location,  -- Convert text to geography using ST_GeomFromText
    verified,
    website,
    phone,
    email,
    opening_hours,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_type,
    p_description,
    p_address,
    ST_GeomFromText(p_location_text, 4326)::geography,  -- Convert "POINT(lon lat)" to geography
    p_verified,
    p_website,
    p_phone,
    p_email,
    p_opening_hours,
    NULL,  -- user_id is NULL for imported data
    NOW(),
    NOW()
  )
  RETURNING id INTO v_initiative_id;

  RETURN v_initiative_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_initiative(
  TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, JSONB
) TO authenticated;

-- Grant execute permission to anon (for service role)
GRANT EXECUTE ON FUNCTION insert_initiative(
  TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, JSONB
) TO anon;
