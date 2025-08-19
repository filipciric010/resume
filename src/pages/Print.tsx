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

  // Debug logging
  console.log('[print-page] Payload received:', {
    hasPayload: !!payload,
    hasResumeData: !!payload.resumeData,
    hasStoreData: !!store?.data,
    finalData: !!data,
    templateKey,
    profileName: data?.profile?.fullName
  });

  useEffect(() => {
    let cancelled = false;
    const prep = async () => {
      console.log('[print-page] Starting print preparation...');
      try {
        // Ensure web fonts are fully loaded so text metrics match preview
        const fontSet = (document as unknown as { fonts?: FontFaceSet }).fonts;
        if (fontSet) {
          console.log('[print-page] Waiting for fonts to load...');
          await fontSet.ready;
          console.log('[print-page] Fonts loaded successfully');
        }
      } catch (error) {
        console.warn('[print-page] Font loading failed:', error);
      }
      
      // Wait for content to be rendered
      console.log('[print-page] Waiting for content to be rendered...');
      let contentCheckAttempts = 0;
      const maxAttempts = 50; // 5 seconds max
      
      while (contentCheckAttempts < maxAttempts && !cancelled) {
        const templates = document.querySelectorAll('[class*="template"], .resume-preview');
        const hasContent = Array.from(templates).some(template => 
          template.textContent && template.textContent.trim().length > 100
        );
        
        if (hasContent) {
          console.log('[print-page] Content detected, templates found:', templates.length);
          break;
        }
        
        await new Promise((r) => setTimeout(r, 100));
        contentCheckAttempts++;
      }
      
      // Additional delay for layout/paint
      console.log('[print-page] Waiting for layout to settle...');
      await new Promise((r) => setTimeout(r, 200));
      
      if (!cancelled) {
        console.log('[print-page] Setting ready state to true');
        setReady(true);
      }
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
    <div className="print-root" data-print-ready={ready ? 'true' : 'false'}>
      <div className="print-page">
        <div className="print-content">
          <Template data={data} />
        </div>
      </div>
      {/* Debug indicator - will be hidden in print CSS */}
      {!ready && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          left: '10px', 
          background: 'orange', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '3px',
          fontSize: '12px',
          zIndex: 9999 
        }}>
          Loading for PDF...
        </div>
      )}
    </div>
  );
}
