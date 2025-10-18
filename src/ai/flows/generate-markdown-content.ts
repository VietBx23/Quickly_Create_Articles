
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
    (pk: string, sks: string[]) => `<p>🌟 Chào mừng đến với <strong>${pk}</strong>, điểm đến giải trí trực tuyến hàng đầu! Chúng tôi chuyên cung cấp những nội dung độc đáo và hấp dẫn.</p><p>Nếu bạn yêu thích ${sks[0]} hoặc đang tìm kiếm ${sks[1]}, bạn đã đến đúng nơi.</p><p>Hãy sẵn sàng khám phá một thế giới giải trí đa dạng, nơi ${sks[2]} chỉ là một phần nhỏ trong kho tàng nội dung của chúng tôi.</p>`,
    (pk: string, sks: string[]) => `<p>🎬 Bạn đang tìm kiếm trải nghiệm giải trí chân thực? <strong>${pk}</strong> chính là câu trả lời.</p><p>Chúng tôi tự hào mang đến cho bạn những nội dung về ${sks[0]} và nhiều hơn thế nữa.</p><p>Nền tảng của chúng tôi liên tục cập nhật các xu hướng mới nhất, từ ${sks[1]} đến ${sks[2]}, đảm bảo bạn luôn có những điều mới mẻ để khám phá mỗi ngày.</p>`,
    (pk: string, sks: string[]) => `<p>🔥 Khám phá thế giới giải trí không giới hạn với <strong>${pk}</strong>.</p><p>Chúng tôi có một thư viện nội dung khổng lồ, đặc biệt là về ${sks[0]}.</p><p>Dù bạn muốn thư giãn với ${sks[1]} hay tìm hiểu sâu hơn về ${sks[2]}, chúng tôi đều có thể đáp ứng. Chất lượng và sự đa dạng là ưu tiên hàng đầu của chúng tôi.</p>`,
    (pk: string, sks: string[]) => `<p>💎 Nâng tầm trải nghiệm giải trí của bạn với <strong>${pk}</strong>.</p><p>Chúng tôi tập trung vào các lĩnh vực bạn yêu thích như ${sks[0]}.</p><p>Kho nội dung của chúng tôi, từ ${sks[1]} đến ${sks[2]}, luôn được làm mới hàng ngày.</p><p>Hãy tham gia cộng đồng của chúng tôi để không bỏ lỡ bất kỳ điều gì!</p>`,
];

