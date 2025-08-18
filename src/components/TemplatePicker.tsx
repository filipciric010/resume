
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResume } from '@/store/useResume';
import { Check } from 'lucide-react';
import { TemplatePreview } from './TemplatePreview';

const templates = [
  {
    id: 'modern' as const,
    name: 'Modern',
    description: 'Clean and contemporary with color accents',
    preview: 'modern' as const
  },
  {
    id: 'classic' as const,
    name: 'Classic',
    description: 'Traditional professional layout',
    preview: 'classic' as const
  },
  {
    id: 'compact' as const,
    name: 'Compact',
    description: 'Space-efficient two-column design',
    preview: 'compact' as const
  }
  ,
  {
    id: 'modern-compact' as const,
    name: 'Modern Compact',
    description: 'Modern sidebar layout with compact content',
    preview: 'modern' as const
  },
  {
    id: 'punk' as const,
    name: 'Punk',
    description: 'Bold neon two-column, punk-inspired',
    preview: 'modern' as const
  }
  ,
  {
    id: 'timeline' as const,
    name: 'Timeline',
    description: 'Minimal two-column with vertical timeline for work and education',
    preview: 'classic' as const
  }
];

export const TemplatePicker: React.FC = () => {
  const { data, setTemplateKey } = useResume();
  const currentTemplate = data.templateKey;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Choose Template</h3>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`relative overflow-hidden shrink-0 snap-start min-w-[180px] max-w-[200px] ${
              currentTemplate === template.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="p-3">
              <div className="aspect-[3/4] bg-gray-100 rounded-md mb-2 overflow-hidden">
                <TemplatePreview templateId={template.id} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  {currentTemplate === template.id && (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <Button
                  variant={currentTemplate === template.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTemplateKey(template.id)}
                  className="w-full"
                >
                  {currentTemplate === template.id ? 'Selected' : 'Use Template'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
