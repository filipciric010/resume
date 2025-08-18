import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { aiService, RewriteBulletRequest, RewriteBulletResponse } from '@/lib/ai';

interface BulletRewriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalBullet: string;
  onReplaceBullet: (newText: string) => void;
}

export const BulletRewriteDialog: React.FC<BulletRewriteDialogProps> = ({
  open,
  onOpenChange,
  originalBullet,
  onReplaceBullet
}) => {
  const [jobText, setJobText] = useState('');
  const [rewriteResult, setRewriteResult] = useState<RewriteBulletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRewrite = async () => {
    setIsLoading(true);
    try {
      const request: RewriteBulletRequest = {
        bullet: originalBullet,
        jobText: jobText.trim() || undefined
      };

      const result = await aiService.rewriteBullet(request);
      setRewriteResult(result);
      toast.success('Bullet point rewritten!');
    } catch (error) {
      console.error('AI rewrite error:', error);
      toast.error('Failed to rewrite bullet point. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (rewriteResult) {
      onReplaceBullet(rewriteResult.text);
      toast.success('Bullet point updated!');
      onOpenChange(false);
    }
  };

  const resetDialog = () => {
    setJobText('');
    setRewriteResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Quantify & Improve Bullet Point
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Bullet */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Original Bullet Point
            </label>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">{originalBullet}</p>
            </div>
          </div>

          {/* Job Description Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Job Description (Optional)
            </label>
            <Textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job description here to get more targeted improvements..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleRewrite}
              disabled={isLoading || !aiService.isAvailable()}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Improve & Quantify
            </Button>
            <Button variant="outline" onClick={resetDialog}>
              Reset
            </Button>
          </div>

          {/* Rewrite Result */}
          {rewriteResult && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Improved Version</h3>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="bg-primary/5 p-3 rounded-lg">
                  <p className="text-sm leading-relaxed">{rewriteResult.text}</p>
                </div>
                
                <div className="pt-2 border-t">
                  <Badge variant="secondary" className="text-xs mb-3 block">
                    Improvement rationale: {rewriteResult.rationale}
                  </Badge>
                  
                  <Button onClick={handleAccept} className="w-full">
                    <Check className="w-4 h-4 mr-2" />
                    Accept & Replace
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!aiService.isAvailable() && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                AI features require an OpenAI API key on the server. Set OPENAI_API_KEY in the server environment.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
