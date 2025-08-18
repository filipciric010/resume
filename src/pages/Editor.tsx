
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
import { GuidelineTips } from '@/components/GuidelineTips';

const Editor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data } = useResume();

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

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      {/* AI Banner */}
      <div className="container mx-auto px-4 py-2 print-hide">
        <AIBanner />
      </div>

      {/* Guidelines quick access */}
      <div className="container mx-auto px-4 pb-0 print-hide">
        <div className="flex gap-2">
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
