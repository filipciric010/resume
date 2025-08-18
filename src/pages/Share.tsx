
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ResumePreview } from '@/components/ResumePreview';
import { Button } from '@/components/ui/button';
import { Download, Link2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useResume, loadFromShareableLink } from '@/store/useResume';

const Share = () => {
  const { slug } = useParams();
  const { importSnapshot, setReadOnly } = useResume();

  useEffect(() => {
    // Check if loading from a shareable link
    const sharedData = loadFromShareableLink();
    if (sharedData) {
      importSnapshot(sharedData);
      setReadOnly(true);
      toast.success("Loaded shared resume data");
    }
  }, [importSnapshot, setReadOnly]);

  const handleDownload = () => {
    toast.success("Download feature coming soon!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Check out this resume");
    const body = encodeURIComponent(`I wanted to share this resume with you: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Shared Resume</h1>
              <p className="text-muted-foreground">Viewing shared resume data</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Link2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailShare}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <ResumePreview />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 mt-8">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            This resume was created with AI Resume Builder
          </p>
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            Create Your Own Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Share;
