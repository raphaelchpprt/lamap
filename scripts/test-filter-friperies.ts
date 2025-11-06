/**
 * Test script to verify Friperies are returned by get_initiatives_in_bounds
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFilterFriperies() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     TEST: Friperies Filter in get_initiatives_in_bounds');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // France bounds
  const west = -5.5;
  const south = 41.0;
  const east = 10.0;
  const north = 51.5;

  console.log('🗺️  Testing France-wide bounds:');
  console.log(`   West: ${west}, South: ${south}, East: ${east}, North: ${north}\n`);

  // Test 1: Get ALL initiatives (no type filter)
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 1: No type filter (should return all types)');
  console.log('═══════════════════════════════════════════════════════');

  const { data: allData, error: allError } = await supabase.rpc(
    'get_initiatives_in_bounds',
    {
      p_west: west,
      p_south: south,
      p_east: east,
      p_north: north,
      p_types: null,
      p_verified_only: false,
      p_limit: 50000,
    }
  );

  if (allError) {
    console.error('❌ Error:', allError.message);
  } else {
    console.log(`✅ Total initiatives: ${allData.length}`);
    
    // Count by type
    const typeCounts: Record<string, number> = {};
    allData.forEach((item: any) => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    console.log('\n📊 Breakdown by type:');
    Object.entries(typeCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .forEach(([type, count]) => {
        const bar = '█'.repeat(Math.min(50, Math.floor((count as number) / 100)));
        console.log(`   ${type.padEnd(25)} ${String(count).padStart(5)} ${bar}`);
      });

    const friperieCount = typeCounts['Friperie'] || 0;
    if (friperieCount > 0) {
      console.log(`\n✅ Friperies found: ${friperieCount}`);
    } else {
      console.log('\n❌ NO FRIPERIES FOUND!');
    }
  }

  // Test 2: Filter ONLY Friperies
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 2: Filter by type = [\'Friperie\']');
  console.log('═══════════════════════════════════════════════════════');

  const { data: friperiesData, error: friperiesError } = await supabase.rpc(
    'get_initiatives_in_bounds',
    {
      p_west: west,
      p_south: south,
      p_east: east,
      p_north: north,
      p_types: ['Friperie'],
      p_verified_only: false,
      p_limit: 50000,
    }
  );

  if (friperiesError) {
    console.error('❌ Error:', friperiesError.message);
  } else {
    console.log(`✅ Friperies returned: ${friperiesData.length}`);

    if (friperiesData.length > 0) {
      console.log('\n📋 Sample friperies (first 10):');
      friperiesData.slice(0, 10).forEach((friperie: any, index: number) => {
        console.log(`   ${index + 1}. ${friperie.name} (${friperie.address || 'No address'})`);
      });
    } else {
      console.log('\n❌ NO FRIPERIES RETURNED BY FILTERED QUERY!');
      console.log('   This means the SQL function filter is not working correctly.');
    }
  }

  // Test 3: Direct count from database
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 3: Direct count from initiatives table');
  console.log('═══════════════════════════════════════════════════════');

  const { count: directCount, error: countError } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Friperie');

  if (countError) {
    console.error('❌ Error:', countError.message);
  } else {
    console.log(`✅ Direct count of Friperies in DB: ${directCount}`);
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`Database has: ${directCount} Friperies`);
  console.log(`No filter returned: ${(allData || []).filter((i: any) => i.type === 'Friperie').length} Friperies`);
  console.log(`With filter returned: ${(friperiesData || []).length} Friperies`);

  if (directCount && directCount > 0) {
    if ((friperiesData || []).length === 0) {
      console.log('\n🚨 PROBLEM: Database has Friperies but filtered query returns NONE!');
      console.log('   → The SQL function filter is broken or RLS is blocking');
    } else if ((friperiesData || []).length < directCount) {
      console.log('\n⚠️  WARNING: Filtered query returns fewer Friperies than database has');
      console.log(`   → Possible limit issue or spatial bounds too restrictive`);
    } else {
      console.log('\n✅ SUCCESS: Filter works correctly!');
    }
  }
}

testFilterFriperies()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  });
