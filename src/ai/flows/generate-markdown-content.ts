
'use server';

/**
 * @fileOverview Generates markdown content based on user input.
 *
 * - generateMarkdownContent - A function that generates markdown content.
 * - GenerateMarkdownContentInput - The input type for the generateMarkdownContent function.
 * - GenerateMarkdownContentOutput - The return type for the generateMarkdownContent function.
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

// This function can be defined outside the flow as it doesn't cause hydration issues.
function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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

    // 1. Manually create the title and H1 tag
    const title = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;
    const titleWithLink = `<h1>${input.primaryKeyword} -【链接地址：<a href="${input.domain}" style="color: #1155cc; text-decoration: underline;">${displayDomain}</a>】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}</h1>`;

    // 2. Since AI generation is failing, use a static template.
    const articleBody = `<p>Chào mừng bạn đến với trang web của chúng tôi. Chúng tôi tự hào giới thiệu dịch vụ hàng đầu về <strong>${input.primaryKeyword}</strong>. Tại đây, bạn sẽ tìm thấy những nội dung đặc sắc và độc quyền, bao gồm cả <em>${input.secondaryKeyword}</em>. Chúng tôi liên tục cập nhật để mang đến cho bạn những trải nghiệm mới mẻ và hấp dẫn nhất. Hãy khám phá ngay để không bỏ lỡ bất kỳ thông tin quan trọng nào.</p>`;
    
    // 3. Manually create the Call To Action
    const callToAction = `<h2><a href="${input.domain}"><strong>👉👉 Truy cập ngay! 👈👈</strong></a></h2>`;

    // 4. Combine the manually created H1, the static body, and the manually-created CTA
    const fullContent = `${titleWithLink}${articleBody}${callToAction}`;

    return {title: title, content: fullContent};
  }
);
