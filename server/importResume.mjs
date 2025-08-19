import multer from 'multer';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Dynamic import for pdf-parse to avoid startup issues
let pdfParse;
const initPdfParse = async () => {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
};

// Schema that exactly matches the client ResumeData type
const ResumeSchema = z.object({
  profile: z.object({
    fullName: z.string().default(''),
    email: z.string().default(''),
    phone: z.string().optional(),
    location: z.string().optional(),
    headline: z.string().optional(),
    links: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }).default({}),
  experience: z.array(z.object({
    id: z.string().optional(),
    role: z.string(),
    company: z.string(),
    start: z.string(),
    end: z.string().optional(),
    bullets: z.array(z.object({
      id: z.string().optional(),
      text: z.string(),
    })),
  })).default([]),
  education: z.array(z.object({
    id: z.string().optional(),
    school: z.string(),
    degree: z.string(),
    start: z.string(),
    end: z.string().optional(),
  })).default([]),
  skills: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    level: z.enum(['basic', 'intermediate', 'advanced', 'expert']).optional(),
  })).default([]),
  projects: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    url: z.string().optional(),
  })).default([]),
  certifications: z.array(z.string()).default([]),
  templateKey: z.enum(['classic', 'modern', 'compact', 'modern-compact', 'punk', 'timeline']).default('modern'),
});

function buildSystemPrompt() {
  return `You are an expert resume parser. Extract structured ResumeData from the provided text or image.

Output ONLY valid JSON matching this EXACT schema:
{
  "profile": {
    "fullName": string,
    "email": string,
    "phone": string (optional),
    "location": string (optional),
    "headline": string (optional),
    "summary": string (optional),
    "links": [string] (optional)
  },
  "experience": [{
    "role": string,
    "company": string,
    "start": string, // YYYY-MM format
    "end": string, // YYYY-MM format or "Present" or empty for current
    "bullets": [{
      "text": string
    }]
  }],
  "education": [{
    "school": string,
    "degree": string,
    "start": string, // YYYY-MM format
    "end": string // YYYY-MM format or empty for ongoing
  }],
  "skills": [{
    "name": string,
    "level": "basic" | "intermediate" | "advanced" | "expert" (optional)
  }],
  "projects": [{
    "name": string,
    "description": string,
    "technologies": [string],
    "url": string (optional)
  }],
  "certifications": [string],
  "templateKey": "modern"
}

CRITICAL RULES:
- Use YYYY-MM format for all dates (e.g., "2023-01", "2021-09")
- If exact dates unavailable, estimate reasonably
- For bullets, use array of objects with "text" property, NOT plain strings
- Infer skill levels when possible based on context
- Extract ALL relevant information, don't skip sections
- For current positions, use "Present" or leave end date empty
- Deduplicate skills and normalize formatting
- For images, OCR all visible text accurately
- Always include templateKey as "modern"`;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PDF, PNG, and JPEG files are allowed.'));
    }
  },
});

