# Demo Mode Setup

This app supports a demo mode that allows users to use all features without authentication.

## Enable Demo Mode

Create a `.env` file in the root directory with:

```bash
VITE_DEMO=true
```

## What Demo Mode Does

✅ **Bypasses Authentication**
- Users can access all pages without logging in
- No Supabase configuration required
- Auth modals are automatically skipped

✅ **Unlocks All Features**  
- Pro features are enabled by default
- AI features work (with mock responses if no OpenAI key)
- PDF export works normally

✅ **Visual Indicators**
- Demo mode banner in TopBar
- "Demo User" indicator instead of login button
- Clear messaging about demo status

## Development Commands

```bash
# Start in demo mode
VITE_DEMO=true npm run dev

# Or set in .env file
echo "VITE_DEMO=true" > .env
npm run dev
```

## Production Deployment

For production demo deployments:

1. Set `VITE_DEMO=true` in your environment
2. All other API keys are optional
3. Users can try the full app without signup

## Disabling Demo Mode

Simply remove `VITE_DEMO=true` or set `VITE_DEMO=false` to require authentication.
