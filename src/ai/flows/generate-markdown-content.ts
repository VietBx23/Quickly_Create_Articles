
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

// --- Dynamic Content Generation System (Simplified Chinese) ---

const INTRO_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🌟 欢迎来到 <strong>${pk}</strong>，首屈一指的在线娱乐目的地！我们专注于提供独特且引人入胜的内容。</p><p>如果您喜爱 ${sks[0]} 或正在寻找 ${sks[1]}，那您来对地方了。</p><p>准备好探索一个多元化的娱乐世界，其中 ${sks[2]} 只是我们内容宝库的一小部分。</p>`,
    (pk: string, sks: string[]) => `<p>🎬 您在寻找真实的娱乐体验吗？<strong>${pk}</strong> 就是答案。</p><p>我们很自豪能为您带来关于 ${sks[0]} 的内容以及更多。</p><p>我们的平台不断更新最新趋势，从 ${sks[1]} 到 ${sks[2]}，确保您每天都有新鲜事可探索。</p>`,
    (pk: string, sks: string[]) => `<p>🔥 通过 <strong>${pk}</strong> 探索无限的娱乐世界。</p><p>我们拥有庞大的内容库，特别是关于 ${sks[0]} 的内容。</p><p>无论您是想用 ${sks[1]} 放松一下，还是想深入了解 ${sks[2]}，我们都能满足您的需求。品质和多样性是我们的首要任务。</p>`,
    (pk: string, sks: string[]) => `<p>💎 通过 <strong>${pk}</strong> 提升您的娱乐体验。</p><p>我们专注于您喜爱的领域，例如 ${sks[0]}。</p><p>我们的内容库，从 ${sks[1]} 到 ${sks[2]}，每天都在更新。</p><p>加入我们的社群，不错过任何精彩内容！</p>`,
];

const MIDDLE_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🚀 先进技术是 <strong>${pk}</strong> 平台的支柱。</p><p>我们投资于现代化基础设施，以提供流畅、无延迟的观看体验。</p><p>以清晰的画质和生动的音效享受 ${sks[0]}。</p><p>友好的界面可帮助您轻松搜索有关 ${sks[1]} 的内容。</p><p>我们的智能推荐系统会向您推荐与 ${sks[2]} 相关的引人入胜的视频。</p>`,
    (pk: string, sks: string[]) => `<p>💡 忘掉低质量的烦恼。在 <strong>${pk}</strong>，我们进行了优化，为 ${sks[0]} 等内容提供快速的加载速度和高分辨率。</p><p>我们不仅仅是一个网站，而是一个充满活力的社群，您可以在这里探索 ${sks[1]} 等更多内容。</p><p>我们始终带来突破界限的创意内容，包括 ${sks[2]}。</p>`,
    (pk: string, sks: string[]) => `<p>🔒 正在寻找可靠的内容来源？<strong>${pk}</strong> 是您的首选，尤其是在 ${sks[0]} 领域。</p><p>我们的使命是为您创造一个安全的空间，让您探索 ${sks[1]} 并享受 ${sks[2]} 的乐趣。</p><p>每件产品都经过严格审核，确保品质和独特性。</p>`,
    (pk: string, sks: string[]) => `<p>🌍 <strong>${pk}</strong> 的与众不同之处在于我们对品质和多样性的承诺。</p><p>我们了解每个人都有自己的喜好，我们关于 ${sks[0]} 的内容库反映了这一点。</p><p>无论您是想用 ${sks[1]} 快速娱乐一下，还是沉浸在 ${sks[2]} 的故事中，我们都能满足您的需求。</p>`,
    (pk: string, sks: string[]) => `<p>📈 我们在 <strong>${pk}</strong> 创建了一个全面的娱乐生态系统。</p><p>您可以参与关于 ${sks[0]} 的讨论并分享您最喜爱的时刻。</p><p>该平台整合了社交功能，让您可以与对 ${sks[1]} 和 ${sks[2]} 有相同兴趣的人建立联系。</p>`,
    (pk: string, sks: string[]) => `<p>📱 在任何设备上享受不间断的娱乐体验。<strong>${pk}</strong> 平台在电脑、平板电脑和手机上都能完美运作。</p><p>无论您身在何处，都可以访问并享受 ${sks[0]} 和 ${sks[1]}。</p><p>关于 ${sks[2]} 的娱乐世界始终在您的口袋里。</p>`,
    (pk: string, sks: string[]) => `<p>🎨 <strong>${pk}</strong> 的用户界面设计精美且直观。</p><p>寻找和发现关于 ${sks[0]} 的内容从未如此简单。</p><p>我们专注于用户体验，帮助您轻松浏览从 ${sks[1]} 到 ${sks[2]} 的各类类别，只需点击几下。</p>`,
    (pk: string, sks: string[]) => `<p>🌐 <strong>${pk}</strong> 的用户社群是不可或缺的一部分。</p><p>加入数百万其他用户，分享您对 ${sks[0]} 的热情。</p><p>您可以对有关 ${sks[1]} 的内容发表评论、评分，并与有相同 ${sks[2]} 兴趣的新朋友建立联系。</p>`,
    (pk: string, sks: string[]) => `<p>🎁 许多诱人的促销和奖励在 <strong>${pk}</strong> 等着您。</p><p>我们定期举办与 ${sks[0]} 相关的特别活动。</p><p>敬请关注，在您享受 ${sks[1]} 和探索 ${sks[2]} 的同时，不要错过获得独家礼物的机会。</p>`,
    (pk: string, sks: string[]) => `<p>🎧 顶级音质是 <strong>${pk}</strong> 的一大亮点。</p><p>以生动的环绕声体验 ${sks[0]}，带来最真实的感受。</p><p>我们支持多种不同的音频格式，从而增强您对 ${sks[1]} 和 ${sks[2]} 的体验。</p>`,
    (pk: string, sks: string[]) => `<p>🔍 <strong>${pk}</strong> 的智能搜索功能可帮助您快速找到您需要的东西。</p><p>只需输入关于 ${sks[0]} 的关键字，结果就会立即出现。</p><p>高级过滤器可让您按各种标准对内容进行排序，使探索 ${sks[1]} 和 ${sks[2]} 变得更加容易。</p>`,
    (pk: string, sks: string[]) => `<p>💯 我们承诺提供您在其他地方找不到的独家内容。</p><p><strong>${pk}</strong> 与顶级制作人合作，提供最新的 ${sks[0]}。</p><p>我们的库不断更新，包含热门的 ${sks[1]} 作品和 ${sks[2]} 趋势。</p>`,
];

