'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText, Clipboard } from 'lucide-react';
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
    const key = `${type}-${index}`;

    if (type === 'content') {
      const htmlContent = converter.makeHtml(text);
      // Attempt to copy as rich text with a plain text fallback
      try {
        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const blobText = new Blob([text], { type: 'text/plain' });
        const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
        
        navigator.clipboard.write(data).then(() => {
          setCopiedStates(prev => ({ ...prev, [key]: true }));
          toast({
            title: 'Đã sao chép vào Clipboard!',
            description: 'Nội dung đã được sao chép dưới dạng văn bản đa dạng thức.',
          });
          setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
        }).catch(() => {
          // Fallback for browsers that might fail with write() but support writeText()
          navigator.clipboard.writeText(text).then(() => {
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            toast({
              title: 'Đã sao chép dưới dạng văn bản thuần túy!',
              description: 'Trình duyệt của bạn không hỗ trợ sao chép văn bản đa dạng thức.',
            });
            setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
          });
        });
      } catch (e) {
        // Fallback for browsers that do not support ClipboardItem
        navigator.clipboard.writeText(text).then(() => {
          setCopiedStates(prev => ({ ...prev, [key]: true }));
          toast({
            title: 'Đã sao chép dưới dạng văn bản thuần túy!',
            description: 'Trình duyệt của bạn không hỗ trợ sao chép văn bản đa dạng thức.',
          });
          setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
        });
      }
    } else {
      // For title, copy as plain text
      navigator.clipboard.writeText(text).then(() => {
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        toast({
          title: 'Đã sao chép vào Clipboard!',
          description: 'Tiêu đề đã được sao chép thành công.',
        });
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Đang tạo nội dung của bạn...</CardTitle>
          <CardDescription>Vui lòng đợi trong khi AI của chúng tôi tạo ra markdown hoàn hảo cho bạn.</CardDescription>
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
            <h3 className="mt-6 text-xl font-semibold">Chưa có nội dung nào được tạo</h3>
            <p className="mt-2 text-md text-muted-foreground">
                Điền vào biểu mẫu ở trên và nhấp vào "Tạo nội dung" để xem điều kỳ diệu xảy ra.
            </p>
        </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Markdown đã tạo của bạn</CardTitle>
        <CardDescription>Bây giờ bạn có thể sao chép tiêu đề hoặc nội dung cho mỗi bài viết được tạo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((item, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex flex-1 items-center gap-4 overflow-hidden">
                <span className="text-sm font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
                <p className="flex-1 font-medium text-sm truncate">
                  {item.title}
                </p>
              </div>
              <div className="flex items-center space-x-2 pl-4">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(item.title, 'title', index)}>
                  {copiedStates[`title-${index}`] ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Clipboard className="mr-2 h-4 w-4" />}
                  {copiedStates[`title-${index}`] ? 'Đã sao chép' : 'Sao chép tiêu đề'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleCopy(item.content, 'content', index)}>
                 {copiedStates[`content-${index}`] ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copiedStates[`content-${index}`] ? 'Đã sao chép' : 'Sao chép nội dung'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
