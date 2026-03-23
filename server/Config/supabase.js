import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.UPAHAN_KEY,
  process.env.SUPABASE_API_KEY
)

export default supabase
