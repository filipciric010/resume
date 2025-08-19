import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeData } from '@/store/useResume';

// A4 dimensions constants
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = Math.round((A4_WIDTH_MM / 25.4) * 96); // ~794px at 96 DPI
const A4_HEIGHT_PX = Math.round((A4_HEIGHT_MM / 25.4) * 96); // ~1123px at 96 DPI

// Main export function - simplified and reliable
export async function downloadPDF(data: ResumeData, templateKey: string = 'modern'): Promise<boolean> {
  try {
    console.log('Starting PDF generation...');
    
    // Find the resume preview element
  // Capture the inner A4 content to avoid outer shadow padding
  const previewElement = document.querySelector('[data-resume-content="true"]') as HTMLElement;
    
    if (!previewElement) {
      console.error('❌ Resume preview element not found');
      return false;
    }

    console.log('✅ Found preview element');
    console.log('📐 Element dimensions:', {
      width: previewElement.offsetWidth,
      height: previewElement.offsetHeight,
      scrollWidth: previewElement.scrollWidth,
      scrollHeight: previewElement.scrollHeight
    });

    // Wait for fonts and any pending renders
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('📸 Capturing element at natural A4 size...');
    // Temporarily disable responsive scaling on the resume content
    const resumeContent = previewElement.querySelector('.resume-preview') as HTMLElement | null;
    const originalTransform = resumeContent?.style.transform;
    const originalTransformOrigin = resumeContent?.style.transformOrigin;
    if (resumeContent) {
      resumeContent.style.transform = 'none';
      resumeContent.style.transformOrigin = 'top left';
      resumeContent.style.width = '100%';
      resumeContent.style.height = '100%';
    }

  const canvas = await captureAsCanvas(previewElement, 2);

    // Restore original styles
    if (resumeContent) {
      resumeContent.style.transform = originalTransform || '';
      resumeContent.style.transformOrigin = originalTransformOrigin || '';
    }

    console.log('✅ Canvas created:', {
      width: canvas.width,
      height: canvas.height
    });

    if (canvas.width === 0 || canvas.height === 0) {
      console.error('❌ Canvas has zero dimensions');
      return false;
    }

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    if (imgData.length < 1000) {
      console.error('❌ Image data too small');
      return false;
    }
    
  // Create A4 PDF with page size from jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false,
    });

  // Fit image to actual page size to avoid scaling mismatches
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST');

    // Generate filename
    const fileName = data.profile?.fullName
      ? `resume-${data.profile.fullName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`
      : 'resume.pdf';

    console.log('💾 Saving PDF as:', fileName);
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return false;
  }
}

// Alternative function for enhanced quality
export async function downloadPDFHighQuality(data: ResumeData): Promise<boolean> {
  try {
    console.log('Starting high-quality PDF generation...');
    
  const previewElement = document.querySelector('[data-resume-content="true"]') as HTMLElement;
    
    if (!previewElement) {
      console.error('❌ Resume preview element not found');
      return false;
    }

    // Wait for everything to load
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 2000));

  // Create a temporary clone with explicit A4 sizing to avoid transforms/overflow
  const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
  tempContainer.style.top = '-10000px';
    tempContainer.style.left = '0';
  // Use the actual rendered size of the preview to avoid scale issues
  tempContainer.style.width = `${previewElement.offsetWidth}px`;
  tempContainer.style.height = `${previewElement.offsetHeight}px`;
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.zIndex = '-1';
    
    // Clone the content
    const clonedElement = previewElement.cloneNode(true) as HTMLElement;
    clonedElement.style.width = '100%';
    clonedElement.style.height = '100%';
    clonedElement.style.transform = 'none';
    clonedElement.style.margin = '0';
    clonedElement.style.padding = '0';

    // Ensure inner resume element is not scaled
    const clonedResume = clonedElement.querySelector('.resume-preview') as HTMLElement | null;
    if (clonedResume) {
      clonedResume.style.transform = 'none';
      clonedResume.style.transformOrigin = 'top left';
      clonedResume.style.width = '100%';
      clonedResume.style.height = '100%';
    }
    
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('📸 Capturing high-quality canvas...');
  const canvas = await captureAsCanvas(tempContainer, 3);

    // Remove temporary container
    document.body.removeChild(tempContainer);

    console.log('✅ High-quality canvas created:', {
      width: canvas.width,
      height: canvas.height
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST');

    const fileName = data.profile?.fullName
      ? `resume-${data.profile.fullName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`
      : 'resume.pdf';

    pdf.save(fileName);
    return true;
    
  } catch (error) {
    console.error('❌ High-quality PDF generation failed:', error);
    // Fallback to regular version
    return await downloadPDF(data);
  }
}

// Legacy functions kept for compatibility
export async function downloadPDFFromPreview(): Promise<boolean> {
  const dataElement = document.querySelector('[data-resume-data]');
  if (dataElement) {
    try {
      const data = JSON.parse(dataElement.textContent || '{}');
      return await downloadPDF(data);
    } catch (error) {
      console.error('Failed to parse resume data:', error);
      return false;
    }
  }
  return false;
}

export async function downloadPDFFromPreviewEnhanced(): Promise<boolean> {
  const dataElement = document.querySelector('[data-resume-data]');
  if (dataElement) {
    try {
      const data = JSON.parse(dataElement.textContent || '{}');
      return await downloadPDFHighQuality(data);
    } catch (error) {
      console.error('Failed to parse resume data:', error);
      return false;
    }
  }
  return false;
}

export async function downloadPDFAlternative(data: ResumeData): Promise<boolean> {
  return await downloadPDFHighQuality(data);
}

// --- Helpers ---
function looksBlank(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return true;
    // Sample a small grid of pixels
    const sample = 10;
    for (let y = 0; y < sample; y++) {
      for (let x = 0; x < sample; x++) {
        const px = ctx.getImageData(Math.floor((x + 0.5) * w / sample), Math.floor((y + 0.5) * h / sample), 1, 1).data;
        // If any pixel isn't pure white, it's not blank
        if (!(px[0] === 255 && px[1] === 255 && px[2] === 255 && px[3] === 255)) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function captureAsCanvas(element: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  // Attempt 1: foreignObjectRendering for better text baseline fidelity
  const attempt = async (useForeign: boolean) => html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    logging: false,
    removeContainer: false,
    foreignObjectRendering: useForeign,
    onclone: (clonedDoc) => {
      const clonedContent = clonedDoc.querySelector('[data-resume-content="true"]') as HTMLElement | null;
      if (clonedContent) {
        const scaleWrapper = clonedContent.querySelector('[data-resume-scale-wrapper="true"]') as HTMLElement | null;
        if (scaleWrapper) {
          scaleWrapper.style.transform = 'none';
          scaleWrapper.style.transformOrigin = 'top left';
          scaleWrapper.style.width = '100%';
        }
        const firstContentWrapper = clonedContent.querySelector('.resume-preview > div') as HTMLElement | null;
        if (firstContentWrapper) {
          firstContentWrapper.style.marginTop = '0px';
          firstContentWrapper.style.paddingTop = '0px';
        }
      }
    },
  });

  let canvas = await attempt(true);
  if (looksBlank(canvas)) {
    // Fallback: let html2canvas rasterize without foreignObject
    canvas = await attempt(false);
  }
  return canvas;
}
