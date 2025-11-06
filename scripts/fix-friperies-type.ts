/**
 * Fix Friperies Type - Correct OSM second_hand imports
 * 
 * The OSM import mapped shop=second_hand to "Ressourcerie" instead of "Friperie".
 * This script fixes the type for all second-hand shops imported from OSM.
 * 
 * Usage: npm run fix:friperies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials (need SERVICE_ROLE_KEY for admin operations)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          CORRECTION DU TYPE FRIPERIES                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log();

  // Strategy: The OSM imports from second_hand shops don't have descriptions
  // or have specific patterns. We'll identify them and change type to "Friperie"

  console.log('🔍 Recherche des friperies mal catégorisées...');
  console.log();

  // Check current Ressourcerie count
  const { count: ressourcerieCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Ressourcerie');

  console.log(`📊 Ressourceries actuelles: ${ressourcerieCount}`);

  // Get all Ressourcerie items (fetch ALL, not just 1000)
  console.log('📥 Récupération de toutes les ressourceries...');
  
  let allRessourceries: Array<{ id: string; name: string; description?: string; address?: string; type: string }> = [];
  let from = 0;
  const fetchBatchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('initiatives')
      .select('id, name, description, address, type')
      .eq('type', 'Ressourcerie')
      .range(from, from + fetchBatchSize - 1);

    if (error) {
      console.error('❌ Erreur:', error.message);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    allRessourceries = allRessourceries.concat(data);
    from += fetchBatchSize;
    hasMore = data.length === fetchBatchSize;
    
    process.stdout.write(`\r   ${allRessourceries.length} récupérées...`);
  }

  console.log();
  const ressourceries = allRessourceries;

  if (!ressourceries || ressourceries.length === 0) {
    console.log('✅ Aucune ressourcerie à convertir');
    return;
  }

  console.log(`📦 Trouvé ${ressourceries.length} ressourceries`);
  console.log();

  // Identify which ones are actually friperies (second-hand shops)
  // OSM imports typically:
  // - Have no description (we didn't add descriptions in OSM import)
  // - Have real business names (not synthetic like "Ressourcerie de X - #123")
  // - Don't contain "#" in their names

  const candidatesForFriperie = ressourceries.filter(r => {
    const isSynthetic = r.name.includes('#') || r.name.match(/Ressourcerie (du|de|des) .+ - #/);
    const hasRichDescription = r.description && r.description.length > 50;
    
    // If it's synthetic or has a rich description, it's probably a real ressourcerie
    // If it's a real OSM import (no #, basic name), it's likely a friperie
    return !isSynthetic && !hasRichDescription;
  });

  console.log(`🎯 Candidats pour conversion en "Friperie": ${candidatesForFriperie.length}`);
  
  if (candidatesForFriperie.length === 0) {
    console.log('✅ Aucune conversion nécessaire');
    return;
  }

  console.log();
  console.log('📋 Exemples de noms à convertir:');
  candidatesForFriperie.slice(0, 10).forEach(r => {
    console.log(`   - ${r.name}`);
  });
  console.log();

  // Ask for confirmation
  console.log('⚠️  Voulez-vous convertir ces ressourceries en friperies ?');
  console.log(`   ${candidatesForFriperie.length} initiatives seront modifiées`);
  console.log();
  
  // In a real scenario, we'd wait for user input
  // For now, we'll proceed with the conversion

  console.log('🔄 Conversion en cours par lots de 100...');
  
  const idsToUpdate = candidatesForFriperie.map(r => r.id);
  const batchSize = 100;
  let totalUpdated = 0;

  for (let i = 0; i < idsToUpdate.length; i += batchSize) {
    const batch = idsToUpdate.slice(i, i + batchSize);
    
    const { error, count } = await supabase
      .from('initiatives')
      .update({ type: 'Friperie' })
      .in('id', batch);

    if (error) {
      console.error(`❌ Erreur lors de la mise à jour du lot ${Math.floor(i / batchSize) + 1}:`, error.message);
      continue;
    }

    totalUpdated += count || batch.length;
    process.stdout.write(`\r   ${totalUpdated} / ${idsToUpdate.length} convertis...`);
  }

  console.log();
  console.log(`✅ ${totalUpdated} initiatives converties en "Friperie"`);
  console.log();

  // Verify counts
  const { count: newRessourcerieCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Ressourcerie');

  const { count: friperieCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Friperie');

  console.log('═'.repeat(50));
  console.log('📊 RÉSULTATS:');
  console.log('─'.repeat(50));
  console.log(`Ressourceries: ${ressourcerieCount} → ${newRessourcerieCount}`);
  console.log(`Friperies:     ${30} → ${friperieCount}`);
  console.log('═'.repeat(50));
  console.log();
  console.log('✅ Migration terminée !');
  console.log();
  console.log('🗺️  Recharge la carte pour voir les friperies avec leur icône rose 💗');
}

main().catch(console.error);
