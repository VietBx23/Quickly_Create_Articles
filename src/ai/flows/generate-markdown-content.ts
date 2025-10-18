
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
  secondaryKeywords: z.array(z.string()).describe('A list of secondary keywords (up to 3).'),
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
    (pk: string, sks: string[]) => `<p>🌟 Chào mừng quý vị đến với một không gian giải trí trực tuyến hoàn toàn mới, nơi mọi giới hạn đều được xóa nhòa và những trải nghiệm đỉnh cao đang chờ đón. Chúng tôi tự hào giới thiệu <strong>${pk}</strong>, nền tảng hàng đầu dành cho những ai đang tìm kiếm sự khác biệt và độc đáo. Nếu bạn đã từng nghe qua về ${sks[0]} hoặc ${sks[1]}, bạn sẽ hiểu được sức hấp dẫn không thể chối từ của những nội dung chất lượng cao mà chúng tôi mang lại. Tại đây, mỗi khoảnh khắc không chỉ là giải trí, mà còn là một cuộc phiêu lưu đầy màu sắc, một câu chuyện về ${sks[2]} đang chờ được bạn khám phá và chinh phục. Chúng tôi không ngừng cập nhật hệ thống để đảm bảo rằng bạn luôn là người đầu tiên tiếp cận những nội dung mới nhất, nóng hổi nhất, đáp ứng mọi nhu cầu và sở thích dù là khắt khe nhất.</p>`,
    (pk: string, sks: string[]) => `<p>🎬 Bạn có phải là người đam mê những trải nghiệm giải trí chân thực và sống động? Bạn đang tìm kiếm một địa chỉ uy tín để khám phá những nội dung độc quyền và hấp dẫn nhất? <strong>${pk}</strong> chính là câu trả lời hoàn hảo dành cho bạn. Chúng tôi tự hào là điểm đến lý tưởng cho những người hâm mộ cuồng nhiệt của ${sks[0]} và luôn khao khát được trải nghiệm những gì tinh túy và đẳng cấp nhất, chẳng hạn như ${sks[1]}. Với một kho nội dung khổng lồ, bao gồm cả ${sks[2]}, được chọn lọc kỹ lưỡng bởi đội ngũ chuyên gia và cập nhật liên tục hàng ngày, chúng tôi tự tin sẽ làm hài lòng cả những khán giả khó tính nhất. Từ những tác phẩm kinh điển vượt thời gian đến các xu hướng mới nổi đang làm mưa làm gió trên toàn cầu, tất cả đều hội tụ tại đây, sẵn sàng để bạn khám phá.</p>`,
    (pk: string, sks: string[]) => `<p>🔥 Bước vào một thế giới giải trí không giới hạn với <strong>${pk}</strong>, nơi định nghĩa lại trải nghiệm xem của bạn. Chúng tôi mang đến một thư viện nội dung khổng lồ, đặc biệt là các thể loại đang được săn đón như ${sks[0]}. Nếu bạn đang tìm kiếm những phút giây thư giãn với ${sks[1]} hay muốn khám phá sâu hơn về ${sks[2]}, chúng tôi có tất cả. Nền tảng của chúng tôi được xây dựng để trở thành điểm đến cuối cùng cho mọi nhu cầu giải trí, nơi chất lượng và sự đa dạng luôn được đặt lên hàng đầu. Hãy sẵn sàng cho một cuộc hành trình đầy bất ngờ và thú vị!</p>`,
    (pk: string, sks: string[]) => `<p>💎 Bạn đã sẵn sàng để nâng tầm trải nghiệm giải trí của mình lên một đẳng cấp hoàn toàn mới chưa? <strong>${pk}</strong> hân hạnh mang đến cho bạn một bộ sưu tập nội dung độc quyền và chọn lọc, tập trung vào các lĩnh vực mà bạn yêu thích nhất như ${sks[0]}. Chúng tôi hiểu rằng bạn luôn tìm kiếm sự mới mẻ, và đó là lý do tại sao kho nội dung của chúng tôi, từ ${sks[1]} đến ${sks[2]}, luôn được làm mới mỗi ngày. Hãy gia nhập cộng đồng của chúng tôi để không bỏ lỡ bất kỳ khoảnh khắc giải trí đỉnh cao nào, tất cả đều nằm trong tầm tay bạn.</p>`,
];

