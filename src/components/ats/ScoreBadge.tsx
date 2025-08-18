
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ 
  score, 
  maxScore = 100, 
  size = 'md' 
}) => {
  const percentage = Math.round((score / maxScore) * 100);
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Work';
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-20 h-20 text-xl'
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`${sizeClasses[size]} rounded-full ${getScoreColor(percentage)} flex items-center justify-center text-white font-bold shadow-lg`}>
        {percentage}
      </div>
      <Badge variant={percentage >= 85 ? 'default' : percentage >= 70 ? 'secondary' : 'destructive'}>
        {getScoreLabel(percentage)}
      </Badge>
      <Progress value={percentage} className="w-24" />
    </div>
  );
};
