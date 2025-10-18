'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export interface MarkdownResultItem {
  title: string;
  content: string;
}

interface MarkdownResultProps {
  results: MarkdownResultItem[];
  isLoading: boolean;
}

export function MarkdownResult({ results, isLoading }: MarkdownResultProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleCopy = (text: string, type: 'title' | 'content', index: number) => {
    const key = `${type}-${index}`;
    let textToCopy = text;

    if (type === 'content') {
        textToCopy = text
            .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>.*?<\/a>/gi, '$1')
            .replace(/<\/p>/gi, '\n') 
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '') 
            .trim();
    }

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        toast({
          title: 'Đã sao chép vào Clipboard!',
          description: `Nội dung ${type === 'title' ? 'tiêu đề' : 'bài viết'} đã được sao chép.`,
        });
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Sao chép thất bại',
          description: 'Không thể sao chép nội dung. Vui lòng thử lại.',
        });
        console.error('Lỗi sao chép:', err);
      }
    );
  };
  
  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/20">
        <CardHeader>
          <CardTitle>Đang tạo nội dung của bạn...</CardTitle>
          <CardDescription>Vui lòng đợi trong khi chúng tôi tạo ra markdown hoàn hảo cho bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/20">
      <CardHeader>
        <CardTitle>Markdown đã tạo của bạn</CardTitle>
        <CardDescription>Đây là nội dung được tạo. Nhấp vào một mục để xem và sao chép nội dung.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {results.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-muted/50 rounded-md relative mt-2">
                   <div className="flex justify-end gap-2 mb-2">
                     <Button variant="ghost" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                        {copiedStates[`title-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-2">{copiedStates[`title-${index}`] ? 'Đã sao chép' : 'Sao chép Tiêu đề'}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.content, 'content', index)}
                      >
                        {copiedStates[`content-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-2">{copiedStates[`content-${index}`] ? 'Đã sao chép' : 'Sao chép Text'}</span>
                      </Button>
                   </div>
                  <div 
                      className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border/20 p-4" 
                      dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
