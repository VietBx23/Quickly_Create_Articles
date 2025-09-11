'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

import { handleGenerateMarkdown } from '@/app/actions';
import { MarkdownResult, type MarkdownResultItem } from './markdown-result';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  primaryKeyword: z.enum(['黑料网', '六合'], {
    required_error: "Vui lòng chọn một từ khóa chính."
  }),
  secondaryKeyword: z.string().min(1, 'Cần ít nhất một từ khóa phụ.'),
  domain: z.string().min(1, 'Vui lòng chọn một tên miền.'),
  value: z.string().min(1, 'Giá trị là bắt buộc.'),
});

const DOMAINS = ["za51.run", "za52.run", "za53.run", "uu1.run", "uu2.run", "uu3.run", "181.run", "182.run", "183.run", "6677.one"];
const PRIMARY_KEYWORDS = ['黑料网', '六合'];

export function MarkdownGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MarkdownResultItem[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      primaryKeyword: '黑料网',
      secondaryKeyword: '',
      domain: '',
      value: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResults([]);
    setHasGenerated(true);

    const secondaryKeywords = data.secondaryKeyword.split('\n').filter(kw => kw.trim() !== '');
    if (secondaryKeywords.length === 0) {
      toast({
        variant: "destructive",
        title: "Xác thực thất bại",
        description: "Cần ít nhất một từ khóa phụ.",
      });
      setIsLoading(false);
      return;
    }

    const allResults: MarkdownResultItem[] = [];

    for (const keyword of secondaryKeywords) {
      const result = await handleGenerateMarkdown({
        ...data,
        secondaryKeyword: keyword,
      });

      if (result.success && result.data) {
        allResults.push(result.data);
      } else {
        toast({
          variant: "destructive",
          title: `Tạo thất bại cho "${keyword}"`,
          description: result.error || "Đã xảy ra lỗi không xác định.",
        });
      }
    }
    
    if (allResults.length > 0) {
      setResults(allResults);
       toast({
        title: "Thành công!",
        description: `Đã tạo markdown cho ${allResults.length} từ khóa.`,
      });
    }

    setIsLoading(false);
  }

  return (
    <>
      <div className="relative">
        <Card className="w-full bg-card/95 backdrop-blur-sm shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mx-auto mb-4">
              Péi Chūn Yuè
            </div>
            <CardTitle className="font-headline font-bold tracking-tighter text-4xl sm:text-5xl md:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Markdown Generator Pro
            </CardTitle>
            <CardDescription className="max-w-2xl mx-auto text-lg text-muted-foreground pt-2">
              Tạo nội dung markdown tùy chỉnh ngay lập tức. Chỉ cần cung cấp từ khóa, tên miền và giá trị của bạn để bắt đầu.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-6">
                 <div className="grid gap-6 sm:grid-cols-2">
                   <FormField
                      control={form.control}
                      name="primaryKeyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Từ khóa chính</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn một từ khóa chính" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIMARY_KEYWORDS.map(keyword => (
                                  <SelectItem key={keyword} value={keyword}>{keyword}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá trị</FormLabel>
                          <FormControl>
                            <Input placeholder="ví dụ: CY" {...field} />
                          </FormControl>
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
                          <FormLabel>Tên miền</FormLabel>
                          <FormControl>
                              <div className="flex flex-wrap gap-2 pt-2">
                                  {DOMAINS.map((domain) => (
                                      <Button
                                          key={domain}
                                          type="button"
                                          variant={field.value === `https://` + domain ? 'default' : 'outline'}
                                          onClick={() => form.setValue('domain', `https://` + domain, { shouldValidate: true })}
                                          className="transition-all duration-200 px-3 py-1 h-auto text-xs"
                                      >
                                          {domain}
                                      </Button>
                                  ))}
                              </div>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                <div>
                  <FormField
                    control={form.control}
                    name="secondaryKeyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Từ khóa phụ</FormLabel>
                        <FormControl>
                          <Textarea placeholder="ví dụ: địa chỉ trực tuyến mới nhất (mỗi dòng một từ)" {...field}  rows={4} />
                        </FormControl>
                        <FormDescription>
                          Nhập một từ khóa phụ mỗi dòng.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-lg py-6 px-8 group">
                  {isLoading ? (
                      <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang tạo...
                      </>
                  ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> 
                        Tạo nội dung
                      </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      {hasGenerated && (
        <div className="mt-10">
            <MarkdownResult results={results} isLoading={isLoading} />
        </div>
      )}
    </>
  );
}
