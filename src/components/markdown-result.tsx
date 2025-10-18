
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Eye } from 'lucide-react';
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

const TitleWithClickableLink = ({ title }: { title: string }) => {
    const regex = /(【链接地址：)([^】]+)(】)/;
    const match = title.match(regex);

    if (match) {
        const prefix = title.substring(0, match.index);
        const linkText = match[1] + match[2] + match[3];
        const suffix = title.substring(match.index! + linkText.length);
        const url = `https://${match[2]}`;

        return (
            <p className="p-3 bg-muted/30 rounded-md break-all text-base text-foreground">
                {prefix}
                {match[1]}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                    {match[2]}
                </a>
                {match[3]}
                {suffix}
            </p>
        );
    }

    return (
        <p className="p-3 bg-muted/30 rounded-md break-all text-base text-foreground">
            {title}
        </p>
    );
};


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
            title: '已复制到剪贴板！',
            description: `标题内容已复制。`,
          });
          setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
        },
        (err) => {
          toast({
            variant: 'destructive',
            title: '复制失败',
            description: '无法复制内容。请再试一次。',
          });
          console.error('复制错误:', err);
        }
      );
      return;
    }
    
    if (type === 'content') {
        try {
            const blob = new Blob([text], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });

            navigator.clipboard.write([clipboardItem]).then(() => {
                setCopiedStates(prev => ({ ...prev, [key]: true }));
                toast({
                    title: '已复制到剪贴板！',
                    description: `文章内容已复制为 HTML。`,
                });
                setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
            }, (err) => {
                toast({
                    variant: 'destructive',
                    title: '复制失败',
                    description: '无法复制 HTML 内容。请再试一次。',
                });
                console.error('复制错误:', err);
            });
        } catch (e) {
             toast({
                    variant: 'destructive',
                    title: '未知错误',
                    description: '您的浏览器可能不支持复制 HTML。',
                });
             console.error('Clipboard API 错误:', e);
        }
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/20">
        <CardHeader>
          <CardTitle>正在生成您的内容...</CardTitle>
          <CardDescription>请稍候，我们正在为您制作完美的 markdown。</CardDescription>
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
        <CardTitle>已生成的结果</CardTitle>
        <CardDescription>已生成 {results.length} 篇文章。以下是结果列表。</CardDescription>
      </CardHeader>
      <CardContent>
         <Accordion type="single" collapsible className="w-full space-y-4">
            {results.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border border-border/20 rounded-lg bg-background/50 px-4">
                 <div className="flex justify-between items-center w-full pt-4">
                     <h3 className="font-bold text-lg text-primary text-left">STT {index + 1}</h3>
                      <div className="flex gap-2 items-center">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopy(item.title, 'title', index); }}>
                              {copiedStates[`title-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              <span className="ml-2 hidden sm:inline">{copiedStates[`title-${index}`] ? '已复制' : '复制标题'}</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopy(item.content, 'content', index); }}>
                              {copiedStates[`content-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              <span className="ml-2 hidden sm:inline">{copiedStates[`content-${index}`] ? '已复制' : '复制内容'}</span>
                          </Button>
                           <AccordionTrigger className="p-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md [&[data-state=open]>svg]:rotate-180">
                               <Eye className="h-4 w-4 shrink-0 transition-transform duration-200" />
                           </AccordionTrigger>
                      </div>
                  </div>
                  <div className="py-4">
                      <TitleWithClickableLink title={item.title} />
                  </div>
                <AccordionContent>
                  <div className="space-y-4 pt-4 border-t border-dashed">
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
