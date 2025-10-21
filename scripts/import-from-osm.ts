/**
 * Import initiatives from OpenStreetMap using Overpass API
 *
 * This script fetches ESS-related Points of Interest from OpenStreetMap
 * within France and imports them into our Supabase database.
 *
 * OSM Tags used:
 * - shop=second_hand (Ressourceries, Recycleries)
 * - amenity=recycling (Points de collecte)
 * - shop=organic (AMAP-like shops)
 * - amenity=social_facility (Entreprises d'insertion)
 * - craft=* (Repair Cafés, etc.)
 */

// Load environment variables from .env.local
require('./load-env');

import { createClient } from '@supabase/supabase-js';
import type { InitiativeType } from '../src/types/initiative';

// ================================
// CONFIGURATION
// ================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Overpass API endpoint
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// France bounding box [south, west, north, east]
const FRANCE_BBOX = '41.0,-5.5,51.5,10.0';

// ================================
// OSM TAG MAPPING
// ================================

/**
 * Maps OSM tags to our initiative types
 */
const OSM_TAG_MAPPING: Record<
  string,
  {
    type: InitiativeType;
    query: string;
  }
> = {
  second_hand: {
    type: 'Ressourcerie',
    query: 'node["shop"="second_hand"]',
  },
  recycling: {
    type: 'Point de collecte',
    query: 'node["amenity"="recycling"]',
  },
  organic_shop: {
    type: 'AMAP',
    query: 'node["shop"="organic"]',
  },
  social_facility: {
    type: "Entreprise d'insertion",
    query: 'node["amenity"="social_facility"]',
  },
  repair_cafe: {
    type: 'Repair Café',
    query:
      'node["amenity"="community_centre"]["community_centre:for"~"repair"]',
  },
};

// ================================
// TYPES
// ================================

interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:postcode'?: string;
    'addr:city'?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    opening_hours?: string;
    [key: string]: string | undefined;
  };
}

