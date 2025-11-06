/**
 * Analyze Current Database Data
 * 
 * Shows statistics about initiatives in the database:
 * - Total count
 * - Breakdown by type
 * - Data quality metrics
 * - Geographic distribution
 * 
 * Usage: npm run analyze
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           ANALYSE DES DONNÉES LAMAP                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log();

  // Get total count
  const { count: totalCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 TOTAL: ${totalCount} initiatives dans la base`);
  console.log();

  // Get count by type
  const { data: byType } = await supabase
    .from('initiatives')
    .select('type')
    .order('type');

  if (byType) {
    const typeCounts = byType.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 RÉPARTITION PAR TYPE:');
    console.log('─'.repeat(50));
    
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    
    for (const [type, count] of sortedTypes) {
      const percentage = ((count / (totalCount || 1)) * 100).toFixed(1);
      const bar = '█'.repeat(Math.min(30, Math.floor(count / 100)));
      console.log(`${type.padEnd(30)} ${count.toString().padStart(5)} (${percentage.padStart(5)}%) ${bar}`);
    }
    console.log();
  }

  // Data quality metrics
  const { data: qualityData } = await supabase
    .from('initiatives')
    .select('description, address, website, phone, email, verified, opening_hours');

  if (qualityData) {
    const withDescription = qualityData.filter(i => i.description).length;
    const withAddress = qualityData.filter(i => i.address).length;
    const withWebsite = qualityData.filter(i => i.website).length;
    const withPhone = qualityData.filter(i => i.phone).length;
    const withEmail = qualityData.filter(i => i.email).length;
    const verified = qualityData.filter(i => i.verified).length;
    const withHours = qualityData.filter(i => i.opening_hours).length;

    console.log('✅ QUALITÉ DES DONNÉES:');
    console.log('─'.repeat(50));
    console.log(`Description:        ${withDescription.toString().padStart(5)} / ${totalCount} (${((withDescription / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log(`Adresse:            ${withAddress.toString().padStart(5)} / ${totalCount} (${((withAddress / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log(`Site web:           ${withWebsite.toString().padStart(5)} / ${totalCount} (${((withWebsite / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log(`Téléphone:          ${withPhone.toString().padStart(5)} / ${totalCount} (${((withPhone / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log(`Email:              ${withEmail.toString().padStart(5)} / ${totalCount} (${((withEmail / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log(`Horaires:           ${withHours.toString().padStart(5)} / ${totalCount} (${((withHours / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log(`Vérifiées:          ${verified.toString().padStart(5)} / ${totalCount} (${((verified / (totalCount || 1)) * 100).toFixed(1)}%)`);
    console.log();
  }

  // Geographic distribution
  const { data: geoData } = await supabase
    .from('initiatives')
    .select('location');

  if (geoData) {
    const validGeoData = geoData.filter(i => i.location?.coordinates?.length === 2);
    const latitudes = validGeoData.map(i => i.location.coordinates[1]);
    const longitudes = validGeoData.map(i => i.location.coordinates[0]);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    console.log('🗺️  DISTRIBUTION GÉOGRAPHIQUE:');
    console.log('─'.repeat(50));
    console.log(`Latitude:  ${minLat.toFixed(2)}° → ${maxLat.toFixed(2)}°`);
    console.log(`Longitude: ${minLng.toFixed(2)}° → ${maxLng.toFixed(2)}°`);
    console.log();

    // Rough region detection (France)
    const paris = geoData.filter(i => {
      const [lng, lat] = i.location.coordinates;
      return lat >= 48.8 && lat <= 48.9 && lng >= 2.2 && lng <= 2.5;
    }).length;

    const lyon = geoData.filter(i => {
      const [lng, lat] = i.location.coordinates;
      return lat >= 45.7 && lat <= 45.8 && lng >= 4.8 && lng <= 4.9;
    }).length;

    const marseille = geoData.filter(i => {
      const [lng, lat] = i.location.coordinates;
      return lat >= 43.2 && lat <= 43.4 && lng >= 5.3 && lng <= 5.5;
    }).length;

    console.log('📍 GRANDES VILLES (estimation):');
    console.log('─'.repeat(50));
    console.log(`Paris région:       ${paris} initiatives`);
    console.log(`Lyon région:        ${lyon} initiatives`);
    console.log(`Marseille région:   ${marseille} initiatives`);
    console.log();
  }

  // Recent additions
  const { data: recentData } = await supabase
    .from('initiatives')
    .select('name, type, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentData) {
    console.log('🕐 DERNIERS AJOUTS:');
    console.log('─'.repeat(50));
    for (const item of recentData) {
      const date = new Date(item.created_at).toLocaleString('fr-FR');
      console.log(`${date} - ${item.type} - ${item.name.substring(0, 40)}`);
    }
    console.log();
  }

  console.log('═'.repeat(50));
  console.log('💡 RECOMMANDATIONS:');
  console.log();
  console.log('1. 🎯 Couvrir les types manquants ou sous-représentés');
  console.log('2. 📝 Enrichir les données (description, contact, horaires)');
  console.log('3. ✅ Vérifier les initiatives existantes');
  console.log('4. 🗺️  Améliorer la couverture géographique');
  console.log('5. 🤝 Contacter les réseaux ESS pour partenariats');
  console.log();
}

main().catch(console.error);
