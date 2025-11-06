#!/usr/bin/env tsx
/* eslint-disable no-console, @typescript-eslint/no-unused-vars */

/**
 * Script to import social media links for existing initiatives
 *
 * Sources:
 * - OpenStreetMap (contact:facebook, contact:instagram, etc.)
 * - Website scraping (looking for social media links in HTML)
 * - Manual enrichment from known databases
 *
 * Usage:
 *   npm run import:social-media
 *   npm run import:social-media -- --dry-run  # Preview changes without saving
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================
// TYPES
// ================================

interface Initiative {
  id: string;
  name: string;
  type: string;
  address: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  youtube: string | null;
  tiktok: string | null;
}

interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'contact:facebook'?: string;
    'contact:instagram'?: string;
    'contact:twitter'?: string;
    'contact:linkedin'?: string;
    'contact:youtube'?: string;
    'contact:tiktok'?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}

// ================================
// UTILITIES
// ================================

/**
 * Normalize social media URL
 */
function normalizeSocialUrl(
  platform: string,
  value: string | undefined
): string | null {
  if (!value) return null;

  // Already a full URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Remove @ symbol if present
  const cleanValue = value.replace(/^@/, '');

  // Build full URL based on platform
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/${cleanValue}`;
    case 'instagram':
      return `https://www.instagram.com/${cleanValue}`;
    case 'twitter':
      return `https://twitter.com/${cleanValue}`;
    case 'linkedin':
      // Could be company or personal profile
      if (cleanValue.startsWith('company/')) {
        return `https://www.linkedin.com/${cleanValue}`;
      }
      return `https://www.linkedin.com/in/${cleanValue}`;
    case 'youtube':
      // Could be channel or user
      if (
        cleanValue.startsWith('@') ||
        cleanValue.startsWith('c/') ||
        cleanValue.startsWith('user/')
      ) {
        return `https://www.youtube.com/${cleanValue}`;
      }
      return `https://www.youtube.com/@${cleanValue}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${cleanValue}`;
    default:
      return null;
  }
}

/**
 * Extract social media links from OSM tags
 */
function extractSocialMediaFromOSM(tags: OSMNode['tags']): SocialMediaLinks {
  const social: SocialMediaLinks = {};

  // Check both contact:* and direct tags
  const facebook = tags['contact:facebook'] || tags['facebook'];
  const instagram = tags['contact:instagram'] || tags['instagram'];
  const twitter = tags['contact:twitter'] || tags['twitter'];
  const linkedin = tags['contact:linkedin'] || tags['linkedin'];
  const youtube = tags['contact:youtube'] || tags['youtube'];
  const tiktok = tags['contact:tiktok'] || tags['tiktok'];

  if (facebook)
    social.facebook = normalizeSocialUrl('facebook', facebook) || undefined;
  if (instagram)
    social.instagram = normalizeSocialUrl('instagram', instagram) || undefined;
  if (twitter)
    social.twitter = normalizeSocialUrl('twitter', twitter) || undefined;
  if (linkedin)
    social.linkedin = normalizeSocialUrl('linkedin', linkedin) || undefined;
  if (youtube)
    social.youtube = normalizeSocialUrl('youtube', youtube) || undefined;
  if (tiktok) social.tiktok = normalizeSocialUrl('tiktok', tiktok) || undefined;

  return social;
}

/**
 * Fetch OSM data for a location
 */
async function fetchOSMDataForLocation(
  lat: number,
  lon: number,
  name: string
): Promise<SocialMediaLinks | null> {
  try {
    // Search in 100m radius
    const radius = 100;
    const bbox = `${lon - 0.001},${lat - 0.001},${lon + 0.001},${lat + 0.001}`;

    const query = `
      [out:json][timeout:25];
      (
        node["name"~"${name}",i](${bbox});
        way["name"~"${name}",i](${bbox});
        relation["name"~"${name}",i](${bbox});
      );
      out body;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Find matching element
    for (const element of data.elements) {
      if (element.tags?.name?.toLowerCase() === name.toLowerCase()) {
        const social = extractSocialMediaFromOSM(element.tags);
        if (Object.keys(social).length > 0) {
          return social;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching OSM data for ${name}:`, error);
    return null;
  }
}

/**
 * Extract social media links from website HTML
 */
