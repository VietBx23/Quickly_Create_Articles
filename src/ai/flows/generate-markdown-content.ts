
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

const TEMPLATES = [
  `Chào mừng bạn đến với thế giới của <strong>{{primaryKeyword}}</strong>! Chúng tôi tự hào là điểm đến hàng đầu cho những ai đam mê và tìm kiếm những trải nghiệm độc đáo. Nếu bạn đặc biệt quan tâm đến <em>{{secondaryKeyword}}</em>, thì bạn đã tìm đúng nơi rồi đấy. Tại đây, chúng tôi không ngừng cập nhật những nội dung mới nhất, nóng hổi nhất, đảm bảo bạn sẽ luôn đi đầu xu hướng. Hãy dành thời gian khám phá kho tàng kiến thức và giải trí mà chúng tôi đã dày công xây dựng.
  <br><br>
  Nền tảng của chúng tôi được thiết kế để mang lại trải nghiệm người dùng tốt nhất, với giao diện thân thiện, tốc độ tải trang nhanh chóng và nội dung được sắp xếp một cách logic. Chúng tôi hiểu rằng thời gian của bạn là quý giá, vì vậy mọi thông tin bạn cần đều có thể được tìm thấy chỉ sau vài cú nhấp chuột. Đội ngũ chuyên gia của chúng tôi luôn làm việc không mệt mỏi để xác minh và cung cấp những thông tin chính xác, đáng tin cậy, giúp bạn có cái nhìn toàn diện và sâu sắc nhất về chủ đề <strong>{{primaryKeyword}}</strong>.
  <br><br>
  Đặc biệt, chuyên mục về <em>{{secondaryKeyword}}</em> được chúng tôi đầu tư kỹ lưỡng, với các bài phân tích chuyên sâu, các video chất lượng cao và các bộ sưu tập độc quyền mà bạn khó có thể tìm thấy ở nơi khác. Chúng tôi tin rằng chất lượng làm nên sự khác biệt. Hãy tham gia cộng đồng của chúng tôi ngay hôm nay để không bỏ lỡ bất kỳ thông tin nóng hổi nào. Chúng tôi luôn lắng nghe và trân trọng mọi ý kiến đóng góp từ người dùng để ngày càng hoàn thiện hơn.`,
  `Bạn có phải là một người hâm mộ cuồng nhiệt của <strong>{{primaryKeyword}}</strong>? Trang web của chúng tôi chính là thiên đường dành cho bạn. Chúng tôi chuyên sâu về lĩnh vực này và luôn mang đến những thông tin chính xác, cập nhật, đặc biệt là các nội dung độc quyền liên quan đến <em>{{secondaryKeyword}}</em>. Hãy cùng chúng tôi đắm chìm vào những giờ phút giải trí khó quên, nơi mọi thông tin đều được kiểm chứng và trình bày một cách hấp dẫn.
  <br><br>
  Chúng tôi tự hào về kho nội dung đồ sộ của mình, được cập nhật hàng giờ để đáp ứng nhu cầu thông tin ngày càng cao của bạn. Từ những kiến thức cơ bản cho người mới bắt đầu đến những phân tích chuyên sâu dành cho các chuyên gia, mọi thứ về <strong>{{primaryKeyword}}</strong> đều có ở đây. Giao diện của chúng tôi được tối ưu hóa cho cả máy tính và thiết bị di động, giúp bạn có thể truy cập và thưởng thức nội dung mọi lúc, mọi nơi.
  <br><br>
  Đối với những người có niềm đam mê đặc biệt với <em>{{secondaryKeyword}}</em>, chúng tôi đã tạo ra một không gian riêng với những bài viết độc quyền, video Full HD không che và các cuộc thảo luận sôi nổi. Cộng đồng của chúng tôi là nơi bạn có thể giao lưu, học hỏi và chia sẻ đam mê với hàng ngàn người có cùng sở thích. Đừng chần chừ, hãy trở thành một phần của cộng đồng năng động và khám phá những điều tuyệt vời mà chúng tôi mang lại.`,
  `Khám phá vũ trụ vô tận của <strong>{{primaryKeyword}}</strong> ngay hôm nay! Tại đây, mọi thông tin bạn cần, từ cơ bản đến nâng cao, đặc biệt là các phân tích chuyên sâu về <em>{{secondaryKeyword}}</em>, đều được cập nhật liên tục và nhanh chóng. Chúng tôi cam kết mang đến cho bạn chất lượng và sự đa dạng không nơi nào có được. Đội ngũ chuyên gia của chúng tôi luôn làm việc không ngừng nghỉ để cung cấp cho bạn những góc nhìn mới lạ và thông tin giá trị nhất.
  <br><br>
  Sứ mệnh của chúng tôi là trở thành nguồn thông tin đáng tin cậy và toàn diện nhất trong lĩnh vực <strong>{{primaryKeyword}}</strong>. Chúng tôi không chỉ chạy theo xu hướng mà còn tạo ra xu hướng bằng cách cung cấp những nội dung độc đáo và có chiều sâu. Mỗi bài viết, mỗi video đều được chau chuốt tỉ mỉ từ nội dung đến hình thức, nhằm mang lại cho bạn sự hài lòng tuyệt đối.
  <br><br>
  Bạn có quan tâm đặc biệt đến <em>{{secondaryKeyword}}</em> không? Chuyên mục này của chúng tôi chắc chắn sẽ làm bạn bất ngờ. Với hàng loạt nội dung được cập nhật liên tục, từ những video mới nhất đến những phân tích chi tiết, bạn sẽ luôn là người nắm bắt thông tin nhanh nhất. Hãy để chúng tôi làm người bạn đồng hành của bạn trên con đường khám phá và chinh phục tri thức.`,
  `Bạn đang tìm kiếm thông tin đáng tin cậy về <strong>{{primaryKeyword}}</strong>? Đừng tìm đâu xa! Chúng tôi tự hào cung cấp một kho tàng nội dung phong phú và đa dạng, bao gồm cả những chủ đề nóng hổi như <em>{{secondaryKeyword}}</em>. Hãy để chúng tôi trở thành người bạn đồng hành đáng tin cậy trên hành trình khám phá và chinh phục kiến thức của bạn. Với giao diện thân thiện và nội dung chất lượng, chúng tôi tin rằng bạn sẽ có những trải nghiệm tuyệt vời nhất.
  <br><br>
  Chúng tôi hiểu rằng trong thế giới thông tin hỗn loạn ngày nay, việc tìm kiếm một nguồn tin chính xác và cập nhật là vô cùng quan trọng. Đó là lý do tại sao chúng tôi đặt chất lượng và tính xác thực lên hàng đầu. Mọi thông tin về <strong>{{primaryKeyword}}</strong> trên trang của chúng tôi đều được kiểm duyệt kỹ càng trước khi xuất bản. Chúng tôi muốn bạn cảm thấy hoàn toàn yên tâm khi sử dụng thông tin từ nền tảng của chúng tôi.
  <br><br>
  Và nếu <em>{{secondaryKeyword}}</em> là chủ đề khiến bạn hứng thú, bạn đã đến đúng nơi. Chúng tôi liên tục cập nhật những nội dung mới và hấp dẫn nhất, đảm bảo mang đến cho bạn những giây phút giải trí đỉnh cao. Đừng ngần ngại khám phá kho tàng của chúng tôi, nơi kiến thức và giải trí hòa quyện làm một. Hãy tham gia ngay để trở thành những người đầu tiên trải nghiệm sự khác biệt.`,
  `Tại sao nên chọn chúng tôi khi bạn quan tâm đến <strong>{{primaryKeyword}}</strong>? Bởi vì chúng tôi không chỉ cung cấp thông tin, mà còn mang đến những góc nhìn chuyên sâu, độc đáo và những phân tích mà bạn không thể tìm thấy ở nơi khác. Đặc biệt nếu bạn là người yêu thích <em>{{secondaryKeyword}}</em>. Hãy trải nghiệm sự khác biệt và đẳng cấp mà chúng tôi mang lại.
  <br><br>
  Chúng tôi tin rằng chất lượng nội dung và sự tận tâm của đội ngũ sẽ là lý do giữ chân bạn ở lại với chúng tôi lâu dài. Nền tảng của chúng tôi được xây dựng dựa trên niềm đam mê và sự am hiểu sâu sắc về lĩnh vực <strong>{{primaryKeyword}}</strong>. Chúng tôi không ngừng nỗ lực để cải tiến và mang đến những tính năng mới, giúp trải nghiệm của bạn ngày càng tốt hơn. Mục tiêu của chúng tôi là tạo ra một cộng đồng vững mạnh, nơi mọi người có thể tự do chia sẻ và thảo luận.
  <br><br>
  Chuyên mục về <em>{{secondaryKeyword}}</em> là niềm tự hào của chúng tôi, với những nội dung được tuyển chọn kỹ lưỡng và cập nhật liên tục. Chúng tôi đảm bảo bạn sẽ luôn tìm thấy những điều mới mẻ và thú vị mỗi khi ghé thăm. Đừng bỏ lỡ cơ hội trở thành một phần của cộng đồng đam mê và tri thức của chúng tôi. Hãy bắt đầu hành trình khám phá của bạn ngay bây giờ!`
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
      .replace(/{{primaryKeyword}}/g, `<strong>${input.primaryKeyword}</strong>`)
      .replace(/{{secondaryKeyword}}/g, `<em>${input.secondaryKeyword}</em>`)}</p>`;
    
    // 3. Manually create the Call To Action
    const callToAction = `<h2><a href="${input.domain}"><strong>👉👉 Truy cập ngay! 👈👈</strong></a></h2>`;

    // 4. Combine the manually created H1, the static body, and the manually-created CTA
    const fullContent = `${titleWithLink}${articleBody}${callToAction}`;

    return {title: title, content: fullContent};
  }
);
