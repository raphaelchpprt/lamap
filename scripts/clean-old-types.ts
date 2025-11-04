/**
 * Script to clean old initiative types from database
 * Removes initiatives with deprecated types:
 * - "Entreprise d'insertion"
 * - "Monnaie locale"
 * - EHPAD (if any)
 * - Maisons de retraite (if any)
 */

// Load environment variables
require('./load-env');

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Old types to remove
const OLD_TYPES = [
  "Entreprise d'insertion",
  'Monnaie locale',
  'EHPAD',
  'Maison de retraite',
  'Maisons de retraite',
];

async function main() {
  console.log('🧹 Cleaning old initiative types from database...\n');

  // 1. Count initiatives with old types
  console.log('📊 Checking for initiatives with old types...');
  const { data: oldInitiatives, error: countError } = await supabase
    .from('initiatives')
    .select('id, name, type')
    .in('type', OLD_TYPES);

  if (countError) {
    console.error('❌ Error counting old initiatives:', countError);
    process.exit(1);
  }

  if (!oldInitiatives || oldInitiatives.length === 0) {
    console.log('✅ No old initiatives found. Database is clean!');
    process.exit(0);
  }

  console.log(`\n📋 Found ${oldInitiatives.length} initiatives to remove:`);
  console.log('─'.repeat(60));

  // Group by type
  const byType: Record<string, number> = {};
  oldInitiatives.forEach((init) => {
    byType[init.type] = (byType[init.type] || 0) + 1;
  });

  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  • ${type}: ${count} initiative(s)`);
  });

  console.log('─'.repeat(60));

  // 2. List some examples
  console.log('\n📝 Examples:');
  oldInitiatives.slice(0, 5).forEach((init) => {
    console.log(`  - "${init.name}" (${init.type})`);
  });
  if (oldInitiatives.length > 5) {
    console.log(`  ... and ${oldInitiatives.length - 5} more`);
  }

  // 3. Ask for confirmation (in production, you'd use a prompt library)
  console.log('\n⚠️  WARNING: This will DELETE these initiatives permanently!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 4. Delete initiatives
  console.log('🗑️  Deleting initiatives...');
  const { error: deleteError } = await supabase
    .from('initiatives')
    .delete()
    .in('type', OLD_TYPES);

  if (deleteError) {
    console.error('❌ Error deleting initiatives:', deleteError);
    process.exit(1);
  }

  console.log(`✅ Successfully deleted ${oldInitiatives.length} initiatives`);
  console.log('\n🎉 Database cleaned!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
