import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { aiService, SuggestBulletsRequest, SuggestBulletsResponse } from '@/lib/ai';

interface BulletSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
  onInsertBullet: (text: string) => void;
  existingBullets?: string[];
}

export const BulletSuggestionsDialog: React.FC<BulletSuggestionsDialogProps> = ({
  open,
  onOpenChange,
  role,
  onInsertBullet,
  existingBullets = []
}) => {
  const [impact, setImpact] = useState('');
  const [tools, setTools] = useState('');
  const [jobText, setJobText] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestBulletsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSuggestions = async () => {
    if (!impact.trim() || !tools.trim()) {
      toast.error('Please fill in impact and tools fields');
      return;
    }

    setIsLoading(true);
    try {
      const request: SuggestBulletsRequest = {
        role,
        impact: impact.trim(),
        tools: tools.trim(),
        drafts: existingBullets,
        jobText: jobText.trim() || undefined
      };

      const newSuggestions = await aiService.suggestBullets(request);
      setSuggestions(newSuggestions);
      toast.success('AI suggestions generated!');
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('Failed to generate suggestions. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = (suggestion: SuggestBulletsResponse) => {
    onInsertBullet(suggestion.text);
    toast.success('Bullet point added!');
  };

  const resetForm = () => {
    setImpact('');
    setTools('');
    setJobText('');
    setSuggestions([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Bullet Point Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Impact/Achievement *
              </label>
              <Textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="e.g., Reduced page load times, Led a team of 5 developers, Increased sales by 30%"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tools/Technologies *
              </label>
              <Textarea
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="e.g., React, Node.js, AWS, Python, Docker"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Job Description (Optional)
              </label>
              <Textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the job description here to get more targeted suggestions..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateSuggestions}
                disabled={isLoading || !impact.trim() || !tools.trim() || !aiService.isAvailable()}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Suggestions
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Suggestions</h3>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{suggestion.text}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleInsert(suggestion)}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Insert
                    </Button>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      Rationale: {suggestion.rationale}
                    </Badge>
                  </div>
                </div>
              ))}
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
