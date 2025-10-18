'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';


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
    
    // For title, copy as plain text
    if (type === 'title') {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopiedStates(prev => ({ ...prev, [key]: true }));
          toast({
            title: 'Đã sao chép vào Clipboard!',
            description: `Nội dung tiêu đề đã được sao chép.`,
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
      return;
    }
    
    // For content, copy as rich text (HTML)
    if (type === 'content') {
        const processedHtml = text
            .replace(/<\/?h1[^>]*>/gi, '') 
            .replace(/<\/?strong>/gi, '');

        try {
            const blob = new Blob([processedHtml], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });

            navigator.clipboard.write([clipboardItem]).then(() => {
                setCopiedStates(prev => ({ ...prev, [key]: true }));
                toast({
                    title: 'Đã sao chép vào Clipboard!',
                    description: `Nội dung bài viết đã được sao chép dưới dạng HTML.`,
                });
                setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
            }, (err) => {
                toast({
                    variant: 'destructive',
                    title: 'Sao chép thất bại',
                    description: 'Không thể sao chép nội dung HTML. Vui lòng thử lại.',
                });
                console.error('Lỗi sao chép:', err);
            });
        } catch (e) {
             toast({
                    variant: 'destructive',
                    title: 'Lỗi không xác định',
                    description: 'Trình duyệt của bạn có thể không hỗ trợ sao chép HTML.',
                });
             console.error('Lỗi Clipboard API:', e);
        }
    }
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
        <CardTitle>Kết quả đã tạo</CardTitle>
        <CardDescription>Đã tạo {results.length} bài viết. Dưới đây là danh sách kết quả.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {results.map((item, index) => (
          <div key={index} className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-primary">STT {index + 1}</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                            {copiedStates[`title-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-2">{copiedStates[`title-${index}`] ? 'Đã sao chép' : 'Sao chép Tiêu đề'}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(item.content, 'content', index)}>
                            {copiedStates[`content-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-2">{copiedStates[`content-${index}`] ? 'Đã sao chép' : 'Sao chép Nội dung'}</span>
                        </Button>
                    </div>
                </div>
                 <div className="p-3 bg-muted/30 rounded-md text-sm font-mono break-all">
                    {item.title}
                 </div>
            </div>
            
            <div className="space-y-2">
                <div 
                    className="prose prose-sm dark:prose-invert max-w-none rounded-md border border-border/20 p-4 bg-background" 
                    dangerouslySetInnerHTML={{ __html: item.content }}
                />
            </div>
            
            {index < results.length - 1 && <Separator className="my-6" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
