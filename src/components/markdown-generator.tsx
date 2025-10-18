'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sparkles, KeyRound, Hash, Globe, List, Heart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

import { handleGenerateMarkdown } from '@/app/actions';
import { MarkdownResult, type MarkdownResultItem } from './markdown-result';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  primaryKeyword: z.string().min(1, '请输入或选择一个主关键词。'),
  secondaryKeywords: z.string().min(1, '至少需要一个次要关键词。'),
  domain: z.string().min(1, '请输入或选择一个域名。').url('请输入有效的URL。'),
  value: z.string().min(1, '值是必需的。'),
});

const DOMAINS = ["za51.run", "za52.run", "za53.run", "uu1.run", "uu2.run", "uu3.run", "181.run", "182.run", "183.run", "184.run", "6677.one"];
const PRIMARY_KEYWORDS = ['黑料网', '六合彩内部资料', '六合'];

const defaultSecondaryKeywords = [
  "亚洲精品国产精品乱码视色",
  "亚洲国产欧美在线观看片不卡",
  "中文字幕乱码人妻一区二区三区",
  "国产又色又爽又黄的免费",
  "久久精品视频在线看",
  "亚洲精品少妇一区二区",
  "精品久久久噜噜噜久久久",
  "天天躁夜夜躁狠狠综合",
  "欧美自拍亚洲综合丝袜"
].join('\n');

export function MarkdownGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MarkdownResultItem[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      primaryKeyword: '黑料网',
      secondaryKeywords: defaultSecondaryKeywords,
      domain: 'https://za51.run',
      value: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResults([]);
    setHasGenerated(true);

    const allSecondaryKeywords = data.secondaryKeywords.split('\n').map(kw => kw.trim()).filter(kw => kw !== '');
    if (allSecondaryKeywords.length === 0) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "至少需要一个次要关键词。",
      });
      setIsLoading(false);
      return;
    }
    
    let successfulCount = 0;
    const totalKeywords = allSecondaryKeywords.length;
    const newResults = [];

    for (let i = 0; i < totalKeywords; i++) {
        const mainSecondaryKeyword = allSecondaryKeywords[i];
        
        // Create a pool of other keywords to pick from randomly
        const otherKeywords = [...allSecondaryKeywords.slice(0, i), ...allSecondaryKeywords.slice(i + 1)];
        
        // Pick 2 random keywords
        const randomKeywords = [];
        let retries = 0; // Prevent infinite loops
        while (randomKeywords.length < 2 && otherKeywords.length > 0 && retries < 10) {
            const randomIndex = Math.floor(Math.random() * otherKeywords.length);
            randomKeywords.push(otherKeywords.splice(randomIndex, 1)[0]);
            retries++;
        }

        // If not enough random keywords, duplicate the main one or another from the list
        while (randomKeywords.length < 2) {
             const fallbackKeyword = allSecondaryKeywords.length > 1 ? allSecondaryKeywords[(i + 1) % allSecondaryKeywords.length] : mainSecondaryKeyword;
             randomKeywords.push(fallbackKeyword);
        }

        const keywordGroup = [mainSecondaryKeyword, ...randomKeywords];

        try {
            const result = await handleGenerateMarkdown({
                primaryKeyword: data.primaryKeyword,
                secondaryKeywords: keywordGroup,
                domain: data.domain,
                value: data.value,
            });

            if (result.success && result.data) {
                newResults.push(result.data);
                successfulCount++;
            } else {
                toast({
                    variant: "destructive",
                    title: `关键词生成失败: "${mainSecondaryKeyword}"`,
                    description: result.error || "发生未知错误。",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: `关键词生成失败: "${mainSecondaryKeyword}"`,
                description: "处理请求时出错。请重试。",
            });
            console.error(`Generation error for keyword ${mainSecondaryKeyword}:`, error);
        }
    }
    
    setResults(newResults);

    if (successfulCount > 0) {
        toast({
          title: "完成!",
          description: `成功为 ${successfulCount} / ${totalKeywords} 个关键词生成了内容。`,
        });
    }


    setIsLoading(false);
  }

  return (
    <>
      <Card className="w-full shadow-lg bg-card/60 backdrop-blur-xl border-border/20">
          <CardHeader className="text-center">
             <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-500">
                Markdown Generator Pro
             </h1>
            <CardDescription className="pt-2 text-foreground/80">
              立即生成自定义的Markdown内容。只需提供您的关键词、域名和值即可开始。
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryKeyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>主关键词</FormLabel>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                                <Input placeholder="输入您的主关键词" {...field} className="pl-10 h-12" />
                            </FormControl>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                              {PRIMARY_KEYWORDS.map((keyword) => (
                                  <Button
                                      key={keyword}
                                      type="button"
                                      variant={field.value === keyword ? 'default' : 'outline'}
                                      onClick={() => form.setValue('primaryKeyword', keyword, { shouldValidate: true })}
                                  >
                                      {keyword}
                                  </Button>
                              ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>值</FormLabel>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <FormControl>
                              <Input placeholder="例如：CY" {...field} className="pl-10 h-12" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>域名</FormLabel>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <FormControl>
                                <Input placeholder="https://example.com" {...field} className="pl-10 h-12" />
                              </FormControl>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {DOMAINS.map((domain) => (
                                    <Button
                                        key={domain}
                                        type="button"
                                        variant={field.value === `https://${domain}` ? 'default' : 'outline'}
                                        onClick={() => form.setValue('domain', `https://${domain}`, { shouldValidate: true })}
                                    >
                                        {domain}
                                    </Button>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  <FormField
                    control={form.control}
                    name="secondaryKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>次要关键词</FormLabel>
                        <div className="relative">
                          <List className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
                          <FormControl>
                            <Textarea placeholder="例如：最新在线地址 (每行一个)" {...field}  rows={10} className="pl-10 pt-3" />
                          </FormControl>
                        </div>
                        <FormDescription>
                          每行一个次要关键词。系统将为每个关键词生成一篇文章。
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg">
                  {isLoading ? (
                      <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          正在生成...
                      </>
                  ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" /> 
                        生成内容
                      </>
                  )}
                </Button>
                <div className="text-xs text-muted-foreground flex items-center gap-1 pt-4">
                  Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> by Péi Chūn Yuè
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      {hasGenerated && (
        <div className="mt-8 w-full">
            <MarkdownResult results={results} isLoading={isLoading && results.length === 0} />
        </div>
      )}
    </>
  );
}

    