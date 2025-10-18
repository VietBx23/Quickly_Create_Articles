
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
    (primary: string, secondary: string) => `
        <p>Chào mừng bạn đến với thế giới giải trí đỉnh cao, nơi mọi giới hạn đều bị phá bỏ. Chúng tôi tự hào giới thiệu ${primary}, nền tảng hàng đầu dành cho những ai tìm kiếm những trải nghiệm độc đáo và mới lạ. Nếu bạn đã từng nghe về ${secondary}, bạn sẽ hiểu được sức hút khó cưỡng của những nội dung chất lượng cao mà chúng tôi mang lại. Tại đây, mỗi khoảnh khắc đều là một cuộc phiêu lưu, mỗi video là một câu chuyện đang chờ được khám phá. Chúng tôi liên tục cập nhật để đảm bảo bạn luôn có được những nội dung mới nhất, nóng hổi nhất, đáp ứng mọi nhu cầu và sở thích của bạn.</p>
        <p>Với công nghệ tiên tiến, chúng tôi đảm bảo mang đến cho bạn trải nghiệm xem mượt mà, không giật lag, với chất lượng hình ảnh và âm thanh vượt trội. Giao diện thân thiện, dễ sử dụng giúp bạn dễ dàng tìm kiếm và tận hưởng những nội dung yêu thích. Đừng bỏ lỡ cơ hội trở thành một phần của cộng đồng năng động và cuồng nhiệt của chúng tôi. Hãy để ${primary} và ${secondary} dẫn lối bạn vào một không gian giải trí không giới hạn, nơi bạn có thể thỏa sức khám phá và tận hưởng những giây phút thư giãn tuyệt vời nhất. Chúng tôi cam kết mang đến sự hài lòng tuyệt đối và những trải nghiệm khó quên.</p>
    `,
    (primary: string, secondary: string) => `
        <p>Bạn đang tìm kiếm một địa chỉ uy tín để khám phá những nội dung độc quyền và hấp dẫn? ${primary} chính là câu trả lời cho bạn. Chúng tôi là điểm đến lý tưởng cho những ai đam mê ${secondary} và muốn trải nghiệm những gì tinh túy nhất. Với kho nội dung khổng lồ, được chọn lọc kỹ lưỡng và cập nhật hàng ngày, chúng tôi tự tin sẽ làm hài lòng cả những khán giả khó tính nhất. Từ những thước phim kinh điển đến các xu hướng mới nổi, tất cả đều có mặt tại đây, sẵn sàng để bạn khám phá.</p>
        <p>Hãy quên đi những trải nghiệm xem video gián đoạn và chất lượng thấp. Nền tảng của chúng tôi được tối ưu hóa để mang lại tốc độ tải nhanh chóng và độ phân giải cao nhất. ${primary} không chỉ là một trang web, đó là một cộng đồng, một cánh cửa mở ra thế giới giải trí đa sắc màu. Chúng tôi hiểu rằng bạn luôn tìm kiếm sự mới mẻ, và đó là lý do tại sao chúng tôi không ngừng nỗ lực để mang đến những nội dung độc đáo, táo bạo và đầy cuốn hút như ${secondary}. Hãy tham gia cùng chúng tôi để không bỏ lỡ bất kỳ điều gì.</p>
    `,
    (primary: string, secondary: string) => `
        <p>Trong thế giới số không ngừng biến đổi, việc tìm kiếm một nguồn cung cấp nội dung đáng tin cậy như ${primary} là điều cần thiết. Chúng tôi chuyên sâu về các lĩnh vực như ${secondary}, mang đến cho bạn những bộ sưu tập đặc sắc và phong phú nhất. Sứ mệnh của chúng tôi là tạo ra một không gian nơi bạn có thể tự do khám phá, học hỏi và giải trí mà không gặp bất kỳ rào cản nào. Mỗi sản phẩm trên nền tảng của chúng tôi đều được tuyển chọn cẩn thận, đảm bảo chất lượng và tính độc đáo.</p>
        <p>Chúng tôi không chỉ cung cấp nội dung, chúng tôi tạo ra trải nghiệm. ${primary} là nơi bạn có thể tìm thấy những gì mà các nền tảng khác không có. Từ những video nghệ thuật đến các clip giải trí đời thường, sự đa dạng của ${secondary} sẽ khiến bạn phải kinh ngạc. Hãy để chúng tôi đồng hành cùng bạn trong những giờ phút thư giãn, mang lại niềm vui và sự hứng khởi. Đội ngũ của chúng tôi luôn làm việc không ngừng nghỉ để làm phong phú thêm kho nội dung và nâng cao chất lượng dịch vụ, vì sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi.</p>
    `,
    (primary: string, secondary: string) => `
        <p>Đã đến lúc nâng tầm trải nghiệm giải trí của bạn với ${primary}. Nếu bạn là một người hâm mộ cuồng nhiệt của ${secondary}, thì đây chính là nơi bạn thuộc về. Chúng tôi mang đến một bộ sưu tập khổng lồ các nội dung được phân loại rõ ràng, giúp bạn dễ dàng tìm thấy chính xác những gì mình muốn. Từ những thể loại phổ biến đến những viên ngọc ẩn, tất cả đều được trình bày một cách chuyên nghiệp và hấp dẫn. Chúng tôi tin rằng chất lượng làm nên sự khác biệt, và đó là kim chỉ nam cho mọi hoạt động của chúng tôi.</p>
        <p>Hãy tưởng tượng một nơi mà bạn có thể truy cập vào kho tàng giải trí vô tận chỉ với vài cú nhấp chuột. Đó chính là ${primary}. Chúng tôi tự hào về việc xây dựng một nền tảng ổn định, an toàn và luôn đặt người dùng lên hàng đầu. Sự kết hợp giữa nội dung ${secondary} đa dạng và giao diện trực quan tạo nên một trải nghiệm không thể tuyệt vời hơn. Đừng ngần ngại, hãy bước vào thế giới của chúng tôi và để những nội dung đỉnh cao thổi bùng lên ngọn lửa đam mê trong bạn. Chúng tôi luôn sẵn sàng chào đón bạn.</p>
    `,
    (primary: string, secondary: string) => `
        <p>Thế giới giải trí luôn sôi động và ${primary} tự hào là một trong những người dẫn đầu xu hướng. Với sự tập trung đặc biệt vào các nội dung như ${secondary}, chúng tôi đã và đang xây dựng một cộng đồng vững mạnh gồm những người có cùng sở thích. Tại đây, bạn không chỉ là một người xem, bạn là một phần của một phong trào, một nền văn hóa. Chúng tôi cung cấp những nội dung độc quyền mà bạn sẽ không tìm thấy ở bất kỳ nơi nào khác, từ các nhà sản xuất tài năng trên khắp thế giới.</p>
        <p>Sự khác biệt của ${primary} nằm ở cam kết về chất lượng và sự đa dạng. Chúng tôi hiểu rằng mỗi người có một gu thưởng thức riêng, và kho nội dung của chúng tôi phản ánh điều đó. Cho dù bạn đang tìm kiếm những giây phút giải trí nhanh chóng hay muốn đắm chìm trong những câu chuyện có chiều sâu, ${secondary} tại nền tảng của chúng tôi đều có thể đáp ứng. Hãy tham gia và trải nghiệm sự khác biệt. Với hệ thống đề xuất thông minh, bạn sẽ luôn khám phá được những điều mới mẻ và thú vị mỗi ngày.</p>
    `
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

    const titleWithLink = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${input.secondaryKeyword}`;
    const title = `${titleWithLink} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;

    // Select a random template
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const articleBody = randomTemplate(input.primaryKeyword, input.secondaryKeyword);
    
    const callToAction = `<h2><a href="${input.domain}" target="_blank" rel="noopener noreferrer">点击这里，立即访问我们的网站，发现更多精彩内容！</a></h2>`;

    const fullContent = `<h1>${titleWithLink}</h1>${articleBody}${callToAction}`;

    return {
        title: title,
        content: fullContent,
    };
  }
);
