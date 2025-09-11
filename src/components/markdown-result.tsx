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
      // For content, we want to copy as rich text (HTML)
      const htmlContent = converter.makeHtml(text);
      try {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([text], { type: 'text/plain' }) })];
        navigator.clipboard.write(data).then(
          () => {
            // Success
            const key = `${type}-${index}`;
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            toast({
                title: 'Copied to Clipboard!',
                description: 'Content has been copied successfully.',
            })
            setTimeout(() => {
              setCopiedStates(prev => ({ ...prev, [key]: false }));
            }, 2000);
          },
          (err) => {
            // Fallback for browsers that don't support text/html
             navigator.clipboard.writeText(text);
             const key = `${type}-${index}`;
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            toast({
                title: 'Copied as plain text!',
                description: 'Your browser does not support rich text copy.',
            })
            setTimeout(() => {
              setCopiedStates(prev => ({ ...prev, [key]: false }));
            }, 2000);
          }
        );
      } catch (error) {
        console.error('Failed to copy rich text: ', error);
        // Fallback for older browsers
        navigator.clipboard.writeText(text);
        const key = `${type}-${index}`;
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        toast({
            title: 'Copied as plain text!',
            description: 'Rich text copy is not supported.',
        })
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
      }
    } else {
      // For title, copy as plain text
      navigator.clipboard.writeText(text);
      const key = `${type}-${index}`;
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      toast({
          title: 'Copied to Clipboard!',
          description: 'Title has been copied successfully.',
      })
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Generating Your Content...</CardTitle>
          <CardDescription>Please wait while our AI crafts the perfect markdown for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (results.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center transition-colors hover:border-primary/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No Content Generated Yet</h3>
            <p className="mt-2 text-md text-muted-foreground">
                Fill out the form above and click "Generate" to see the magic happen.
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
        <div className="space-y-3">
          {results.map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex flex-1 items-center gap-4">
                <span className="text-sm font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
                <p className="flex-1 font-medium text-sm">
                  {item.title}
                </p>
              </div>
              <div className="flex items-center space-x-2 pl-4">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                  {copiedStates[`title-${index}`] ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Clipboard className="mr-2 h-4 w-4" />}
                  {copiedStates[`title-${index}`] ? 'Copied' : 'Copy Title'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleCopy(item.content, 'content', index)}>
                 {copiedStates[`content-${index}`] ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
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