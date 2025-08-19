
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useResume } from '@/store/useResume';
import { downloadPDF, downloadPDFHighQuality } from '@/utils/pdfExport';
import { generateServerPDF } from '@/utils/serverPdf';
export const StickyActions: React.FC = () => {
  const { data } = useResume();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!data.profile?.fullName) {
      toast.error('Please add your name before generating PDF');
      return;
    }
    
    setIsGenerating(true);
    console.log('[pdf-download] Starting PDF generation with data:', {
      hasProfile: !!data.profile,
      profileName: data.profile?.fullName,
      templateKey: data.templateKey,
      experienceCount: data.experience?.length || 0
    });
    
    try {
      // TEMPORARILY: Skip server PDF and try client-side first for debugging
      console.log('[pdf-download] Trying client-side PDF generation first...');
      let success = await downloadPDF(data, data.templateKey);
      
      if (!success) {
        console.log('[pdf-download] Client PDF failed, trying server PDF...');
        success = await generateServerPDF(data, data.templateKey);
      }
      
      if (!success) {
        console.log('[pdf-download] Server PDF failed, trying high-quality client PDF...');
        success = await downloadPDFHighQuality(data);
      }
      
      if (success) {
        toast.success('PDF downloaded successfully!');
      } else {
        toast.error('Failed to generate PDF. Please check your resume data and try again.');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please check your resume data and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="resume-shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
