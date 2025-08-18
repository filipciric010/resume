import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import { aiService } from '@/lib/ai';

export const AIBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if AI is available or if dismissed
  if (aiService.isAvailable() || isDismissed) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
      <Sparkles className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-orange-800 dark:text-orange-200">
            <strong>AI is in demo mode:</strong> Full AI features require the server to be configured with an API key.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="text-orange-600 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
