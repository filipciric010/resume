import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080';

app.post('/api/pdf', async (req, res) => {
  try {
  const { resumeData, templateKey, clientOrigin } = req.body || {};
    if (!resumeData || !resumeData.profile?.fullName) {
      return res.status(400).json({ error: 'Missing resumeData' });
    }

  const payload = { resumeData, templateKey };
  const origin = (typeof clientOrigin === 'string' && clientOrigin) || req.get('origin') || CLIENT_ORIGIN;
  const url = `${origin}/print`;
  console.log('[PDF] Using client origin:', origin);
  console.log('[PDF] Navigating to:', url);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((pl: unknown) => {
      (window as unknown as { __PRINT_PAYLOAD__?: unknown }).__PRINT_PAYLOAD__ = pl;
    }, payload);
  // Use A4 logical size at ~96 DPI to match the print CSS box
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await page.emulateMediaType('print');
  await page.setCacheEnabled(false);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for the print-ready flag
    await page.waitForSelector('[data-print-ready="true"]', { timeout: 10000 });

    const pdfBuffer = await page.pdf({
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      scale: 1,
      pageRanges: '',
    });

    // Heuristic: if the generated PDF is too small, it's likely blank. Fail and let client fallback handle it.
    if (!pdfBuffer || pdfBuffer.length < 20000) {
      await browser.close();
      console.error('[PDF] Generated PDF buffer too small:', pdfBuffer?.length);
      return res.status(500).json({ error: 'PDF generation produced empty output' });
    }

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(resumeData.profile.fullName || 'resume').replace(/[^a-z0-9-]+/gi,'_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: unknown) {
    console.error('PDF generation failed', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'PDF generation failed', details: message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.type('text/plain').send('PDF server is running. Try GET /api/health or POST /api/pdf');
});

app.listen(PORT, () => {
  console.log(`PDF server running on http://localhost:${PORT}`);
});
