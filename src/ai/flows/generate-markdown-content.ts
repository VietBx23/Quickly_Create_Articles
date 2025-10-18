
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

// --- Dynamic Content Generation System ---

const INTRO_BLOCKS = [
    (primary: string, secondary: string) => `<p>Chào mừng quý vị đến với một không gian giải trí trực tuyến hoàn toàn mới, nơi mọi giới hạn đều được xóa nhòa và những trải nghiệm đỉnh cao đang chờ đón. Chúng tôi tự hào giới thiệu <strong>${primary}</strong>, nền tảng hàng đầu dành cho những ai đang tìm kiếm sự khác biệt và độc đáo. Nếu bạn đã từng nghe qua về ${secondary}, bạn sẽ hiểu được sức hấp dẫn không thể chối từ của những nội dung chất lượng cao mà chúng tôi mang lại. Tại đây, mỗi khoảnh khắc không chỉ là giải trí, mà còn là một cuộc phiêu lưu đầy màu sắc, một câu chuyện đang chờ được bạn khám phá và chinh phục. Chúng tôi không ngừng cập nhật hệ thống để đảm bảo rằng bạn luôn là người đầu tiên tiếp cận những nội dung mới nhất, nóng hổi nhất, đáp ứng mọi nhu cầu và sở thích dù là khắt khe nhất.</p>`,
    (primary: string, secondary: string) => `<p>Bạn có phải là người đam mê những trải nghiệm giải trí chân thực và sống động? Bạn đang tìm kiếm một địa chỉ uy tín để khám phá những nội dung độc quyền và hấp dẫn nhất? <strong>${primary}</strong> chính là câu trả lời hoàn hảo dành cho bạn. Chúng tôi tự hào là điểm đến lý tưởng cho những người hâm mộ cuồng nhiệt của ${secondary} và luôn khao khát được trải nghiệm những gì tinh túy và đẳng cấp nhất. Với một kho nội dung khổng lồ, được chọn lọc kỹ lưỡng bởi đội ngũ chuyên gia và cập nhật liên tục hàng ngày, chúng tôi tự tin sẽ làm hài lòng cả những khán giả khó tính nhất. Từ những tác phẩm kinh điển vượt thời gian đến các xu hướng mới nổi đang làm mưa làm gió trên toàn cầu, tất cả đều hội tụ tại đây, sẵn sàng để bạn khám phá.</p>`,
];

const MIDDLE_BLOCKS = [
    (primary: string, secondary: string) => `<p>Công nghệ tiên tiến là xương sống của nền tảng chúng tôi. Chúng tôi đã đầu tư mạnh mẽ vào hạ tầng máy chủ và công nghệ streaming tiên tiến nhất để mang đến cho bạn trải nghiệm xem mượt mà, ổn định, không giật lag, với chất lượng hình ảnh và âm thanh vượt trội. Giao diện người dùng được thiết kế thân thiện, thông minh và cực kỳ dễ sử dụng, giúp bạn dễ dàng tìm kiếm, lọc và tận hưởng những nội dung yêu thích chỉ trong vài cú nhấp chuột. Hệ thống đề xuất nội dung của chúng tôi, dựa trên trí tuệ nhân tạo, sẽ học hỏi sở thích của bạn và đưa ra những gợi ý phù hợp, giúp bạn không bao giờ bỏ lỡ những video hấp dẫn liên quan đến ${primary} và ${secondary}.</p>`,
    (primary: string, secondary: string) => `<p>Hãy quên đi những phiền toái về trải nghiệm xem video gián đoạn và chất lượng thấp. Nền tảng của chúng tôi được tối ưu hóa đến từng chi tiết để mang lại tốc độ tải nhanh như chớp và độ phân giải cao nhất, từ Full HD đến 4K. <strong>${primary}</strong> không chỉ đơn thuần là một trang web giải trí, mà còn là một cộng đồng sôi nổi, một cánh cửa thần kỳ mở ra thế giới giải trí đa sắc màu. Chúng tôi hiểu rằng bạn luôn tìm kiếm sự mới mẻ và độc đáo, và đó là lý do tại sao đội ngũ của chúng tôi không ngừng nỗ lực để mang đến những nội dung táo bạo, sáng tạo và đầy cuốn hút như ${secondary}, phá vỡ mọi giới hạn thông thường.</p>`,
    (primary: string, secondary: string) => `<p>Trong thế giới số không ngừng biến đổi, việc tìm kiếm một nguồn cung cấp nội dung đáng tin cậy và an toàn như <strong>${primary}</strong> là điều cần thiết hơn bao giờ hết. Chúng tôi chuyên sâu về các lĩnh vực giải trí đặc sắc như ${secondary}, mang đến cho bạn những bộ sưu tập phong phú và được tuyển chọn kỹ càng nhất. Sứ mệnh của chúng tôi là tạo ra một không gian nơi bạn có thể tự do khám phá, học hỏi và giải trí mà không phải lo lắng về bất kỳ rào cản nào. Mỗi sản phẩm trên nền tảng của chúng tôi đều trải qua quá trình kiểm duyệt nghiêm ngặt, đảm bảo chất lượng nội dung và tính độc đáo, mang lại cho bạn sự yên tâm tuyệt đối.</p>`,
    (primary: string, secondary: string) => `<p>Sự khác biệt của <strong>${primary}</strong> nằm ở cam kết sắt đá về chất lượng và sự đa dạng trong kho nội dung. Chúng tôi hiểu rằng mỗi người có một gu thưởng thức và sở thích riêng, và kho nội dung khổng lồ của chúng tôi phản ánh chính xác điều đó. Cho dù bạn đang tìm kiếm những giây phút giải trí nhanh chóng sau một ngày làm việc căng thẳng hay muốn đắm chìm trong những câu chuyện có chiều sâu, những nội dung về ${secondary} tại nền tảng của chúng tôi đều có thể đáp ứng một cách hoàn hảo. Hãy để chúng tôi trở thành người bạn đồng hành đáng tin cậy trong những giờ phút thư giãn, mang lại niềm vui và sự hứng khởi bất tận cho cuộc sống của bạn.</p>`,
];

