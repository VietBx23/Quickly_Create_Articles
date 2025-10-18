
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

const TEMPLATES = [
  "Chào mừng bạn đến với thế giới của <strong>{{primaryKeyword}}</strong>! Chúng tôi tự hào là nơi cung cấp những trải nghiệm độc đáo và nội dung hàng đầu. Nếu bạn đang tìm kiếm <em>{{secondaryKeyword}}</em>, bạn đã đến đúng nơi. Khám phá ngay để không bỏ lỡ những cập nhật mới nhất và hấp dẫn nhất chỉ có tại đây.",
  "Bạn có phải là một người hâm mộ của <strong>{{primaryKeyword}}</strong>? Trang web của chúng tôi là điểm đến lý tưởng dành cho bạn. Chúng tôi chuyên sâu về lĩnh vực này và luôn mang đến những thông tin nóng hổi, đặc biệt là về <em>{{secondaryKeyword}}</em>. Hãy cùng chúng tôi đắm chìm vào những trải nghiệm không thể quên.",
  "Khám phá vũ trụ vô tận của <strong>{{primaryKeyword}}</strong> ngay hôm nay! Tại đây, mọi thông tin bạn cần, đặc biệt là các nội dung độc quyền về <em>{{secondaryKeyword}}</em>, đều được cập nhật liên tục. Chúng tôi cam kết mang đến cho bạn chất lượng và sự đa dạng không nơi nào có được.",
  "Bạn đang tìm kiếm thông tin về <strong>{{primaryKeyword}}</strong>? Đừng tìm đâu xa! Chúng tôi cung cấp một kho tàng nội dung phong phú, từ những điều cơ bản đến các chủ đề nâng cao như <em>{{secondaryKeyword}}</em>. Hãy để chúng tôi trở thành người bạn đồng hành đáng tin cậy của bạn trên hành trình khám phá này.",
  "Tại sao nên chọn chúng tôi khi bạn quan tâm đến <strong>{{primaryKeyword}}</strong>? Vì chúng tôi không chỉ cung cấp thông tin, mà còn mang đến những góc nhìn chuyên sâu và độc đáo, đặc biệt với những ai yêu thích <em>{{secondaryKeyword}}</em>. Trải nghiệm sự khác biệt và đẳng cấp ngay hôm nay!"
];


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

    // 2. Since AI generation is failing, use a static template but select one randomly.
    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
    const randomTemplate = TEMPLATES[randomIndex];
    const articleBody = `<p>${randomTemplate
      .replace('{{primaryKeyword}}', input.primaryKeyword)
      .replace('{{secondaryKeyword}}', input.secondaryKeyword)}</p>`;
    
    // 3. Manually create the Call To Action
    const callToAction = `<h2><a href="${input.domain}"><strong>👉👉 Truy cập ngay! 👈👈</strong></a></h2>`;

    // 4. Combine the manually created H1, the static body, and the manually-created CTA
    const fullContent = `${titleWithLink}${articleBody}${callToAction}`;

    return {title: title, content: fullContent};
  }
);
