
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

  const domainWithPossiblePort = match[1];
  const url = `https://${domainWithPossiblePort.split(':')[0]}`;
  const parts = title.split(match[0]);

  return (
    <>
      {parts[0]}
      {'【链接地址：'}
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
        {domainWithPossiblePort}
      </a>
      {'】'}
      {parts[1]}
    </>
  );
};

export function MarkdownResult({ results, isLoading }: MarkdownResultProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleCopy = (text: string, type: 'title' | 'content', index: number) => {
    const key = `${type}-${index}`;
    let htmlToCopy = text;

    if (type === 'title') {
      htmlToCopy = `<p style="font-size: 36px; font-weight: bold; color: white; text-align: center;">${text}</p>`;
    }
    
    try {
        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlToCopy], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' })
        });

        navigator.clipboard.write([clipboardItem]).then(
            () => {
                setCopiedStates(prev => ({ ...prev, [key]: true }));
                toast({
                    title: 'Đã sao chép vào Clipboard!',
                    description: `Nội dung ${type === 'title' ? 'tiêu đề' : 'bài viết'} đã được sao chép.`,
                });
                setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
            },
            (err) => {
                console.error('Copy failed (async)', err);
                fallbackCopy(htmlToCopy, text, key, type);
            }
        );
    } catch (err) {
      console.error('ClipboardItem API not supported, using fallback.', err);
      fallbackCopy(htmlToCopy, text, key, type);
    }
  };

  const fallbackCopy = (htmlToCopy: string, plainText: string, key: string, type: 'title' | 'content') => {
      const tempEl = document.createElement('div');
      tempEl.style.position = 'absolute';
      tempEl.style.left = '-9999px';
      tempEl.innerHTML = htmlToCopy;
      document.body.appendChild(tempEl);
      
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(tempEl);
      
      if(selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            toast({
                title: 'Đã sao chép vào Clipboard!',
                description: `Nội dung ${type === 'title' ? 'tiêu đề' : 'bài viết'} đã được sao chép.`,
            });
            setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
        } else {
            throw new Error('Fallback copy command failed');
        }
      } catch (e) {
        // If execCommand fails, try copying plain text as a last resort
        const textArea = document.createElement("textarea");
        textArea.value = plainText;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            toast({
                title: 'Đã sao chép vào Clipboard!',
                description: `Nội dung ${type === 'title' ? 'tiêu đề' : 'bài viết'} (dạng văn bản thuần) đã được sao chép.`,
            });
            setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Sao chép thất bại',
                description: 'Không thể sao chép nội dung.',
            });
        }
        document.body.removeChild(textArea);
      } finally {
        if (selection) {
          selection.removeAllRanges();
        }
        document.body.removeChild(tempEl);
      }
  }
  
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
                <p className="flex-1 font-semibold text-black break-all text-base">
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