async function scrapeSocialMediaFromWebsite(
  url: string
): Promise<SocialMediaLinks> {
  const social: SocialMediaLinks = {};

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LaMap/1.0; +https://lamap.fr)',
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      return social;
    }

    const html = await response.text();

    // Simple regex patterns to find social media links
    const patterns = {
      facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[a-zA-Z0-9._-]+/gi,
      instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[a-zA-Z0-9._]+/gi,
      twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+/gi,
      linkedin:
        /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9_-]+/gi,
      youtube:
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|c\/|channel\/|user\/)[a-zA-Z0-9_-]+/gi,
      tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._]+/gi,
    };

    for (const [platform, pattern] of Object.entries(patterns)) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        // Take first match and normalize
        const normalized = normalizeSocialUrl(platform, matches[0]);
        if (normalized) {
          social[platform as keyof SocialMediaLinks] = normalized;
        }
      }
    }

    return social;
  } catch (error) {
    // Timeout or fetch error - skip silently
    return social;
  }
}

// ================================
// MAIN FUNCTIONS
// ================================

/**
 * Enrich a single initiative with social media links
 */
async function enrichInitiative(
  initiative: Initiative,
  dryRun: boolean
): Promise<boolean> {
  let updated = false;
  const socialMedia: SocialMediaLinks = {};

  console.log(`\n📍 Processing: ${initiative.name} (${initiative.type})`);

  // Skip if already has social media
  const hasSocialMedia =
    initiative.facebook ||
    initiative.instagram ||
    initiative.twitter ||
    initiative.linkedin ||
    initiative.youtube ||
    initiative.tiktok;

  if (hasSocialMedia) {
    console.log('  ⏭️  Already has social media links, skipping...');
    return false;
  }

  // 1. Try to scrape from website
  if (initiative.website) {
    console.log(`  🌐 Scraping website: ${initiative.website}`);
    const websiteSocial = await scrapeSocialMediaFromWebsite(
      initiative.website
    );
    Object.assign(socialMedia, websiteSocial);

    if (Object.keys(websiteSocial).length > 0) {
      console.log(
        `  ✅ Found ${Object.keys(websiteSocial).length} social media links from website`
      );
      Object.entries(websiteSocial).forEach(([platform, url]) => {
        console.log(`     - ${platform}: ${url}`);
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 2. Try OSM (only if we have address/location)
  // Note: Would need to parse location from database first
  // Skipping for now as it requires more complex setup

  // Update database if we found anything
  if (Object.keys(socialMedia).length > 0) {
    if (dryRun) {
      console.log('  🔍 [DRY RUN] Would update with:', socialMedia);
    } else {
      const { error } = await supabase
        .from('initiatives')
        .update(socialMedia)
        .eq('id', initiative.id);

      if (error) {
        console.error(`  ❌ Error updating initiative: ${error.message}`);
      } else {
        console.log(
          `  ✅ Updated with ${Object.keys(socialMedia).length} social media links`
        );
        updated = true;
      }
    }
  } else {
    console.log('  ℹ️  No social media links found');
  }

  return updated;
}

/**
 * Main function
 */
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log(
    '╔═══════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║         🌐 LaMap - Import Social Media Links                 ║'
  );
  console.log(
    '╚═══════════════════════════════════════════════════════════════╝\n'
  );

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }

  // Fetch all initiatives without social media
  console.log('📊 Fetching initiatives without social media...\n');

  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select(
      'id, name, type, address, website, facebook, instagram, twitter, linkedin, youtube, tiktok'
    )
    .or(
      'facebook.is.null,instagram.is.null,twitter.is.null,linkedin.is.null,youtube.is.null,tiktok.is.null'
    )
    .not('website', 'is', null) // Only initiatives with websites
    .limit(100); // Process in batches

  if (error) {
    console.error('❌ Error fetching initiatives:', error.message);
    process.exit(1);
  }

  if (!initiatives || initiatives.length === 0) {
    console.log(
      '✅ No initiatives to process (all have social media or no website)'
    );
    return;
  }

  console.log(`📋 Found ${initiatives.length} initiatives to process\n`);

  let processed = 0;
  let updated = 0;
  let failed = 0;

  for (const initiative of initiatives) {
    try {
      const wasUpdated = await enrichInitiative(
        initiative as Initiative,
        dryRun
      );
      processed++;
      if (wasUpdated) updated++;

      // Progress indicator
      if (processed % 10 === 0) {
        console.log(
          `\n⏳ Progress: ${processed}/${initiatives.length} processed, ${updated} updated\n`
        );
      }
    } catch (error) {
      console.error(`❌ Error processing ${initiative.name}:`, error);
      failed++;
    }
  }

  console.log(
    '\n╔═══════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║                        📊 SUMMARY                             ║'
  );
  console.log(
    '╚═══════════════════════════════════════════════════════════════╝\n'
  );
  console.log(`✅ Processed: ${processed} initiatives`);
  console.log(`📝 Updated:   ${updated} initiatives`);
  console.log(`❌ Failed:    ${failed} initiatives\n`);

  if (dryRun) {
    console.log('💡 Run without --dry-run to save changes to database\n');
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
