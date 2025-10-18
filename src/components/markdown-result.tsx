'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
    
    if (type === 'title') {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopiedStates(prev => ({ ...prev, [key]: true }));
          toast({
            title: '已複製到剪貼簿！',
            description: `標題內容已複製。`,
          });
          setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
        },
        (err) => {
          toast({
            variant: 'destructive',
            title: '複製失敗',
            description: '無法複製內容。請再試一次。',
          });
          console.error('複製錯誤:', err);
        }
      );
      return;
    }
    
    if (type === 'content') {
        const processedHtml = text
            .replace(/<h1>.*?<\/h1>/gi, '') 
            .replace(/<strong>/gi, '')
            .replace(/<\/strong>/gi, '');

        try {
            const blob = new Blob([processedHtml], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });

            navigator.clipboard.write([clipboardItem]).then(() => {
                setCopiedStates(prev => ({ ...prev, [key]: true }));
                toast({
                    title: '已複製到剪貼簿！',
                    description: `文章內容已複製為 HTML。`,
                });
                setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
            }, (err) => {
                toast({
                    variant: 'destructive',
                    title: '複製失敗',
                    description: '無法複製 HTML 內容。請再試一次。',
                });
                console.error('複製錯誤:', err);
            });
        } catch (e) {
             toast({
                    variant: 'destructive',
                    title: '未知錯誤',
                    description: '您的瀏覽器可能不支援複製 HTML。',
                });
             console.error('Clipboard API 錯誤:', e);
        }
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/20">
        <CardHeader>
          <CardTitle>正在生成您的內容...</CardTitle>
          <CardDescription>請稍候，我們正在為您製作完美的 markdown。</CardDescription>
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
        <CardTitle>已生成的結果</CardTitle>
        <CardDescription>已生成 {results.length} 篇文章。以下是結果列表。</CardDescription>
      </CardHeader>
      <CardContent>
         <Accordion type="single" collapsible className="w-full space-y-4">
            {results.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border border-border/20 rounded-lg bg-background/50 px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                     <h3 className="font-bold text-lg text-primary text-left">STT {index + 1}</h3>
                      <div className="flex gap-2 items-center">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopy(item.title, 'title', index); }}>
                              {copiedStates[`title-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              <span className="ml-2 hidden sm:inline">{copiedStates[`title-${index}`] ? '已複製' : '複製標題'}</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopy(item.content, 'content', index); }}>
                              {copiedStates[`content-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              <span className="ml-2 hidden sm:inline">{copiedStates[`content-${index}`] ? '已複製' : '複製內容'}</span>
                          </Button>
                      </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4 border-t border-dashed">
                      <div className="p-3 bg-muted/30 rounded-md text-sm font-mono break-all">
                          {item.title}
                       </div>
                      <div 
                          className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border/20 p-4 bg-background" 
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
