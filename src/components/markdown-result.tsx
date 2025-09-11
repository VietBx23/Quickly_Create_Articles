
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

declare const ClipboardItem: any;

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
    navigator.clipboard.writeText(text).then(
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
      <Card className="w-full bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Đang tạo nội dung của bạn...</CardTitle>
          <CardDescription>Vui lòng đợi trong khi AI của chúng tôi tạo ra markdown hoàn hảo cho bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>

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
            <h3 className="mt-6 text-xl font-semibold">Chưa có nội dung nào được tạo</h3>
            <p className="mt-2 text-md text-muted-foreground">
                Điền vào biểu mẫu ở trên và nhấp vào "Tạo nội dung" để xem điều kỳ diệu xảy ra.
            </p>
        </div>
    );
  }

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm gradient-border-card">
      <CardHeader>
        <CardTitle>Markdown đã tạo của bạn</CardTitle>
        <CardDescription>Đây là nội dung được tạo dựa trên thông tin bạn cung cấp. Bạn có thể sao chép tiêu đề hoặc nội dung đầy đủ.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((item, index) => (
            <div key={index} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                      {copiedStates[`title-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-2">{copiedStates[`title-${index}`] ? 'Đã sao chép' : 'Sao chép Tiêu đề'}</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(item.content, 'content', index)}>
                      {copiedStates[`content-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-2">{copiedStates[`content-${index}`] ? 'Đã sao chép' : 'Sao chép Nội dung'}</span>
                    </Button>
                  </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <div 
                    className="prose prose-sm dark:prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
