'use client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface MarkdownResultProps {
  content: string | null;
  isLoading: boolean;
}

export function MarkdownResult({ content, isLoading }: MarkdownResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Generated Markdown</CardTitle>
          <CardDescription>Please wait while we generate your content...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!content) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No content generated yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Fill out the form above to generate your markdown.
            </p>
        </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Your Generated Markdown</CardTitle>
            <CardDescription>You can now copy the content below.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy to clipboard">
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          readOnly
          value={content}
          className="min-h-[300px] resize-y font-code text-sm"
          aria-label="Generated markdown content"
        />
      </CardContent>
    </Card>
  );
}
