'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <CardTitle>Đang tạo nội dung của bạn...</CardTitle>
          <CardDescription>Vui lòng đợi trong khi AI của chúng tôi tạo ra markdown hoàn hảo cho bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Markdown đã tạo của bạn</CardTitle>
        <CardDescription>Đây là nội dung được tạo dựa trên thông tin bạn cung cấp. Bạn có thể sao chép tiêu đề hoặc nội dung đầy đủ.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((item, index) => (
            <div key={index} className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                    {copiedStates[`title-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-2">{copiedStates[`title-${index}`] ? 'Đã sao chép' : 'Sao chép Tiêu đề'}</span>
                  </Button>
              </div>
              <div className="p-4 bg-muted rounded-md relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(item.content, 'content', index)}
                >
                  {copiedStates[`content-${index}`] ? <Check className="text-green-500 h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-2">{copiedStates[`content-${index}`] ? 'Đã sao chép' : 'Sao chép Nội dung'}</span>
                </Button>
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
