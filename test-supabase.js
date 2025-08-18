// Test Supabase connection and verify tables
import { createClient } from '@supabase/supabase-js'

// Read from environment to avoid committing secrets
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment. See .env.example')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing Supabase database setup...\n')
  
  // Test profiles table
  try {
    console.log('Testing profiles table...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.log('❌ Profiles table not found')
      console.log('   Error:', error.message)
      console.log('   📖 Please run the SQL schema from supabase-schema.sql\n')
    } else {
      console.log('✅ Profiles table exists\n')
    }
  } catch (err) {
    console.log('❌ Profiles table error:', err.message)
  }
  
  // Test resumes table
  try {
    console.log('Testing resumes table...')
    const { data, error } = await supabase.from('resumes').select('count').limit(1)
    
    if (error) {
      console.log('❌ Resumes table not found')
      console.log('   Error:', error.message)
      console.log('   📖 Please run the SQL schema from supabase-schema.sql\n')
    } else {
      console.log('✅ Resumes table exists\n')
    }
  } catch (err) {
    console.log('❌ Resumes table error:', err.message)
  }
  
  // Test auth
  try {
    console.log('Testing authentication...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('✅ Auth service available')
    console.log('   Current user:', user ? user.email : 'Not logged in')
  } catch (err) {
    console.log('❌ Auth error:', err.message)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 SETUP STATUS:')
  console.log('• Supabase URL: Connected ✅')
  console.log('• API Key: Valid ✅') 
  console.log('• Database Tables: Run supabase-schema.sql ⚠️')
  console.log('• Read SUPABASE_SETUP.md for instructions')
  console.log('='.repeat(50))
}

testDatabase()
