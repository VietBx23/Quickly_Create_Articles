'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, FileText, Clipboard } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export interface MarkdownResultItem {
  title: string;
  content: string;
}

interface MarkdownResultProps {
  results: MarkdownResultItem[];
  isLoading: boolean;
}

const TitleWithLink = ({ title }: { title: string }) => {
  const regex = /【链接地址：(.*?)】/;
  const match = title.match(regex);

  if (!match) {
    return <>{title}</>;
  }

  const domain = match[1];
  const url = `https://${domain}`;
  const parts = title.split(match[0]);

  return (
    <>
      {parts[0]}
      {'【链接地址：'}
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
        {domain}
      </a>
      {'】'}
      {parts[1]}
    </>
  );
};

export function MarkdownResult({ results, isLoading }: MarkdownResultProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const copyRichText = (htmlContent: string) => {
    const listener = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/html', htmlContent);
        e.clipboardData.setData('text/plain', htmlContent.replace(/<[^>]*>?/gm, ''));
      }
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  };
  
  const handleCopy = (text: string, type: 'title' | 'content', index: number) => {
    const key = `${type}-${index}`;
    let htmlToCopy = '';

    if (type === 'title') {
      const regex = /【链接地址：(.*?)】/;
      const match = text.match(regex);
      if (match) {
        const domain = match[1];
        const url = `https://${domain}`;
        htmlToCopy = text.replace(domain, `<a href="${url}" target="_blank">${domain}</a>`);
      } else {
        htmlToCopy = text;
      }
    } else {
      htmlToCopy = text;
    }

    try {
      copyRichText(htmlToCopy);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      toast({
        title: 'Đã sao chép vào Clipboard!',
        description: `Nội dung ${type === 'title' ? 'tiêu đề' : 'bài viết'} đã được sao chép.`,
      });
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Sao chép thất bại',
        description: 'Không thể sao chép nội dung.',
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
                <p className="flex-1 font-semibold text-lg break-all text-white">
                  <TitleWithLink title={item.title} />
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
