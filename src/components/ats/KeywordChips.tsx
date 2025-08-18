
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface KeywordChipsProps {
  keywords: string[];
  title: string;
  variant?: 'default' | 'destructive' | 'secondary';
}

export const KeywordChips: React.FC<KeywordChipsProps> = ({ 
  keywords, 
  title, 
  variant = 'destructive' 
}) => {
  if (keywords.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {variant === 'destructive' && <X className="w-5 h-5 text-red-500" />}
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge key={index} variant={variant} className="text-xs">
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
};
