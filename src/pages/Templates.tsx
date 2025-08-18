
import React, { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useResume } from '@/store/useResume';
import type { ResumeData } from '@/store/useResume';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthPage';
import { Eye, Edit, Star, Download } from 'lucide-react';
import { TemplatePreview } from '@/components/TemplatePreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const templates = [
  {
    id: 'modern' as const,
    name: 'Modern Professional',
    description: 'Clean design with color accents and modern typography. Perfect for tech and creative roles.',
    features: ['ATS-Friendly', 'Color Accents', 'Modern Layout'],
    preview: 'modern' as const,
    popular: true
  },
  {
    id: 'classic' as const,
    name: 'Classic Traditional',
    description: 'Timeless design with professional formatting. Ideal for corporate and traditional industries.',
    features: ['ATS-Friendly', 'Professional', 'Clean Layout'],
    preview: 'classic' as const,
    popular: false
  },
  {
    id: 'compact' as const,
    name: 'Compact Efficient',
    description: 'Space-efficient two-column design. Great for experienced professionals with lots to showcase.',
    features: ['ATS-Friendly', 'Space Efficient', 'Two-Column'],
    preview: 'compact' as const,
    popular: false
  },
  {
    id: 'modern-compact' as const,
    name: 'Modern Compact',
    description: 'Bold sidebar with clean content area. Great balance of style and readability.',
    features: ['ATS-Friendly', 'Sidebar', 'Modern'],
    preview: 'modern-compact' as const,
    popular: false
  },
  {
    id: 'punk' as const,
    name: 'Punk Bold',
    description: 'Expressive, high-contrast layout with a striking sidebar. For creative and standout resumes.',
    features: ['ATS-Friendly', 'High Contrast', 'Bold'],
    preview: 'punk' as const,
    popular: false
  },
  {
    id: 'timeline' as const,
    name: 'Timeline',
    description: 'Clean timeline for work and education plus a compact sidebar for essentials.',
    features: ['ATS-Friendly', 'Timeline', 'Clean'],
    preview: 'timeline' as const,
    popular: false
  }
];

const Templates = () => {
  const navigate = useNavigate();
  const { setTemplateKey, resetToClean } = useResume();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const getPreviewImageSrc = (templateId: string): string => {
    const map: Record<string, string> = {
      'modern': '/Modern.png',
      'classic': '/Classic.png',
      'compact': '/Compact.png',
      'modern-compact': '/ModernCompact.png',
      'punk': '/Punk.png',
      'timeline': '/Timeline.png',
    };
    return map[templateId] ?? '/placeholder.svg';
  };

  const handleUseTemplate = (templateId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    resetToClean(); // Reset to clean data first
    setTemplateKey(templateId as ResumeData['templateKey']);
    navigate('/editor');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate('/editor');
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Resume Templates</h1>
          <p className="text-lg text-muted-foreground">
            Choose from our collection of ATS-friendly, professionally designed templates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden resume-shadow hover:resume-shadow-lg transition-all duration-300 flex flex-col h-full">
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                <TemplatePreview templateId={template.id} />
                {template.popular && (
                  <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handlePreview(template.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  <p className="text-muted-foreground text-sm">{template.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {user ? 'Use Template' : 'Sign In to Use'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview(template.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Our Templates Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">ATS-Optimized</h3>
              <p className="text-sm text-muted-foreground">
                All templates are designed to pass Applicant Tracking Systems with clean formatting and proper structure.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Edit className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fully Customizable</h3>
              <p className="text-sm text-muted-foreground">
                Easily modify colors, fonts, sections, and layout to match your personal brand and industry.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Export Ready</h3>
              <p className="text-sm text-muted-foreground">
                Export to PDF with perfect formatting preserved. Print-ready and digital-friendly.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 gradient-card">
            <h2 className="text-2xl font-bold mb-4">Ready to Create Your Professional Resume?</h2>
            <p className="text-muted-foreground mb-6">
              Choose a template and start building your resume in minutes. No design skills required.
            </p>
            <Button size="lg" onClick={() => handleUseTemplate('modern')}>
              {user ? 'Start Building Now' : 'Sign In to Start Building'}
            </Button>
          </Card>
        </div>
      </div>
      
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!previewTemplateId} onOpenChange={(open) => !open && setPreviewTemplateId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {templates.find(t => t.id === previewTemplateId)?.name || 'Template Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full">
            {previewTemplateId && (
              <img
                src={getPreviewImageSrc(previewTemplateId)}
                alt={`${previewTemplateId} preview`}
                className="w-full h-auto rounded-md"
                loading="eager"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
