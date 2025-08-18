# Supabase Database Setup Instructions

## Step 1: Access your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: `fwczldxffndmfvoyztne`

## Step 2: Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New Query" to create a new SQL query

## Step 3: Run the Schema
1. Copy the contents of `supabase-schema.sql` file
2. Paste it into the SQL Editor
3. Click "Run" to execute the schema

## Step 4: Verify Tables Created
1. Go to "Table Editor" in the left sidebar
2. You should see:
   - `profiles` table
   - `resumes` table

## Step 5: Test Authentication
1. Go back to your app at http://localhost:8080
2. Try signing up with a test email
3. Check the "Authentication" tab in Supabase to see the new user
4. Check the "profiles" table to see the auto-created profile

## What the Schema Creates:

### `profiles` table:
- Stores user profile information
- Auto-created when user signs up
- Links to Supabase Auth users

### `resumes` table:
- Stores resume data as JSONB
- Multiple resumes per user
- Public sharing capability
- Row Level Security enabled

### Security Features:
- Row Level Security (RLS) enabled
- Users can only access their own data
- Public resumes can be viewed by anyone
- Automatic profile creation on signup

## Troubleshooting:
If you get any errors, you can run the schema in smaller chunks:
1. First run the CREATE TABLE statements
2. Then run the RLS policies
3. Finally run the functions and triggers

## Next Steps:
After running the schema, your authentication will be fully connected to Supabase!
