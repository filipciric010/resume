
import React, { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { SectionEditor } from '@/components/SectionEditor';
import { ResumePreview } from '@/components/ResumePreview';
import { TemplatePicker } from '@/components/TemplatePicker';
import { StickyActions } from '@/components/StickyActions';
import { AIBanner } from '@/components/AIBanner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthPage';
import { toast } from 'sonner';
import { useResume } from '@/store/useResume';
import { useATS } from '@/store/useATS';
import { SAMPLE_RESUME, SAMPLE_JD } from '@/demo/sample';
import { GuidelineTips } from '@/components/GuidelineTips';
import ImportResumeModal from '@/components/editor/ImportResumeModal';
import ImportJsonModal from '@/components/editor/ImportJsonModal';
import { Upload, FileJson } from 'lucide-react';

const Editor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data, importSnapshot } = useResume();
  const { setJobDescription } = useATS();

  useEffect(() => {
    // Check authentication first
    if (!user) {
      setShowAuthModal(true);
      return;
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };
  const [importOpen, setImportOpen] = useState(false);
  const [importJsonOpen, setImportJsonOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {import.meta.env.VITE_DEMO === 'true' && (
        <div className="container mx-auto px-4 mt-3 flex justify-end print-hide">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              importSnapshot(SAMPLE_RESUME);
              setJobDescription(SAMPLE_JD);
            }}
          >
            Load Demo
          </Button>
        </div>
      )}
      
      {/* AI Banner */}
  <div className="container mx-auto px-4 py-2 print-hide">
        <AIBanner />
      </div>

      {/* Guidelines quick access */}
      <div className="container mx-auto px-4 pb-0 print-hide">
        <div className="flex gap-2 flex-wrap">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                View Resume Writing Guidelines
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
              <GuidelineTips />
            </SheetContent>
          </Sheet>

          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Resume
          </Button>

          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setImportJsonOpen(true)}>
            <FileJson className="mr-2 h-4 w-4" />
            Import JSON
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Editor */}
          <div className="lg:col-span-6 space-y-4 print-hide">
            <SectionEditor />
            <div className="mt-2">
              <TemplatePicker />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-6">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4 print-hide">
                <h2 className="text-lg font-semibold">Resume Preview</h2>
              </div>
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Actions */}
      <StickyActions />

  <ImportResumeModal open={importOpen} onClose={() => setImportOpen(false)} />
  <ImportJsonModal open={importJsonOpen} onClose={() => setImportJsonOpen(false)} />
      
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            navigate('/');
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default Editor;
