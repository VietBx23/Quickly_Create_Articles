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
import { ScrollArea } from '@/components/ui/scroll-area';

import { handleGenerateMarkdown } from '@/app/actions';
import { MarkdownResult } from './markdown-result';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  primaryKeyword: z.enum(['黑料网'], {
    required_error: "Please select a primary keyword."
  }),
  secondaryKeyword: z.string().min(1, 'Secondary keyword is required.'),
  domain: z.string().min(1, 'Please select a domain.'),
  value: z.string().min(1, 'Value is required.'),
});

const DOMAINS = ["za51.run", "za52.run", "za53.run", "uu1.run", "uu2.run", "uu3.run", "181.run", "182.run", "183.run", "6677.one"];
const PRIMARY_KEYWORDS = ['黑料网'];

export function MarkdownGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
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
    setMarkdownContent(null);

    const result = await handleGenerateMarkdown(data);

    if (result.success && result.data) {
      setMarkdownContent(result.data);
      toast({
        title: "Success!",
        description: "Your markdown has been generated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
    setIsLoading(false);
  }

  return (
    <>
      <Card className="w-full shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Create Markdown</CardTitle>
              <CardDescription>Fill in the details below to generate your content.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryKeyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Keyword</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a primary keyword" />
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
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="h-48">
                            {DOMAINS.map(domain => (
                                <SelectItem key={domain} value={`https://` + domain}>{domain}</SelectItem>
                            ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryKeyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Keyword</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 最新在线地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <div className="mt-8">
        <MarkdownResult content={markdownContent} isLoading={isLoading} />
      </div>
    </>
  );
}