const CTA_BLOCKS = [
    (url: string, display: string) => `<h2>👉 点击此处探索 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a>！</h2>`,
    (url: string, display: string) => `<h2>🚀 访问 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> 开始您的旅程！</h2>`,
    (url: string, display: string) => `<h2>🔥 立即在 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> 体验，不要错过！</h2>`,
    (url: string, display: string) => `<h2>💎 在 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> 加入精英社群！</h2>`,
];

const CLOSING_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🎉 是时候用 <strong>${pk}</strong> 提升您的体验了。</p><p>如果您是 ${sks[0]} 的粉丝，那么这里就是您的最佳选择。</p><p>我们提供从 ${sks[1]} 到 ${sks[2]} 的系列，分类清晰，方便您轻松搜索。</p>`,
    (pk: string, sks: string[]) => `<p>💯 想象一下，一个只需点击几下即可访问 ${sks[0]} 宝库的地方。</p><p>那就是 <strong>${pk}</strong>。</p><p>像 ${sks[1]} 和 ${sks[2]} 这样多样化的内容与精美的界面相结合，创造了绝佳的体验。</p>`,
    (pk: string, sks: string[]) => `<p>✨ 有了 <strong>${pk}</strong>，每一天都是新的发现。</p><p>我们不断地从经典的 ${sks[0]} 到现代的 ${sks[1]} 带来独特的内容。</p><p>我们的团队确保您总有新的期待，包括 ${sks[2]} 趋势。</p>`,
    (pk: string, sks: string[]) => `<p>💖 您的满意是 <strong>${pk}</strong> 的第一要务。</p><p>我们提供优质的 ${sks[0]} 内容和 24/7 的客户支持。</p><p>任何有关 ${sks[1]} 或 ${sks[2]} 的问题都将得到迅速解答。现在就加入，感受不同！</p>`,
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
    const displayDomain = input.domain.replace(/^https?:\/\//, '');

    // Pad secondary keywords if less than 3 are provided
    const sks = [...input.secondaryKeywords];
    while (sks.length < 3) {
      sks.push(sks[sks.length - 1] || input.primaryKeyword);
    }
    
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const randomChars = Math.random().toString(36).substring(2, 6);
    
    const seoTitlePart = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${sks.join(' - ')}`;
    const uniqueIdPart = `${dateStr}-${input.value}|${input.primaryKeyword} - ${randomChars}`;

    // This is the title for the H1 tag inside the article
    const displayTitleForH1 = seoTitlePart;
    // This is the full title for copying
    const fullTitleForCopying = `${seoTitlePart} - ${uniqueIdPart}`;
    
    // --- Dynamic Content Assembly ---
    const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Shuffle middle blocks to get more variety
    const shuffledMiddleBlocks = [...MIDDLE_BLOCKS].sort(() => 0.5 - Math.random());

    const intro = getRandomItem(INTRO_BLOCKS)(input.primaryKeyword, sks);
    const middle1 = shuffledMiddleBlocks[0](input.primaryKeyword, sks);
    const middle2 = shuffledMiddleBlocks[1](input.primaryKeyword, sks);
    const cta = getRandomItem(CTA_BLOCKS)(input.domain, displayDomain);
    const closing = getRandomItem(CLOSING_BLOCKS)(input.primaryKeyword, sks);

    const allKeywords = [input.primaryKeyword, ...input.secondaryKeywords];
    const keywordAggregation = `🔍 关键词聚合：${allKeywords.join('、')}`;

    const styledTitle = `<p style="font-size: 30px; text-align: center; font-weight: bold;">${displayTitleForH1}</p>`;
    const fullContent = `${styledTitle}${intro}${middle1}${cta}${middle2}${closing}<p>${keywordAggregation}</p>`;
    // --- End Dynamic Content Assembly ---

    return {
        title: fullTitleForCopying,
        content: fullContent,
    };
  }
);