interface OSMResponse {
  version: number;
  generator: string;
  elements: OSMNode[];
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Build a full address from OSM tags
 */
function buildAddress(tags?: OSMNode['tags']): string | null {
  if (!tags) return null;

  const parts: string[] = [];

  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  if (tags['addr:city']) parts.push(tags['addr:city']);

  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Fetch data from Overpass API
 */
async function fetchFromOverpass(query: string): Promise<OSMNode[]> {
  const overpassQuery = `
    [out:json][timeout:60];
    (
      ${query}(${FRANCE_BBOX});
    );
    out body;
  `;

  console.log('🔍 Querying Overpass API...');
  console.log('Query:', query);

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data: OSMResponse = await response.json();
    return data.elements;
  } catch (error) {
    console.error('❌ Error fetching from Overpass:', error);
    return [];
  }
}

/**
 * Convert OSM node to our initiative format
 */
function osmNodeToInitiative(node: OSMNode, type: InitiativeType) {
  const address = buildAddress(node.tags);

  return {
    name: node.tags?.name || `${type} #${node.id}`,
    type,
    description: node.tags?.description || null,
    address,
    location: `POINT(${node.lon} ${node.lat})`, // PostGIS format: POINT(longitude latitude)
    verified: false, // OSM data is not verified by default
    website: node.tags?.website || null,
    phone: node.tags?.phone || null,
    email: node.tags?.email || null,
    opening_hours: node.tags?.opening_hours
      ? { raw: node.tags.opening_hours }
      : null,
    // Note: user_id is null for imported data
  };
}

/**
 * Insert initiatives into Supabase
 *
 * Note: We need to use raw SQL for location to ensure proper PostGIS format
 */
async function insertInitiatives(initiatives: any[]) {
  if (initiatives.length === 0) {
    console.log('⚠️  No initiatives to insert');
    return;
  }

  console.log(`📥 Inserting ${initiatives.length} initiatives...`);

  // Insert one by one to handle PostGIS format properly
  const inserted = [];

  for (const initiative of initiatives) {
    const { location, ...rest } = initiative;

    // Use RPC to insert with proper PostGIS conversion
    const { data, error } = await supabase.rpc('insert_initiative', {
      p_name: rest.name,
      p_type: rest.type,
      p_description: rest.description,
      p_address: rest.address,
      p_location_text: location, // Pass as text, will be converted by function
      p_verified: rest.verified,
      p_website: rest.website,
      p_phone: rest.phone,
      p_email: rest.email,
      p_opening_hours: rest.opening_hours,
    });

    if (error) {
      console.error(`❌ Error inserting ${rest.name}:`, error.message);
      continue; // Skip this one and continue
    }

    inserted.push(data);
  }

  console.log(`✅ Successfully inserted ${inserted.length} initiatives`);
  return inserted;
}

/**
 * Check if initiative already exists (based on location proximity)
 */
async function initiativeExists(lon: number, lat: number): Promise<boolean> {
  // Check if there's an initiative within 50 meters
  const { data, error } = await supabase.rpc('get_nearby_initiatives', {
    lat,
    lng: lon,
    radius_km: 0.05, // 50 meters
  });

  if (error) {
    console.warn('Warning checking duplicates:', error);
    return false;
  }

  return data && data.length > 0;
}

// ================================
// MAIN IMPORT FUNCTION
// ================================

async function importFromOSM(
  tagKey: string,
  options: { skipDuplicates?: boolean } = {}
) {
  const mapping = OSM_TAG_MAPPING[tagKey];

  if (!mapping) {
    console.error(`❌ Unknown tag key: ${tagKey}`);
    console.log('Available tags:', Object.keys(OSM_TAG_MAPPING).join(', '));
    return;
  }

  console.log(`\n🗺️  Importing ${mapping.type} from OpenStreetMap...`);
  console.log(`📍 Bounding box: France (${FRANCE_BBOX})`);
  console.log('─'.repeat(50));

  // Fetch from OSM
  const nodes = await fetchFromOverpass(mapping.query);
  console.log(`📦 Found ${nodes.length} nodes`);

  if (nodes.length === 0) {
    console.log('✅ Nothing to import');
    return;
  }

  // Filter out nodes without name (usually low quality)
  const namedNodes = nodes.filter((node) => node.tags?.name);
  console.log(`📝 ${namedNodes.length} have names`);

  // Convert to our format
  let initiatives = namedNodes.map((node) =>
    osmNodeToInitiative(node, mapping.type)
  );

  // Check for duplicates if requested
  if (options.skipDuplicates) {
    console.log('🔍 Checking for duplicates...');
    const filtered = [];

    for (const initiative of initiatives) {
      // Extract coordinates from PostGIS string "POINT(lon lat)"
      const coords = initiative.location
        .replace('POINT(', '')
        .replace(')', '')
        .split(' ')
        .map(parseFloat);

      const exists = await initiativeExists(coords[0], coords[1]);

      if (!exists) {
        filtered.push(initiative);
      }
    }

    console.log(
      `📊 ${initiatives.length - filtered.length} duplicates filtered out`
    );
    initiatives = filtered;
  }

  // Insert into database
  if (initiatives.length > 0) {
    await insertInitiatives(initiatives);
  }

  console.log('─'.repeat(50));
  console.log('✅ Import complete!\n');
}

// ================================
// CLI INTERFACE
// ================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🗺️  LaMap - OSM Data Import Tool

Usage:
  npm run import:osm [tag] [options]

Available tags:
  ${Object.entries(OSM_TAG_MAPPING)
    .map(([key, val]) => `  ${key.padEnd(20)} → ${val.type}`)
    .join('\n  ')}

  all                  → Import all types (sequential)

Options:
  --skip-duplicates    Skip initiatives near existing ones

Examples:
  npm run import:osm second_hand
  npm run import:osm all --skip-duplicates
  npm run import:osm recycling
    `);
    return;
  }

  const tag = args[0];
  const skipDuplicates = args.includes('--skip-duplicates');

  if (tag === 'all') {
    console.log('🚀 Importing all initiative types...\n');

    for (const tagKey of Object.keys(OSM_TAG_MAPPING)) {
      await importFromOSM(tagKey, { skipDuplicates });

      // Pause between requests to avoid overloading the API
      console.log('⏸️  Waiting 2 seconds before next request...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('🎉 All imports complete!');
  } else {
    await importFromOSM(tag, { skipDuplicates });
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { importFromOSM, OSM_TAG_MAPPING };