const MIDDLE_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🚀 Công nghệ tiên tiến là xương sống của nền tảng <strong>${pk}</strong>.</p><p>Chúng tôi đầu tư vào hạ tầng hiện đại để mang lại trải nghiệm xem mượt mà, không giật lag.</p><p>Thưởng thức ${sks[0]} với chất lượng hình ảnh sắc nét và âm thanh sống động.</p><p>Giao diện thân thiện giúp bạn dễ dàng tìm kiếm nội dung về ${sks[1]}.</p><p>Hệ thống đề xuất thông minh của chúng tôi sẽ gợi ý cho bạn những video hấp dẫn liên quan đến ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>💡 Hãy quên đi những phiền toái về chất lượng thấp. Tại <strong>${pk}</strong>, chúng tôi tối ưu hóa để mang lại tốc độ tải nhanh và độ phân giải cao cho các nội dung như ${sks[0]}.</p><p>Chúng tôi không chỉ là một trang web, mà là một cộng đồng sôi nổi, nơi bạn có thể khám phá ${sks[1]} và nhiều hơn nữa.</p><p>Chúng tôi luôn mang đến những nội dung sáng tạo, phá vỡ mọi giới hạn, bao gồm cả ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>🔒 Tìm kiếm một nguồn cung cấp nội dung đáng tin cậy? <strong>${pk}</strong> là lựa chọn hàng đầu, đặc biệt trong lĩnh vực ${sks[0]}.</p><p>Sứ mệnh của chúng tôi là tạo ra một không gian an toàn để bạn khám phá ${sks[1]} và giải trí với ${sks[2]}.</p><p>Mỗi sản phẩm đều qua kiểm duyệt nghiêm ngặt, đảm bảo chất lượng và tính độc đáo.</p>`,
    (pk: string, sks: string[]) => `<p>🌍 Sự khác biệt của <strong>${pk}</strong> nằm ở cam kết về chất lượng và sự đa dạng.</p><p>Chúng tôi hiểu mỗi người có một sở thích riêng, và kho nội dung về ${sks[0]} của chúng tôi phản ánh điều đó.</p><p>Dù bạn muốn giải trí nhanh với ${sks[1]} hay đắm chìm trong những câu chuyện của ${sks[2]}, chúng tôi đều đáp ứng được.</p>`,
    (pk: string, sks: string[]) => `<p>📈 Chúng tôi tạo ra một hệ sinh thái giải trí toàn diện tại <strong>${pk}</strong>.</p><p>Bạn có thể tham gia thảo luận về ${sks[0]} và chia sẻ khoảnh khắc yêu thích.</p><p>Nền tảng tích hợp các tính năng xã hội để bạn kết nối với những người có cùng sở thích về ${sks[1]} và ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>📱 Trải nghiệm giải trí không gián đoạn trên mọi thiết bị. Nền tảng <strong>${pk}</strong> hoạt động hoàn hảo trên máy tính, máy tính bảng và điện thoại.</p><p>Dù bạn ở đâu, bạn đều có thể truy cập và thưởng thức ${sks[0]} và ${sks[1]}.</p><p>Thế giới giải trí về ${sks[2]} luôn nằm gọn trong túi của bạn.</p>`,
    (pk: string, sks: string[]) => `<p>🎨 Giao diện người dùng của <strong>${pk}</strong> được thiết kế tinh tế và trực quan.</p><p>Việc tìm kiếm và khám phá nội dung về ${sks[0]} chưa bao giờ dễ dàng hơn.</p><p>Chúng tôi tập trung vào trải nghiệm người dùng, giúp bạn dễ dàng điều hướng qua các danh mục, từ ${sks[1]} đến ${sks[2]}, chỉ với vài cú nhấp chuột.</p>`,
    (pk: string, sks: string[]) => `<p>🌐 Cộng đồng người dùng của <strong>${pk}</strong> là một phần không thể thiếu.</p><p>Hãy tham gia cùng hàng triệu người dùng khác để chia sẻ niềm đam mê với ${sks[0]}.</p><p>Bạn có thể để lại bình luận, đánh giá các nội dung về ${sks[1]}, và kết nối với những người bạn mới có cùng sở thích ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>🎁 Nhiều chương trình ưu đãi và phần thưởng hấp dẫn đang chờ bạn tại <strong>${pk}</strong>.</p><p>Chúng tôi thường xuyên tổ chức các sự kiện đặc biệt liên quan đến ${sks[0]}.</p><p>Hãy theo dõi để không bỏ lỡ cơ hội nhận những phần quà độc quyền khi bạn thưởng thức ${sks[1]} và khám phá ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>🎧 Chất lượng âm thanh đỉnh cao là một điểm nhấn tại <strong>${pk}</strong>.</p><p>Trải nghiệm ${sks[0]} với âm thanh vòm sống động, mang lại cảm giác chân thực nhất.</p><p>Chúng tôi hỗ trợ nhiều định dạng âm thanh khác nhau, từ đó nâng cao trải nghiệm của bạn với ${sks[1]} và ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>🔍 Chức năng tìm kiếm thông minh của <strong>${pk}</strong> giúp bạn nhanh chóng tìm thấy chính xác những gì bạn cần.</p><p>Chỉ cần gõ từ khóa về ${sks[0]}, kết quả sẽ hiện ra ngay lập tức.</p><p>Bộ lọc nâng cao cho phép bạn sắp xếp nội dung theo nhiều tiêu chí khác nhau, giúp việc khám phá ${sks[1]} và ${sks[2]} trở nên dễ dàng hơn.</p>`,
    (pk: string, sks: string[]) => `<p>💯 Chúng tôi cam kết mang đến nội dung độc quyền mà bạn không thể tìm thấy ở nơi khác.</p><p><strong>${pk}</strong> hợp tác với các nhà sản xuất hàng đầu để cung cấp ${sks[0]} mới nhất.</p><p>Thư viện của chúng tôi luôn được cập nhật với các tác phẩm ${sks[1]} và xu hướng ${sks[2]} đang thịnh hành.</p>`,
];

const CTA_BLOCKS = [
    (url: string, display: string) => `<h2>👉 Nhấn vào đây để khám phá <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> ngay!</h2>`,
    (url: string, display: string) => `<h2>🚀 Truy cập <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> để bắt đầu hành trình của bạn!</h2>`,
    (url: string, display: string) => `<h2>🔥 Trải nghiệm ngay tại <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> để không bỏ lỡ!</h2>`,
    (url: string, display: string) => `<h2>💎 Gia nhập cộng đồng ưu tú tại <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a>!</h2>`,
];

const CLOSING_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🎉 Đã đến lúc nâng tầm trải nghiệm của bạn với <strong>${pk}</strong>.</p><p>Nếu bạn là fan của ${sks[0]}, đây chính là nơi dành cho bạn.</p><p>Chúng tôi mang đến bộ sưu tập từ ${sks[1]} đến ${sks[2]}, được phân loại rõ ràng, giúp bạn dễ dàng tìm kiếm.</p>`,
    (pk: string, sks: string[]) => `<p>💯 Hãy tưởng tượng một nơi bạn có thể truy cập kho tàng ${sks[0]} chỉ với vài cú nhấp chuột.</p><p>Đó chính là <strong>${pk}</strong>.</p><p>Sự kết hợp giữa nội dung đa dạng như ${sks[1]} và ${sks[2]} cùng giao diện đẹp mắt tạo nên một trải nghiệm tuyệt vời.</p>`,
    (pk: string, sks: string[]) => `<p>✨ Với <strong>${pk}</strong>, mỗi ngày đều là một khám phá mới.</p><p>Chúng tôi liên tục mang đến nội dung độc đáo từ ${sks[0]} kinh điển đến ${sks[1]} hiện đại.</p><p>Đội ngũ của chúng tôi đảm bảo bạn luôn có những điều mới mẻ để mong đợi, bao gồm cả xu hướng ${sks[2]}.</p>`,
    (pk: string, sks: string[]) => `<p>💖 Sự hài lòng của bạn là ưu tiên số một tại <strong>${pk}</strong>.</p><p>Chúng tôi cung cấp nội dung ${sks[0]} chất lượng và hỗ trợ khách hàng 24/7.</p><p>Mọi thắc mắc về ${sks[1]} hay ${sks[2]} sẽ được giải đáp nhanh chóng. Hãy gia nhập để cảm nhận sự khác biệt!</p>`,
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
    const cta = getRandomItem(CTA_BLOCKS)(input.domain, displayDomain);
    const closing = getRandomItem(CLOSING_BLOCKS)(input.primaryKeyword, sks);

    const fullContent = `<h1>${titleWithLink}</h1>${intro}${middle1}${cta}${middle2}${closing}`;
    // --- End Dynamic Content Assembly ---

    return {
        title: title,
        content: fullContent,
    };
  }
);

    