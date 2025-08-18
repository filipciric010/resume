
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useResume } from '@/store/useResume';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CompactTemplate } from './templates/CompactTemplate';
import { ModernCompactTemplate } from './templates/ModernCompactTemplate';
import { PunkTemplate } from './templates/PunkTemplate';
import { TimelineTemplate } from './templates/TimelineTemplate';

// A4 dimensions for perfect PDF matching
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = Math.round((A4_WIDTH_MM / 25.4) * 96); // ~794px at 96 DPI
const A4_HEIGHT_PX = Math.round((A4_HEIGHT_MM / 25.4) * 96); // ~1123px at 96 DPI

interface ResumePreviewProps {
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ className }) => {
  const { data } = useResume();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = useState(1);
  const contentScaleRef = useRef(1);
  const outerContentRef = useRef<HTMLDivElement>(null);
  const [measureTick, setMeasureTick] = useState(0);

  useEffect(() => {
    contentScaleRef.current = contentScale;
  }, [contentScale]);

  // Auto-scale A4 page to fit container width (never upscale beyond 1)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      // Subtract actual horizontal padding so the page can truly fill visual width
      const cs = getComputedStyle(el);
      const padLeft = parseFloat(cs.paddingLeft || '0');
      const padRight = parseFloat(cs.paddingRight || '0');
      const availableWidth = entry.contentRect.width - (padLeft + padRight);
      if (availableWidth <= 0) return;
      const s = Math.min(1, availableWidth / A4_WIDTH_PX);
      setScale(s);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure inner content height at a stable width (matching render) and scale to fit A4 height
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Save/clear styles for measurement
    const prevTransform = el.style.transform;
    const prevWidth = el.style.width;
    el.style.transform = 'none';

    // Fixed-point iteration: measure with width tied to the scale we will render at
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
    let c = contentScaleRef.current || 1;
    for (let i = 0; i < 3; i++) {
      el.style.width = `${A4_WIDTH_PX / c}px`;
      const naturalHeight = el.scrollHeight || el.getBoundingClientRect().height;
      if (!naturalHeight) break;
      const raw = A4_HEIGHT_PX / naturalHeight;
      let next = clamp(raw, 0.6, 1.05);
      if (Math.abs(next - 1) < 0.01) next = 1;
      if (Math.abs(next - c) < 0.002) { c = next; break; }
      c = next;
    }

    // Restore styles
    el.style.transform = prevTransform;
    el.style.width = prevWidth;

    if (Math.abs(c - contentScaleRef.current) > 0.002) {
      setContentScale(Math.abs(c - 1) < 0.01 ? 1 : c);
    }
  }, [data, scale, measureTick]);

  // Recalculate after fonts and images load (mobile often lags font load)
  useEffect(() => {
    let imgs: HTMLImageElement[] = [];
    const forceMeasure = () => setMeasureTick((t) => t + 1);
    const fontSet = (document as unknown as { fonts?: FontFaceSet }).fonts;
    fontSet?.ready.then(forceMeasure).catch(() => {});
    if (contentRef.current) {
      imgs = Array.from(contentRef.current.querySelectorAll('img'));
      imgs.forEach((img) => img.addEventListener('load', forceMeasure, { once: true } as AddEventListenerOptions));
    }
    const onResize = () => forceMeasure();
    window.addEventListener('resize', onResize);
    return () => {
      imgs.forEach((img) => img.removeEventListener('load', forceMeasure));
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const renderTemplate = () => {
    const props = { data };
    
    switch (data.templateKey) {
      case 'classic':
        return <ClassicTemplate {...props} />;
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'compact':
        return <CompactTemplate {...props} />;
      case 'modern-compact':
        return <ModernCompactTemplate {...props} />;
      case 'punk':
        return <PunkTemplate {...props} />;
      case 'timeline':
        return <TimelineTemplate {...props} />;
      default:
        return <ModernTemplate {...props} />;
    }
  };

  return (
  <div ref={containerRef} className={`w-full flex items-start justify-center px-1 sm:px-4 py-2 sm:py-4 overflow-hidden ${className}`}>
      {/* Reserve scaled layout box to prevent overflow */}
      <div style={{ width: `${A4_WIDTH_PX * scale}px`, height: `${A4_HEIGHT_PX * scale}px` }}>
        {/* A4-sized container - Fixed dimensions, visually scaled to fit */}
        <div 
          className="bg-white shadow-2xl relative"
          data-resume-preview="true"
          style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${A4_HEIGHT_PX}px`,
            aspectRatio: `${A4_WIDTH_MM} / ${A4_HEIGHT_MM}`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            willChange: 'transform',
          }}
        >
        {/* Embedded JSON for filename extraction in legacy paths */}
        <script type="application/json" data-resume-data>
          {JSON.stringify(data)}
        </script>
        <div 
          className="w-full h-full"
          data-resume-content="true"
          ref={outerContentRef}
          style={{
            WebkitPrintColorAdjust: 'exact',
            colorAdjust: 'exact',
            printColorAdjust: 'exact',
            maxHeight: `${A4_HEIGHT_PX}px`,
            margin: 0,
            padding: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Inner wrapper that can scale to ensure content fills A4 height */}
          <div
            ref={contentRef}
            data-resume-scale-wrapper="true"
            style={{
              transform: `scale(${contentScale}) translateZ(0)`,
              transformOrigin: 'top left',
              // Always compensate width so visual width remains exactly A4 after scaling
              width: `${A4_WIDTH_PX / contentScale}px`,
              willChange: 'transform',
            }}
          >
            {renderTemplate()}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};