# Import Resume Feature Setup Guide

## Overview
The import resume feature allows users to upload PDF, PNG, or JPEG files and automatically extract resume information using AI. This guide will help you set up and run the feature correctly.

## Current Status ✅
- ✅ Server is configured and running on port 3001
- ✅ Import endpoint is properly mounted at `/api/import-resume`
- ✅ Vite proxy is configured to forward `/api` requests to the server
- ✅ All required dependencies are installed
- ✅ OpenAI API is configured and working

## Prerequisites

### 1. Environment Variables
You need to set up environment variables for the OpenAI API. Create a `.env` file in your project root:

```env
# OpenAI Configuration for Resume Import Feature
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Server Configuration
PORT=3001

# Client Configuration
CLIENT_ORIGIN=http://localhost:8080

# Optional: Set to development for local testing
NODE_ENV=development
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key from https://platform.openai.com/api-keys

### 2. Dependencies
All required dependencies are already installed:
- `multer` - for file uploads
- `pdf-parse` - for PDF text extraction
- `concurrently` - for running client and server together

## How to Run

### Option 1: Run Both Client and Server (Recommended)
```bash
npm run dev
```
This will start:
- Vite client on http://localhost:8080
- Node.js server on http://localhost:3001

### Option 2: Run Separately (For Debugging)
Terminal 1 (Client):
```bash
npm run dev:client
```

Terminal 2 (Server):
```bash
npm run dev:server
```

## How the Import Feature Works

1. **User clicks "Import Resume" button** in the `/editor` page
2. **File upload dialog** appears accepting PDF, PNG, or JPEG files (max 10MB)
3. **File is sent** to `/api/import-resume` endpoint via Vite proxy
4. **Server processes** the file:
   - For PDFs: Extracts text using `pdf-parse`
   - For images: Uses OpenAI Vision API
   - For text PDFs: Uses OpenAI text completion
5. **AI extracts** structured resume data (profile, experience, education, skills, projects, certifications)
6. **Data is returned** and automatically populates the resume form

## Troubleshooting

### Error: ECONNREFUSED
- **Cause**: Server is not running on port 3001
- **Solution**: Run `npm run dev` or `npm run dev:server`

### Error: AI not configured
- **Cause**: Missing or invalid OpenAI API key
- **Solution**: Set `OPENAI_API_KEY` in your `.env` file

### Error: No data returned
- **Cause**: AI failed to parse the document
- **Solutions**: 
  - Try a clearer image
  - Ensure PDF has selectable text
  - Check OpenAI API quota/billing

### Error: Unsupported file type
- **Cause**: File is not PDF, PNG, or JPEG
- **Solution**: Convert file to supported format

## API Endpoints

- `GET /api/health` - Check server status and AI configuration
- `POST /api/import-resume` - Upload and parse resume file

## File Size Limits
- Maximum file size: 10MB
- Supported formats: PDF, PNG, JPEG

## Testing the Setup

1. **Check server health**:
   ```bash
   node -e "fetch('http://localhost:3001/api/health').then(r=>r.json()).then(console.log)"
   ```
   Should return: `{ ok: true, ai: true }`

2. **Test in browser**:
   - Go to http://localhost:8080/editor
   - Click "Import Resume" button
   - Upload a test resume file
   - Verify data populates correctly

## Security Notes
- Files are processed in memory only (not saved to disk)
- OpenAI API calls include file content for processing
- CORS is configured for localhost:8080 only
- Rate limiting is applied to API endpoints

## Need Help?
If you encounter issues:
1. Check that both client and server are running
2. Verify your OpenAI API key is valid and has credits
3. Check browser console for client-side errors
4. Check server logs for backend errors

