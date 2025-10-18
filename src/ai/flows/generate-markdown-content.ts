
'use server';

/**
 * @fileOverview Generates markdown content based on user input.
 *
 * - generateMarkdownContent - A function that generates markdown content.
 * - GenerateMarkdownContentInput - The input type for the generateMarkdownContent function.
 * - GenerateMarkdownContentOutput - The return type for the generateMarkdown-content function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarkdownContentInputSchema = z.object({
  primaryKeyword: z.string().describe('The primary keyword.'),
  secondaryKeyword: z.string().describe('The secondary keyword.'),
  domain: z.string().describe('The domain to use in the markdown content.'),
  value: z.string().describe('A user-defined value to include in the markdown content.'),
});

export type GenerateMarkdownContentInput = z.infer<
  typeof GenerateMarkdownContentInputSchema
>;

const GenerateMarkdownContentOutputSchema = z.object({
  title: z.string().describe('The generated title.'),
  content: z.string().describe('The generated markdown content.'),
});

export type GenerateMarkdownContentOutput = z.infer<
  typeof GenerateMarkdownContentOutputSchema
>;

function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const articlePrompt = ai.definePrompt({
  name: 'articlePrompt',
  input: {
    schema: z.object({
      primaryKeyword: z.string(),
      secondaryKeyword: z.string(),
      domain: z.string(),
    }),
  },
  output: {
    schema: z.object({
      content: z.string().describe('The full HTML content of the article.'),
    }),
  },
  prompt: `
    Bạn là một chuyên gia viết nội dung quảng cáo bằng tiếng Việt.
    Nhiệm vụ của bạn là viết một bài viết chuẩn SEO, hấp dẫn, dài khoảng 400-500 chữ.

    YÊU CẦU:
    1.  Bắt đầu bài viết bằng một thẻ \`<h1>\` chứa từ khóa chính.
    2.  Nội dung bài viết phải đề cập một cách tự nhiên đến cả "{{primaryKeyword}}" và "{{secondaryKeyword}}".
    3.  Kết thúc bài viết bằng một lời kêu gọi hành động (Call To Action) mạnh mẽ, đặt trong thẻ \`<h2>\`. Lời kêu gọi này phải chứa một liên kết \`<a>\` trỏ đến "{{domain}}".

    Hãy đảm bảo toàn bộ đầu ra là một chuỗi HTML hoàn chỉnh.
  `,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
});


export async function generateMarkdownContent(
  input: GenerateMarkdownContentInput
): Promise<GenerateMarkdownContentOutput> {
  return generateMarkdownContentFlow(input);
}

const generateMarkdownContentFlow = ai.defineFlow(
  {
    name: 'generateMarkdownContentFlow',
    inputSchema: GenerateMarkdownContentInputSchema,
    outputSchema: GenerateMarkdownContentOutputSchema,
  },
  async input => {
    const today = new Date().toISOString().slice(0, 10);
    const randomChars = generateRandomString(6);
    const displayDomain = input.domain.replace(/^https?:\/\//, '');

    // 1. Manually create the title for the browser tab
    const title = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;

    // 2. Call the AI to generate the full HTML content
    const { output } = await articlePrompt({
        primaryKeyword: input.primaryKeyword,
        secondaryKeyword: input.secondaryKeyword,
        domain: input.domain,
    });
    
    // 3. Return the generated title and content
    return {
        title: title,
        content: output?.content ?? '',
    };
  }
);
