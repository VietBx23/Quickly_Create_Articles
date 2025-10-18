
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
  `Chào mừng bạn đến với thế giới của <strong>{{primaryKeyword}}</strong>! Chúng tôi tự hào là điểm đến hàng đầu cho những ai đam mê và tìm kiếm những trải nghiệm độc đáo. Nếu bạn đặc biệt quan tâm đến <em>{{secondaryKeyword}}</em>, thì bạn đã tìm đúng nơi rồi đấy.
  <br><br>Tại đây, chúng tôi không ngừng cập nhật những nội dung mới nhất, nóng hổi nhất, đảm bảo bạn sẽ luôn đi đầu xu hướng. Hãy dành thời gian khám phá kho tàng kiến thức và giải trí mà chúng tôi đã dày công xây dựng, bạn sẽ không phải thất vọng.`,
  `Bạn có phải là một người hâm mộ cuồng nhiệt của <strong>{{primaryKeyword}}</strong>? Trang web của chúng tôi chính là thiên đường dành cho bạn. Chúng tôi chuyên sâu về lĩnh vực này và luôn mang đến những thông tin chính xác, cập nhật, đặc biệt là các nội dung độc quyền liên quan đến <em>{{secondaryKeyword}}</em>.
  <br><br>Hãy cùng chúng tôi đắm chìm vào những giờ phút giải trí khó quên, nơi mọi thông tin đều được kiểm chứng và trình bày một cách hấp dẫn. Cộng đồng của chúng tôi luôn chào đón những thành viên mới có cùng chung đam mê.`,
  `Khám phá vũ trụ vô tận của <strong>{{primaryKeyword}}</strong> ngay hôm nay! Tại đây, mọi thông tin bạn cần, từ cơ bản đến nâng cao, đặc biệt là các phân tích chuyên sâu về <em>{{secondaryKeyword}}</em>, đều được cập nhật liên tục và nhanh chóng.
  <br><br>Chúng tôi cam kết mang đến cho bạn chất lượng và sự đa dạng không nơi nào có được. Đội ngũ chuyên gia của chúng tôi luôn làm việc không ngừng nghỉ để cung cấp cho bạn những góc nhìn mới lạ và thông tin giá trị nhất.`,
  `Bạn đang tìm kiếm thông tin đáng tin cậy về <strong>{{primaryKeyword}}</strong>? Đừng tìm đâu xa! Chúng tôi tự hào cung cấp một kho tàng nội dung phong phú và đa dạng, bao gồm cả những chủ đề nóng hổi như <em>{{secondaryKeyword}}</em>.
  <br><br>Hãy để chúng tôi trở thành người bạn đồng hành đáng tin cậy trên hành trình khám phá và chinh phục kiến thức của bạn. Với giao diện thân thiện và nội dung chất lượng, chúng tôi tin rằng bạn sẽ có những trải nghiệm tuyệt vời nhất.`,
  `Tại sao nên chọn chúng tôi khi bạn quan tâm đến <strong>{{primaryKeyword}}</strong>? Bởi vì chúng tôi không chỉ cung cấp thông tin, mà còn mang đến những góc nhìn chuyên sâu, độc đáo và những phân tích mà bạn không thể tìm thấy ở nơi khác. Đặc biệt nếu bạn là người yêu thích <em>{{secondaryKeyword}}</em>.
  <br><br>Hãy trải nghiệm sự khác biệt và đẳng cấp mà chúng tôi mang lại. Chúng tôi tin rằng chất lượng nội dung và sự tận tâm của đội ngũ sẽ là lý do giữ chân bạn ở lại với chúng tôi lâu dài.`
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

    // 2. Select a random template for the body
    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
    const randomTemplate = TEMPLATES[randomIndex];
    const articleBody = `<p>${randomTemplate
      .replace(/{{primaryKeyword}}/g, input.primaryKeyword)
      .replace(/{{secondaryKeyword}}/g, input.secondaryKeyword)}</p>`;
    
    // 3. Manually create the Call To Action
    const callToAction = `<h2><a href="${input.domain}"><strong>👉👉 Truy cập ngay! 👈👈</strong></a></h2>`;

    // 4. Combine the manually created H1, the static body, and the manually-created CTA
    const fullContent = `${titleWithLink}${articleBody}${callToAction}`;

    return {title: title, content: fullContent};
  }
);

