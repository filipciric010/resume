
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface BreakdownBarsProps {
  breakdown: {
    format: number;
    content: number;
    relevance: number;
  };
}

export const BreakdownBars: React.FC<BreakdownBarsProps> = ({ breakdown }) => {
  const categories = [
    { name: 'Format', score: breakdown.format, max: 20, color: 'bg-blue-500' },
    { name: 'Content', score: breakdown.content, max: 40, color: 'bg-green-500' },
    { name: 'Relevance', score: breakdown.relevance, max: 40, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Score Breakdown</h3>
      {categories.map((category) => {
        const percentage = Math.round((category.score / category.max) * 100);
        return (
          <div key={category.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{category.name}</span>
              <span className="text-sm text-muted-foreground">
                {category.score}/{category.max}
              </span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        );
      })}
    </div>
  );
};
