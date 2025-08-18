import { ResumeData } from '@/store/useResume';

export async function generateServerPDF(resumeData: ResumeData, templateKey?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, templateKey, clientOrigin: window.location.origin }),
    });
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/pdf')) {
      const msg = await res.text().catch(() => '');
      console.error('Server PDF failed', res.status, msg);
      return false;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = String(resumeData.profile?.fullName || 'resume').replace(/[^a-z0-9-]+/gi, '_');
    a.href = url;
    a.download = `${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Server PDF error', e);
    return false;
  }
}
