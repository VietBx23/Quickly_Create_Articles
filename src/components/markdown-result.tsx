
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText, Clipboard, ExternalLink } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


declare const ClipboardItem: any;

export interface MarkdownResultItem {
  title: string;
  content: string;
}

interface MarkdownResultProps {
  results: MarkdownResultItem[];
  isLoading: boolean;
}

const getDomainFromTitle = (title: string): string | null => {
  const regex = /【链接地址：(.*?)】/;
  const match = title.match(regex);
  if (match && match[1]) {
    const domain = match[1];
    if (domain.startsWith('https://')) {
      return domain;
    }
    return `https://${domain}`;
  }
  return null;
};


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
          description: `Nội dung ${type === 'title' ? 'tiêu đề' : 'bài viết'} đã được sao chép dưới dạng văn bản thuần.`,
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
        <CardDescription>Chọn một tab để xem và sao chép nội dung tương ứng.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={`result-0`} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item, index) => (
              <TabsTrigger key={`trigger-${index}`} value={`result-${index}`} className="truncate">
                {item.title.split('-')[0]} - {item.title.split('-')[2]}
              </TabsTrigger>
            ))}
          </TabsList>
          {results.map((item, index) => {
            const domainUrl = getDomainFromTitle(item.title);
            return (
              <TabsContent key={`content-${index}`} value={`result-${index}`}>
                <Card className="border-border/50">
                   <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold leading-snug">{item.title}</CardTitle>
                        {domainUrl && (
                          <Button asChild variant="outline" size="sm">
                            <a href={domainUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2" />
                              Truy cập liên kết
                            </a>
                          </Button>
                        )}
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 h-96 overflow-auto bg-background/50">
                       <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                       <Button variant="outline" onClick={() => handleCopy(item.title, 'title', index)}>
                          {copiedStates[`title-${index}`] ? <Check className="text-green-500" /> : <Clipboard />}
                          {copiedStates[`title-${index}`] ? 'Đã sao chép tiêu đề' : 'Sao chép tiêu đề'}
                        </Button>
                        <Button variant="default" onClick={() => handleCopy(item.content, 'content', index)}>
                          {copiedStates[`content-${index}`] ? <Check className="text-white" /> : <Copy />}
                          {copiedStates[`content-${index}`] ? 'Đã sao chép nội dung' : 'Sao chép nội dung'}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
