
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, AlertCircle, Info, Wrench } from 'lucide-react';
import { useResume } from '@/store/useResume';

interface Issue {
  id: string;
  severity: 'high' | 'med' | 'low';
  path: string;
  issue: string;
  whyItMatters: string;
  suggestion: string;
}

interface IssuesTableProps {
  issues: Issue[];
  onApplyFix?: (issue: Issue) => void;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({ issues, onApplyFix }) => {
  const { updateBullet } = useResume();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'med':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive' as const;
      case 'med':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleApplyFix = (issue: Issue) => {
    // Simple auto-fix logic for common issues
    if (issue.path.includes('bullets') && issue.id.includes('weak-start')) {
      // Auto-fix weak bullet starts by adding action verbs
      const pathParts = issue.path.match(/experience\[(\d+)\]\.bullets\[(\d+)\]/);
      if (pathParts) {
        const expIndex = parseInt(pathParts[1]);
        const bulletIndex = parseInt(pathParts[2]);
        // This would need access to the actual data to implement properly
        console.log('Would fix bullet at:', expIndex, bulletIndex);
      }
    }
    
    if (onApplyFix) {
      onApplyFix(issue);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Info className="w-8 h-8 mx-auto mb-2" />
        <p>No issues found! Your resume looks great.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Issues & Recommendations</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Issue</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Why It Matters</TableHead>
            <TableHead>Suggestion</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(issue.severity)}
                  {issue.issue}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getSeverityVariant(issue.severity)}>
                  {issue.severity.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {issue.whyItMatters}
              </TableCell>
              <TableCell className="text-sm">
                {issue.suggestion}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyFix(issue)}
                  className="text-xs"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  Apply Fix
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