export default function mountImportEndpoint(app) {
  app.post('/api/import-resume', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('[import-resume] Multer error:', err);
        return res.status(400).json({ 
          error: 'File upload failed',
          details: err.message || 'Invalid file or file too large.'
        });
      }
      next();
    });
  }, async (req, res) => {
    console.log('[import-resume] Request received:', {
      method: req.method,
      fileOriginalName: req.file?.originalname,
      fileMimetype: req.file?.mimetype,
      fileSize: req.file?.size,
    });

    try {
      if (!req.file) {
        console.log('[import-resume] No file detected');
        return res.status(400).json({ 
          error: 'No file uploaded',
          details: 'Please select a PDF, PNG, or JPEG file to upload.'
        });
      }

      const file = req.file;
      console.log('[import-resume] File received:', {
        name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      const isPdf = file.mimetype === 'application/pdf';
      const isImage = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype);

      if (!isPdf && !isImage) {
        return res.status(400).json({ 
          error: 'Unsupported file type',
          details: 'Only PDF, PNG, and JPEG files are supported.'
        });
      }

      let text = '';

      if (isPdf) {
        console.log('[import-resume] Starting PDF extraction');
        try {
          const pdfParseFunc = await initPdfParse();
          const pdfData = await pdfParseFunc(file.buffer);
          text = pdfData.text;
          console.log('[import-resume] PDF text extracted, length:', text.length);
        } catch (pdfError) {
          console.error('[import-resume] PDF parsing failed:', pdfError);
          return res.status(400).json({ 
            error: 'Failed to parse PDF',
            details: 'The PDF file could not be read. Please ensure it contains text and is not password protected.'
          });
        }
      }

      // Validate OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        console.error('[import-resume] OpenAI API key not configured');
        return res.status(500).json({ 
          error: 'AI service not configured',
          details: 'The resume parsing service is currently unavailable. Please try again later.'
        });
      }

      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      let messages;

      if (isPdf && text.length > 50) {
        // Use extracted PDF text
        console.log('[import-resume] Using extracted PDF text for analysis');
        messages = [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: `Extract structured resume data from this text:\n\n${text}` },
        ];
      } else if (isImage) {
        // Use image analysis
        console.log('[import-resume] Using image analysis for resume parsing');
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        messages = [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: [
            { type: 'text', text: 'Extract structured resume data from this image. Read all visible text carefully and organize it according to the schema.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ] },
        ];
      } else {
        // Fallback for PDFs with little text - treat as image
        console.log('[import-resume] PDF has minimal text, treating as image');
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        messages = [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: [
            { type: 'text', text: 'This appears to be a PDF with minimal extractable text. Please analyze it as an image and extract all visible resume information.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ] },
        ];
      }

      console.log('[import-resume] Sending request to OpenAI API');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ 
          model, 
          messages, 
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[import-resume] OpenAI API error:', response.status, errorData);
        return res.status(500).json({ 
          error: 'AI processing failed',
          details: `Failed to process resume with AI service. Status: ${response.status}`
        });
      }

      const data = await response.json();
      console.log('[import-resume] OpenAI API response received successfully');

      if (!data.choices?.[0]?.message?.content) {
        console.error('[import-resume] Invalid OpenAI response format');
        return res.status(500).json({ 
          error: 'Invalid AI response',
          details: 'The AI service returned an unexpected response format.'
        });
      }

      let jsonContent = data.choices[0].message.content;
      
      // Clean up the JSON response
      jsonContent = jsonContent.replace(/```json\n?|\n?```/g, '').trim();
      
      // Remove any leading/trailing text that might not be JSON
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonContent);
        console.log('[import-resume] JSON parsed successfully');
      } catch (parseError) {
        console.error('[import-resume] JSON parsing failed:', parseError, 'Content:', jsonContent.substring(0, 500));
        return res.status(500).json({ 
          error: 'Failed to parse AI response',
          details: 'The AI service returned malformed data. Please try again with a clearer resume.'
        });
      }

      // Validate and normalize the data
      let validated;
      try {
        validated = ResumeSchema.parse(parsed);
        console.log('[import-resume] Schema validation successful');
      } catch (validationError) {
        console.error('[import-resume] Schema validation failed:', validationError);
        return res.status(500).json({ 
          error: 'Invalid resume data format',
          details: 'The extracted resume data does not match the expected format. Please try again.'
        });
      }

      // Add missing IDs and normalize structure
      const normalized = {
        ...validated,
        experience: validated.experience.map(exp => ({
          ...exp,
          id: exp.id || uuidv4(),
          bullets: exp.bullets.map(bullet => ({
            id: bullet.id || uuidv4(),
            text: typeof bullet === 'string' ? bullet : bullet.text,
          })),
        })),
        education: validated.education.map(edu => ({
          ...edu,
          id: edu.id || uuidv4(),
        })),
        skills: validated.skills.map(skill => ({
          ...skill,
          id: skill.id || uuidv4(),
        })),
        projects: (validated.projects || []).map(proj => ({
          ...proj,
          id: proj.id || uuidv4(),
        })),
        certifications: validated.certifications || [],
      };

      console.log('[import-resume] Resume data normalized successfully');
      return res.json({ 
        success: true,
        data: normalized,
        message: 'Resume imported successfully'
      });

    } catch (error) {
      console.error('[import-resume] Unexpected error:', error);
      return res.status(500).json({ 
        error: 'Import failed',
        details: error.message || 'An unexpected error occurred during resume import.'
      });
    }
  });
}