const CTA_BLOCKS = [
    (domain: string) => `<h2><a href="${domain}" target="_blank" rel="noopener noreferrer">Đừng chần chừ nữa! Nhấn vào đây để khám phá thế giới ${domain} ngay hôm nay và nhận những ưu đãi độc quyền!</a></h2>`,
    (domain: string) => `<h2><a href="${domain}" target="_blank" rel="noopener noreferrer">Cánh cửa đến với thế giới giải trí đỉnh cao đang ở ngay trước mắt. Truy cập ${domain} để bắt đầu hành trình của bạn!</a></h2>`,
];

const CLOSING_BLOCKS = [
    (primary: string, secondary: string) => `<p>Đã đến lúc nâng tầm trải nghiệm giải trí của bạn với <strong>${primary}</strong>. Nếu bạn là một người hâm mộ cuồng nhiệt của ${secondary}, thì đây chính là nơi bạn thuộc về. Chúng tôi mang đến một bộ sưu tập khổng lồ các nội dung được phân loại rõ ràng, khoa học, giúp bạn dễ dàng tìm thấy chính xác những gì mình muốn. Từ những thể loại phổ biến nhất đến những viên ngọc ẩn đang chờ được khám phá, tất cả đều được trình bày một cách chuyên nghiệp và hấp dẫn. Chúng tôi tin rằng chất lượng làm nên sự khác biệt, và đó là kim chỉ nam cho mọi hoạt động của chúng tôi, từ việc lựa chọn nội dung đến dịch vụ hỗ trợ khách hàng.</p>`,
    (primary: string, secondary: string) => `<p>Hãy tưởng tượng một nơi mà bạn có thể truy cập vào kho tàng giải trí vô tận chỉ với vài cú nhấp chuột, trên mọi thiết bị, từ máy tính đến điện thoại thông minh. Đó chính là <strong>${primary}</strong>. Chúng tôi tự hào về việc xây dựng một nền tảng ổn định, an toàn và luôn đặt trải nghiệm người dùng lên hàng đầu. Sự kết hợp hoàn hảo giữa nội dung ${secondary} đa dạng, phong phú và một giao diện trực quan, đẹp mắt tạo nên một trải nghiệm không thể tuyệt vời hơn. Đừng ngần ngại, hãy bước vào thế giới của chúng tôi và để những nội dung đỉnh cao thổi bùng lên ngọn lửa đam mê trong bạn. Chúng tôi luôn sẵn sàng chào đón bạn gia nhập cộng đồng.</p>`,
];

// --- End Dynamic Content Generation System ---


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

    // --- Dynamic Content Assembly ---
    const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Shuffle middle blocks to get more variety
    const shuffledMiddleBlocks = [...MIDDLE_BLOCKS].sort(() => 0.5 - Math.random());

    const intro = getRandomItem(INTRO_BLOCKS)(input.primaryKeyword, input.secondaryKeyword);
    const middle1 = shuffledMiddleBlocks[0](input.primaryKeyword, input.secondaryKeyword);
    const middle2 = shuffledMiddleBlocks[1](input.primaryKeyword, input.secondaryKeyword);
    const cta = getRandomItem(CTA_BLOCKS)(input.domain);
    const closing = getRandomItem(CLOSING_BLOCKS)(input.primaryKeyword, input.secondaryKeyword);

    const fullContent = `<h1>${titleWithLink}</h1>${intro}${middle1}${cta}${middle2}${closing}`;
    // --- End Dynamic Content Assembly ---

    return {
        title: title,
        content: fullContent,
    };
  }
);
