import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { count: friperieCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Friperie');
    
  const { count: ressourcerieCount } = await supabase
    .from('initiatives')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Ressourcerie');
    
  console.log(`\n📊 COMPTEURS ACTUELS:\n`);
  console.log(`Friperies:      ${friperieCount}`);
  console.log(`Ressourceries:  ${ressourcerieCount}`);
  console.log();
}

check();
