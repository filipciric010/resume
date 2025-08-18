import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useResume, type ResumeData } from '@/store/useResume';
import { ModernTemplate } from '@/components/templates/ModernTemplate';
import { ClassicTemplate } from '@/components/templates/ClassicTemplate';
import { CompactTemplate } from '@/components/templates/CompactTemplate';
import { ModernCompactTemplate } from '@/components/templates/ModernCompactTemplate';
import { PunkTemplate } from '@/components/templates/PunkTemplate';
import { TimelineTemplate } from '@/components/templates/TimelineTemplate';
import '@/styles/print.css';

type PrintPayload = {
  resumeData?: ResumeData;
  templateKey?: ResumeData['templateKey'];
};

declare global {
  interface Window { __PRINT_PAYLOAD__?: PrintPayload }
}

export default function PrintPage() {
  const location = useLocation();
  const [ready, setReady] = useState(false);

  const payload = useMemo<PrintPayload>(() => {
    if (typeof window !== 'undefined' && window.__PRINT_PAYLOAD__) {
      return window.__PRINT_PAYLOAD__ as PrintPayload;
    }
    const params = new URLSearchParams(location.search);
    const b64 = params.get('doc');
    if (b64) {
      try {
        const parsed = JSON.parse(atob(b64)) as PrintPayload;
        return parsed || {};
      } catch (e) {
        console.error('Failed to decode print payload', e);
      }
    }
    return {};
  }, [location.search]);

  const store = useResume.getState();
  const data = payload.resumeData ?? store?.data;
  const templateKey = payload.templateKey ?? data?.templateKey ?? 'modern';

  useEffect(() => {
    let cancelled = false;
    const prep = async () => {
      try {
        // Ensure web fonts are fully loaded so text metrics match preview
        const fontSet = (document as unknown as { fonts?: FontFaceSet }).fonts;
        await fontSet?.ready;
      } catch {
        // ignore
      }
      // Small delay to allow final layout/paint
      await new Promise((r) => setTimeout(r, 50));
      if (!cancelled) setReady(true);
    };
    prep();
    return () => { cancelled = true; };
  }, []);

  const Template = useMemo(() => {
    switch (templateKey) {
      case 'classic': return ClassicTemplate;
      case 'compact': return CompactTemplate;
      case 'modern-compact': return ModernCompactTemplate;
  case 'punk': return PunkTemplate;
  case 'timeline': return TimelineTemplate;
      case 'modern':
      default: return ModernTemplate;
    }
  }, [templateKey]);

  if (!data) {
    return <div className="print-root"><div className="print-page"><div className="print-content">No resume data.</div></div></div>
  }

  return (
    <div className="print-root" data-print-ready={ready ? 'true' : undefined}>
      <div className="print-page">
        <div className="print-content">
          <Template data={data} />
        </div>
      </div>
    </div>
  );
}