const MIDDLE_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🚀 Công nghệ tiên tiến là xương sống của nền tảng chúng tôi. Chúng tôi đã đầu tư mạnh mẽ vào hạ tầng máy chủ và công nghệ streaming hiện đại nhất để mang đến cho bạn trải nghiệm xem <strong>${pk}</strong> mượt mà, ổn định, không giật lag. Thưởng thức ${sks[0]} với chất lượng hình ảnh 4K và âm thanh vòm sống động. Giao diện người dùng được thiết kế thân thiện, thông minh và cực kỳ dễ sử dụng, giúp bạn dễ dàng tìm kiếm, lọc và tận hưởng những nội dung yêu thích về ${sks[1]} chỉ trong vài cú nhấp chuột. Hệ thống đề xuất nội dung của chúng tôi, dựa trên trí tuệ nhân tạo, sẽ học hỏi sở thích của bạn và đưa ra những gợi ý phù hợp, giúp bạn không bao giờ bỏ lỡ những video hấp dẫn liên quan đến ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>💡 Hãy quên đi những phiền toái về trải nghiệm xem video gián đoạn và chất lượng thấp. Nền tảng của chúng tôi được tối ưu hóa đến từng chi tiết để mang lại tốc độ tải nhanh như chớp và độ phân giải cao nhất cho các nội dung như ${sks[0]} và ${sks[1]}. <strong>${pk}</strong> không chỉ đơn thuần là một trang web giải trí, mà còn là một cộng đồng sôi nổi, một cánh cửa thần kỳ mở ra thế giới giải trí đa sắc màu. Chúng tôi hiểu rằng bạn luôn tìm kiếm sự mới mẻ và độc đáo, và đó là lý do tại sao đội ngũ của chúng tôi không ngừng nỗ lực để mang đến những nội dung táo bạo, sáng tạo và đầy cuốn hút như ${sks[2]}, phá vỡ mọi giới hạn thông thường.</p>`,
    (pk: string, sks: string[]) => `<p>🔒 Trong thế giới số không ngừng biến đổi, việc tìm kiếm một nguồn cung cấp nội dung đáng tin cậy và an toàn như <strong>${pk}</strong> là điều cần thiết hơn bao giờ hết. Chúng tôi chuyên sâu về các lĩnh vực giải trí đặc sắc như ${sks[0]}, mang đến cho bạn những bộ sưu tập phong phú và được tuyển chọn kỹ càng nhất. Sứ mệnh của chúng tôi là tạo ra một không gian nơi bạn có thể tự do khám phá ${sks[1]} và giải trí với ${sks[2]} mà không phải lo lắng về bất kỳ rào cản nào, bảo mật thông tin cá nhân của bạn tuyệt đối. Mỗi sản phẩm trên nền tảng của chúng tôi đều trải qua quá trình kiểm duyệt nghiêm ngặt, đảm bảo chất lượng nội dung và tính độc đáo, mang lại cho bạn sự yên tâm tuyệt đối.</p>`,
    (pk: string, sks: string[]) => `<p>🌍 Sự khác biệt của <strong>${pk}</strong> nằm ở cam kết sắt đá về chất lượng và sự đa dạng trong kho nội dung. Chúng tôi hiểu rằng mỗi người có một gu thưởng thức riêng, và kho nội dung khổng lồ về ${sks[0]} của chúng tôi phản ánh chính xác điều đó. Cho dù bạn đang tìm kiếm những giây phút giải trí nhanh chóng với ${sks[1]} sau một ngày làm việc căng thẳng hay muốn đắm chìm trong những câu chuyện có chiều sâu của ${sks[2]}, nền tảng của chúng tôi đều có thể đáp ứng một cách hoàn hảo. Hãy để chúng tôi trở thành người bạn đồng hành đáng tin cậy trong những giờ phút thư giãn, mang lại niềm vui và sự hứng khởi bất tận cho cuộc sống của bạn.</p>`,
    (pk: string, sks: string[]) => `<p>📈 Chúng tôi không chỉ dừng lại ở việc cung cấp nội dung. Tại <strong>${pk}</strong>, chúng tôi tạo ra một hệ sinh thái giải trí toàn diện. Bạn có thể tham gia vào các cuộc thảo luận sôi nổi về ${sks[0]}, đánh giá và chia sẻ những khoảnh khắc yêu thích của bạn từ ${sks[1]}. Nền tảng của chúng tôi còn tích hợp các tính năng xã hội độc đáo, cho phép bạn kết nối với những người có cùng sở thích về ${sks[2]}. Chúng tôi tin rằng giải trí sẽ tuyệt vời hơn khi được chia sẻ, và chúng tôi đang xây dựng một cộng đồng lớn mạnh nơi mọi người có thể cùng nhau khám phá và tận hưởng.</p>`,
    (pk: string, sks: string[]) => `<p>📱 Trải nghiệm giải trí không gián đoạn trên mọi thiết bị. Nền tảng <strong>${pk}</strong> được thiết kế với công nghệ responsive, hoạt động hoàn hảo trên cả máy tính, máy tính bảng và điện thoại thông minh. Dù bạn đang ở nhà, trên xe buýt hay đang đi du lịch, bạn đều có thể dễ dàng truy cập và thưởng thức các nội dung đặc sắc như ${sks[0]} và ${sks[1]}. Chúng tôi đã tối ưu hóa ứng dụng để đảm bảo tốc độ tải trang nhanh nhất và tiết kiệm dữ liệu di động. Thế giới giải trí về ${sks[2]} giờ đây luôn nằm gọn trong túi của bạn, sẵn sàng mọi lúc, mọi nơi.</p>`,
];

const CTA_BLOCKS = [
    (domain: string) => `<h2><a href="${domain}" target="_blank" rel="noopener noreferrer">👉 Đừng chần chừ nữa! Nhấn vào đây để khám phá thế giới giải trí tại ${domain} ngay hôm nay và nhận những ưu đãi độc quyền!</a></h2>`,
    (domain: string) => `<h2><a href="${domain}" target="_blank" rel="noopener noreferrer">🚀 Cánh cửa đến với thế giới giải trí đỉnh cao đang ở ngay trước mắt. Truy cập ${domain} để bắt đầu hành trình của bạn!</a></h2>`,
    (domain: string) => `<h2><a href="${domain}" target="_blank" rel="noopener noreferrer">🔥 Trải nghiệm ngay hôm nay! Truy cập ${domain} để không bỏ lỡ bất kỳ nội dung nóng hổi nào!</a></h2>`,
    (domain: string) => `<h2><a href="${domain}" target="_blank" rel="noopener noreferrer">💎 Gia nhập cộng đồng ưu tú! Nhấn vào ${domain} để tận hưởng những đặc quyền chỉ dành cho thành viên!</a></h2>`,
];

const CLOSING_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🎉 Đã đến lúc nâng tầm trải nghiệm giải trí của bạn với <strong>${pk}</strong>. Nếu bạn là một người hâm mộ cuồng nhiệt của ${sks[0]}, thì đây chính là nơi bạn thuộc về. Chúng tôi mang đến một bộ sưu tập khổng lồ các nội dung từ ${sks[1]} đến ${sks[2]}, được phân loại rõ ràng, khoa học, giúp bạn dễ dàng tìm thấy chính xác những gì mình muốn. Từ những thể loại phổ biến nhất đến những viên ngọc ẩn đang chờ được khám phá, tất cả đều được trình bày một cách chuyên nghiệp và hấp dẫn. Chúng tôi tin rằng chất lượng làm nên sự khác biệt, và đó là kim chỉ nam cho mọi hoạt động của chúng tôi.</p>`,
    (pk: string, sks: string[]) => `<p>💯 Hãy tưởng tượng một nơi mà bạn có thể truy cập vào kho tàng giải trí vô tận về ${sks[0]} chỉ với vài cú nhấp chuột, trên mọi thiết bị. Đó chính là <strong>${pk}</strong>. Chúng tôi tự hào về việc xây dựng một nền tảng ổn định, an toàn và luôn đặt trải nghiệm người dùng lên hàng đầu. Sự kết hợp hoàn hảo giữa nội dung đa dạng như ${sks[1]} và ${sks[2]}, cùng một giao diện trực quan, đẹp mắt tạo nên một trải nghiệm không thể tuyệt vời hơn. Đừng ngần ngại, hãy bước vào thế giới của chúng tôi và để những nội dung đỉnh cao thổi bùng lên ngọn lửa đam mê trong bạn.</p>`,
    (pk: string, sks: string[]) => `<p>✨ Với <strong>${pk}</strong>, mỗi ngày đều là một khám phá mới. Chúng tôi liên tục phá vỡ các giới hạn để mang đến những nội dung độc đáo và sáng tạo nhất, từ ${sks[0]} kinh điển đến ${sks[1]} hiện đại. Đội ngũ của chúng tôi làm việc không ngừng nghỉ để đảm bảo rằng bạn luôn có những điều mới mẻ để mong đợi, bao gồm cả những xu hướng ${sks[2]} đang thịnh hành. Hãy để chúng tôi là người dẫn đường cho bạn trong thế giới giải trí đầy màu sắc, nơi mọi đam mê đều được trân trọng và thỏa mãn.</p>`,
    (pk: string, sks: string[]) => `<p>💖 Sự hài lòng của bạn là ưu tiên số một của chúng tôi tại <strong>${pk}</strong>. Chúng tôi không chỉ cung cấp nội dung ${sks[0]} chất lượng, mà còn mang đến dịch vụ hỗ trợ khách hàng 24/7. Mọi thắc mắc của bạn về ${sks[1]} hay ${sks[2]} sẽ được giải đáp một cách nhanh chóng và chuyên nghiệp. Chúng tôi lắng nghe mọi phản hồi của bạn để không ngừng cải thiện và hoàn thiện nền tảng, mang đến một không gian giải trí an toàn, công bằng và thú vị nhất. Hãy gia nhập ngay để cảm nhận sự khác biệt!</p>`,
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

    // Pad secondary keywords if less than 3 are provided
    const sks = [...input.secondaryKeywords];
    while (sks.length < 3) {
      sks.push(sks[sks.length - 1] || input.primaryKeyword);
    }
    
    const secondaryKeywordsForTitle = sks.slice(0, 3).join(' - ');

    const titleWithLink = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${secondaryKeywordsForTitle}`;
    const title = `${titleWithLink} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;

    // --- Dynamic Content Assembly ---
    const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Shuffle middle blocks to get more variety
    const shuffledMiddleBlocks = [...MIDDLE_BLOCKS].sort(() => 0.5 - Math.random());

    const intro = getRandomItem(INTRO_BLOCKS)(input.primaryKeyword, sks);
    const middle1 = shuffledMiddleBlocks[0](input.primaryKeyword, sks);
    const middle2 = shuffledMiddleBlocks[1](input.primaryKeyword, sks);
    const cta = getRandomItem(CTA_BLOCKS)(input.domain);
    const closing = getRandomItem(CLOSING_BLOCKS)(input.primaryKeyword, sks);

    const fullContent = `<h1>${titleWithLink}</h1>${intro}${middle1}${cta}${middle2}${closing}`;
    // --- End Dynamic Content Assembly ---

    return {
        title: title,
        content: fullContent,
    };
  }
);
