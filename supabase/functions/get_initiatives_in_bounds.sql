-- ================================
-- Get initiatives within map bounds (viewport-based loading)
-- ================================
-- Purpose: Return only initiatives visible in the current map viewport
-- Performance: Uses spatial index for fast queries
-- Returns: Initiatives with their location as text (POINT(lon lat))

CREATE OR REPLACE FUNCTION get_initiatives_in_bounds(
  p_west FLOAT,
  p_south FLOAT,
  p_east FLOAT,
  p_north FLOAT,
  p_types TEXT[] DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  location_text TEXT,
  verified BOOLEAN,
  image_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.type,
    i.description,
    i.address,
    -- Convert PostGIS geography to text format "POINT(lon lat)"
    ST_AsText(i.location::geometry) AS location_text,
    i.verified,
    i.image_url,
    i.website,
    i.phone,
    i.email,
    i.opening_hours,
    i.user_id,
    i.created_at,
    i.updated_at
  FROM initiatives i
  WHERE
    -- Spatial filter: check if point is within bounding box
    -- ST_MakeEnvelope(west, south, east, north, SRID)
    ST_Within(
      i.location::geometry,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
    )
    -- Type filter (optional)
    AND (p_types IS NULL OR i.type = ANY(p_types))
    -- Verified filter (optional)
    AND (NOT p_verified_only OR i.verified = TRUE)
  -- No ORDER BY for better performance - we want ALL initiatives in viewport
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_initiatives_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, TEXT[], BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_initiatives_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, TEXT[], BOOLEAN, INTEGER) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION get_initiatives_in_bounds IS 
  'Returns initiatives within a geographic bounding box (viewport). 
   Uses spatial index for performance. 
   Parameters: west, south, east, north (WGS84 coordinates), optional type filter, verified filter, and result limit.
   Example: SELECT * FROM get_initiatives_in_bounds(-5.5, 41.0, 10.0, 51.5, ARRAY[''Ressourcerie''], false, 500);';
