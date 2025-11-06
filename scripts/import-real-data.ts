/**
 * Import Real ESS Data from Multiple Sources
 * 
 * This script imports real-world initiative data from:
 * 1. Repair Café official API
 * 2. Data.gouv.fr datasets (when available)
 * 3. Other specialized APIs
 * 
 * Usage:
 *   npm run import:real repair-cafe
 *   npm run import:real all
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// ================================
// TYPES
// ================================

interface RepairCafeRaw {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  email?: string;
}

interface ImportedInitiative {
  name: string;
  type: string;
  description?: string;
  address?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  website?: string;
  email?: string;
  phone?: string;
  verified: boolean;
}

// ================================
// CONFIGURATION
// ================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================
// REPAIR CAFÉ API
// ================================

/**
 * Import Repair Cafés from the official Repair Café International API
 * Note: The API might require authentication or have rate limits
 */
async function importRepairCafes(): Promise<number> {
  console.log('\n🔧 Importing Repair Cafés from official source...');
  console.log('─'.repeat(50));

  try {
    // Try the official Repair Café API
    // Note: This is a placeholder - the actual API endpoint may vary
    const apiUrl = 'https://repaircafe.org/api/v1/locations?country=FR';
    
    console.log('🔍 Fetching from Repair Café API...');
    console.log(`URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LaMap/1.0 (ESS mapping platform)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  API returned ${response.status}: ${response.statusText}`);
      console.log('   The API might require authentication or have changed.');
      console.log('   Alternative: Manually download data from https://repaircafe.org/fr/visiter/');
      return 0;
    }

    const data = await response.json();
    console.log(`📦 Found ${data.length || 0} repair cafés`);

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('⚠️  No data available from API');
      return 0;
    }

    // Transform and insert
    let inserted = 0;
    const initiatives: ImportedInitiative[] = [];

    for (const cafe of data as RepairCafeRaw[]) {
      // Skip if no coordinates
      if (!cafe.latitude || !cafe.longitude) {
        continue;
      }

      // Skip if not in France (rough bounding box)
      if (cafe.latitude < 41 || cafe.latitude > 51.5 || cafe.longitude < -5.5 || cafe.longitude > 10) {
        continue;
      }

      const address = [cafe.address, cafe.city, cafe.country]
        .filter(Boolean)
        .join(', ');

      initiatives.push({
        name: cafe.name,
        type: 'Repair Café',
        description: 'Atelier de réparation collaboratif où des bénévoles aident à réparer objets et appareils.',
        address: address || undefined,
        location: {
          type: 'Point',
          coordinates: [cafe.longitude, cafe.latitude],
        },
        website: cafe.website,
        email: cafe.email,
        verified: true, // Official source
      });
    }

    // Batch insert
    if (initiatives.length > 0) {
      const { error } = await supabase
        .from('initiatives')
        .insert(initiatives);

      if (error) {
        console.error('❌ Error inserting repair cafés:', error.message);
      } else {
        inserted = initiatives.length;
        console.log(`✅ Successfully inserted ${inserted} Repair Cafés`);
      }
    }

    return inserted;
  } catch (error) {
    console.error('❌ Error importing repair cafés:', error);
    return 0;
  }
}

// ================================
// RESEAU COCAGNE (Jardins d'insertion)
// ================================

/**
 * Import from Réseau Cocagne
 * Note: May require web scraping or manual data collection
 */
async function importReseauCocagne(): Promise<number> {
  console.log('\n🌱 Importing from Réseau Cocagne...');
  console.log('─'.repeat(50));
  
  console.log('ℹ️  Réseau Cocagne data requires:');
  console.log('   1. Visit https://www.reseaucocagne.asso.fr/');
  console.log('   2. Manual extraction or API access');
  console.log('   3. Contact them for data sharing');
  
  return 0;
}

// ================================
// AMAP (Association pour le Maintien d'une Agriculture Paysanne)
// ================================

/**
 * Import AMAP data
 * Sources:
 * - MIRAMAP (réseau national des AMAP)
 * - Data.gouv.fr (if available)
 */
async function importAMAP(): Promise<number> {
  console.log('\n🥕 Importing AMAP data...');
  console.log('─'.repeat(50));
  
  console.log('ℹ️  AMAP data sources:');
  console.log('   1. MIRAMAP: https://miramap.org/-Carte-des-AMAP-.html');
  console.log('   2. Regional AMAP networks');
  console.log('   3. Manual aggregation needed');
  
  return 0;
}

