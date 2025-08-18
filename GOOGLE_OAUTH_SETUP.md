# Google OAuth Setup Instructions

## Step 1: Configure Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open Authentication Settings**
   - In the left sidebar, click "Authentication"
   - Click "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Click the toggle to enable it
   - You'll see a form asking for:
     - Client ID
     - Client Secret

## Step 2: Create Google OAuth Application

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - If you don't have a project, create one
   - Or select an existing project

3. **Enable Google+ API** (if not already enabled)
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and enable

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Give it a name (e.g., "Resume Builder")

5. **Configure Authorized Redirect URIs**
   Add these redirect URIs:
   ```
   https://fwczldxffndmfvoyztne.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback (for local development)
   ```

6. **Copy Client ID and Secret**
   - After creation, you'll see your Client ID and Client Secret
   - Copy both values

## Step 3: Configure Supabase with Google Credentials

1. **Return to Supabase Dashboard**
   - Go back to Authentication → Providers → Google

2. **Enter Google Credentials**
   - Paste your Client ID in the "Client ID" field
   - Paste your Client Secret in the "Client Secret" field
   - Click "Save"

## Step 4: Test Google OAuth

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Try Google Sign In**
   - Go to http://localhost:8080
   - Click "Sign In" 
   - Click "Continue with Google"
   - You should be redirected to Google for authentication

## Step 5: Production Setup

For production deployment, you'll need to:

1. **Update Authorized Redirect URIs** in Google Cloud Console:
   ```
   https://yourdomain.com/auth/callback
   ```

2. **Update the redirect URL** in AuthContext.tsx:
   ```typescript
   redirectTo: `https://yourdomain.com/auth/callback`
   ```

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Check that your redirect URIs in Google Cloud Console match exactly
   - Make sure you've added both local and production URLs

2. **"Invalid client" error**
   - Verify Client ID and Secret are correct in Supabase
   - Ensure Google+ API is enabled

3. **Callback not working**
   - Check that the `/auth/callback` route exists in your app
   - Verify the AuthCallback component is handling the redirect properly

### Success Indicators:

✅ Google OAuth provider enabled in Supabase
✅ Google Cloud project created with OAuth credentials  
✅ Redirect URIs configured correctly
✅ Client ID and Secret saved in Supabase
✅ Users can sign in with Google button
✅ Users are redirected back to your app after authentication

## Current Implementation Features:

- ✅ "Continue with Google" button on both login and signup forms
- ✅ Proper OAuth flow with redirect handling
- ✅ Automatic profile creation for Google users
- ✅ Seamless integration with existing email/password auth
- ✅ Professional UI with Google branding colors
- ✅ Loading states and error handling
- ✅ Mobile-responsive design

After completing these steps, users will be able to sign in with their Google accounts in addition to email/password!
