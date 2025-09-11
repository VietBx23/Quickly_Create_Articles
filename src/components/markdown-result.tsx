'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText, Clipboard, ClipboardCheck } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import showdown from 'showdown';

export interface MarkdownResultItem {
  title: string;
  content: string;
}

interface MarkdownResultProps {
  results: MarkdownResultItem[];
  isLoading: boolean;
}

const converter = new showdown.Converter();

export function MarkdownResult({ results, isLoading }: MarkdownResultProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleCopy = (text: string, type: 'title' | 'content', index: number) => {
    if (type === 'content') {
      const html = converter.makeHtml(text);
      try {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([text], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        });
        navigator.clipboard.write([clipboardItem]);
      } catch (error) {
        // Fallback for older browsers
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
    }
    
    const key = `${type}-${index}`;
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    toast({
        title: 'Copied!',
        description: `${type === 'title' ? 'Title' : 'Content'} has been copied to your clipboard.`,
    })
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Generated Markdown</CardTitle>
          <CardDescription>Please wait while we generate your content...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (results.length === 0) {
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
      <CardHeader>
        <CardTitle>Your Generated Markdown</CardTitle>
        <CardDescription>You can now copy the title or content for each generated article.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <p className="flex-1 truncate font-medium pr-4" title={item.title}>
                {item.title}
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                  {copiedStates[`title-${index}`] ? <ClipboardCheck className="mr-2" /> : <Clipboard className="mr-2" />}
                  {copiedStates[`title-${index}`] ? 'Copied' : 'Copy Title'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleCopy(item.content, 'content', index)}>
                 {copiedStates[`content-${index}`] ? <ClipboardCheck className="mr-2" /> : <Copy className="mr-2" />}
                  {copiedStates[`content-${index}`] ? 'Copied' : 'Copy Content'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