// ================================
// ENTREPRISES D'INSERTION
// ================================

/**
 * Import social enterprises (entreprises d'insertion)
 * Source: Data.gouv.fr or specialized databases
 */
async function importEntreprisesInsertion(): Promise<number> {
  console.log('\n🤝 Importing entreprises d\'insertion...');
  console.log('─'.repeat(50));
  
  console.log('ℹ️  Entreprises d\'insertion sources:');
  console.log('   1. ASP (Agence de Services et de Paiement)');
  console.log('   2. CNEI (Comité National des Entreprises d\'Insertion)');
  console.log('   3. Data.gouv.fr datasets');
  
  return 0;
}

// ================================
// ZERO WASTE FRANCE
// ================================

/**
 * Import Zero Waste initiatives
 */
async function importZeroWaste(): Promise<number> {
  console.log('\n♻️  Importing Zero Waste initiatives...');
  console.log('─'.repeat(50));
  
  console.log('ℹ️  Zero Waste France:');
  console.log('   1. Contact Zero Waste France for data');
  console.log('   2. Website: https://www.zerowastefrance.org/');
  console.log('   3. May have local group mapping data');
  
  return 0;
}

// ================================
// SINOE (ADEME)
// ================================

/**
 * Import from SINOE (ADEME waste management database)
 * https://www.sinoe.org/
 */
async function importSinoe(): Promise<number> {
  console.log('\n🗑️  Importing from SINOE (ADEME)...');
  console.log('─'.repeat(50));
  
  console.log('ℹ️  SINOE database:');
  console.log('   1. ADEME official database for waste management');
  console.log('   2. Includes: déchèteries, ressourceries, points de collecte');
  console.log('   3. Requires API access: https://www.sinoe.org/');
  console.log('   4. May require ADEME partnership');
  
  return 0;
}

// ================================
// MAIN EXECUTION
// ================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║      IMPORT DE VRAIES DONNÉES ESS (MULTI-SOURCES)           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('✅ Environment variables loaded from .env.local');

  const source = process.argv[2] || 'all';
  
  let totalInserted = 0;
  
  if (source === 'repair-cafe' || source === 'all') {
    const count = await importRepairCafes();
    totalInserted += count;
  }
  
  if (source === 'cocagne' || source === 'all') {
    const count = await importReseauCocagne();
    totalInserted += count;
  }
  
  if (source === 'amap' || source === 'all') {
    const count = await importAMAP();
    totalInserted += count;
  }
  
  if (source === 'insertion' || source === 'all') {
    const count = await importEntreprisesInsertion();
    totalInserted += count;
  }
  
  if (source === 'zerowaste' || source === 'all') {
    const count = await importZeroWaste();
    totalInserted += count;
  }
  
  if (source === 'sinoe' || source === 'all') {
    const count = await importSinoe();
    totalInserted += count;
  }
  
  console.log();
  console.log('═'.repeat(50));
  console.log(`📊 TOTAL: ${totalInserted} nouvelles initiatives importées`);
  console.log('═'.repeat(50));
  console.log();
  console.log('💡 PROCHAINES ÉTAPES:');
  console.log();
  console.log('1. 🔧 Repair Café:');
  console.log('   - Vérifier l\'API officielle sur repaircafe.org');
  console.log('   - Ou télécharger les données manuellement');
  console.log();
  console.log('2. 📋 Données gouvernementales:');
  console.log('   - Explorer Data.gouv.fr pour datasets ESS');
  console.log('   - Contacter ADEME pour accès SINOE');
  console.log();
  console.log('3. 🤝 Partenariats:');
  console.log('   - Réseau Cocagne (jardins d\'insertion)');
  console.log('   - MIRAMAP (AMAP)');
  console.log('   - Zero Waste France');
  console.log('   - CNEI (entreprises d\'insertion)');
  console.log();
  console.log('4. 🗺️  OpenStreetMap:');
  console.log('   - Continue d\'être la meilleure source pour friperies');
  console.log('   - Contribuer en retour (ajouter données manquantes)');
  console.log();
}

main().catch(console.error);
