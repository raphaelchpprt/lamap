/**
 * Test script to verify get_initiatives_in_bounds function exists in Supabase
 */

// Load environment variables
require('./load-env');

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFunction() {
  console.log('🧪 Testing get_initiatives_in_bounds function...\n');

  // Test with France bounding box
  const { data, error } = (await supabase.rpc(
    'get_initiatives_in_bounds' as never,
    {
      p_west: -5.5,
      p_south: 41.0,
      p_east: 10.0,
      p_north: 51.5,
      p_types: null,
      p_verified_only: false,
      p_limit: 10,
    } as never
  )) as { data: any[] | null; error: any | null };

  if (error) {
    console.error('❌ Error calling function:');
    console.error(error);
    process.exit(1);
  }

  console.log('✅ Function works!');
  console.log(`📊 Returned ${data?.length || 0} initiatives\n`);

  if (data && data.length > 0) {
    console.log('📋 Sample initiative:');
    console.log(JSON.stringify(data[0], null, 2));

    // Count by type
    const typeCounts = data.reduce((acc: any, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Types distribution:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  }
}

testFunction().catch(console.error);
