import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

console.log('🔧 Initializing Supabase client...');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is not defined in environment variables');
  throw new Error('SUPABASE_URL is required');
}

if (!process.env.SUPABASE_API_KEY) {
  console.error('❌ SUPABASE_API_KEY is not defined in environment variables');
  throw new Error('SUPABASE_API_KEY is required');
}

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('SUPABASE_API_KEY:', process.env.SUPABASE_API_KEY ? '✓ Loaded' : '✗ Missing');

// Create regular Supabase client (for most operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

export default supabase;