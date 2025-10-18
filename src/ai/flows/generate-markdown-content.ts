
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

// --- Dynamic Content Generation System (Translated to Chinese) ---

const INTRO_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🌟 歡迎來到 <strong>${pk}</strong>，首屈一指的線上娛樂目的地！我們專注於提供獨特且引人入勝的內容。</p><p>如果您喜愛 ${sks[0]} 或正在尋找 ${sks[1]}，那您來對地方了。</p><p>準備好探索一個多元化的娛樂世界，其中 ${sks[2]} 只是我們內容寶庫的一小部分。</p>`,
    (pk: string, sks: string[]) => `<p>🎬 您在尋找真實的娛樂體驗嗎？<strong>${pk}</strong> 就是答案。</p><p>我們很自豪能為您帶來關於 ${sks[0]} 的內容以及更多。</p><p>我們的平台不斷更新最新趨勢，從 ${sks[1]} 到 ${sks[2]}，確保您每天都有新鮮事可探索。</p>`,
    (pk: string, sks: string[]) => `<p>🔥 透過 <strong>${pk}</strong> 探索無限的娛樂世界。</p><p>我們擁有龐大的內容庫，特別是關於 ${sks[0]} 的內容。</p><p>無論您是想用 ${sks[1]} 放鬆一下，還是想深入了解 ${sks[2]}，我們都能滿足您的需求。品質和多樣性是我們的首要任務。</p>`,
    (pk: string, sks: string[]) => `<p>💎 透過 <strong>${pk}</strong> 提升您的娛樂體驗。</p><p>我們專注於您喜愛的領域，例如 ${sks[0]}。</p><p>我們的內容庫，從 ${sks[1]} 到 ${sks[2]}，每天都在更新。</p><p>加入我們的社群，不錯過任何精彩內容！</p>`,
];

const MIDDLE_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🚀 先進技術是 <strong>${pk}</strong> 平台的支柱。</p><p>我們投資於現代化基礎設施，以提供流暢、無延遲的觀看體驗。</p><p>以清晰的畫質和生動的音效享受 ${sks[0]}。</p><p>友善的介面可幫助您輕鬆搜尋有關 ${sks[1]} 的內容。</p><p>我們的智慧推薦系統會向您推薦與 ${sks[2]} 相關的引人入勝的影片。</p>`,
    (pk: string, sks: string[]) => `<p>💡 忘掉低品質的煩惱。在 <strong>${pk}</strong>，我們進行了優化，為 ${sks[0]} 等內容提供快速的載入速度和高解析度。</p><p>我們不僅僅是一個網站，而是一個充滿活力的社群，您可以在這裡探索 ${sks[1]} 等更多內容。</p><p>我們始終帶來突破界限的創意內容，包括 ${sks[2]}。</p>`,
    (pk: string, sks: string[]) => `<p>🔒 正在尋找可靠的內容來源？<strong>${pk}</strong> 是您的首選，尤其是在 ${sks[0]} 領域。</p><p>我們的使命是為您創造一個安全的空間，讓您探索 ${sks[1]} 並享受 ${sks[2]} 的樂趣。</p><p>每件產品都經過嚴格審核，確保品質和獨特性。</p>`,
    (pk: string, sks: string[]) => `<p>🌍 <strong>${pk}</strong> 的與眾不同之處在於我們對品質和多樣性的承諾。</p><p>我們了解每個人都有自己的喜好，我們關於 ${sks[0]} 的內容庫反映了這一點。</p><p>無論您是想用 ${sks[1]} 快速娛樂一下，還是沉浸在 ${sks[2]} 的故事中，我們都能滿足您的需求。</p>`,
    (pk: string, sks: string[]) => `<p>📈 我們在 <strong>${pk}</strong> 創建了一個全面的娛樂生態系統。</p><p>您可以參與關於 ${sks[0]} 的討論並分享您最喜愛的時刻。</p><p>該平台整合了社交功能，讓您可以與對 ${sks[1]} 和 ${sks[2]} 有相同興趣的人建立聯繫。</p>`,
    (pk: string, sks: string[]) => `<p>📱 在任何裝置上享受不間斷的娛樂體驗。<strong>${pk}</strong> 平台在電腦、平板電腦和手機上都能完美運作。</p><p>無論您身在何處，都可以存取並享受 ${sks[0]} 和 ${sks[1]}。</p><p>關於 ${sks[2]} 的娛樂世界始終在您的口袋裡。</p>`,
    (pk: string, sks: string[]) => `<p>🎨 <strong>${pk}</strong> 的使用者介面設計精美且直觀。</p><p>尋找和發現關於 ${sks[0]} 的內容從未如此簡單。</p><p>我們專注於使用者體驗，幫助您輕鬆瀏覽從 ${sks[1]} 到 ${sks[2]} 的各種類別，只需點擊幾下。</p>`,
    (pk: string, sks: string[]) => `<p>🌐 <strong>${pk}</strong> 的使用者社群是不可或缺的一部分。</p><p>加入數百萬其他使用者，分享您對 ${sks[0]} 的熱情。</p><p>您可以對有關 ${sks[1]} 的內容發表評論、評分，並與有相同 ${sks[2]} 興趣的新朋友建立聯繫。</p>`,
    (pk: string, sks: string[]) => `<p>🎁 許多誘人的促銷和獎勵在 <strong>${pk}</strong> 等著您。</p><p>我們定期舉辦與 ${sks[0]} 相關的特別活動。</p><p>敬請關注，在您享受 ${sks[1]} 和探索 ${sks[2]} 的同時，不要錯過獲得獨家禮物的機會。</p>`,
    (pk: string, sks: string[]) => `<p>🎧 頂級音質是 <strong>${pk}</strong> 的一大亮點。</p><p>以生動的環繞聲體驗 ${sks[0]}，帶來最真實的感受。</p><p>我們支援多種不同的音訊格式，從而增強您對 ${sks[1]} 和 ${sks[2]} 的體驗。</p>`,
    (pk: string, sks: string[]) => `<p>🔍 <strong>${pk}</strong> 的智慧搜尋功能可幫助您快速找到您需要的東西。</p><p>只需輸入關於 ${sks[0]} 的關鍵字，結果就會立即出現。</p><p>進階篩選器可讓您按各種標準對內容進行排序，使探索 ${sks[1]} 和 ${sks[2]} 變得更加容易。</p>`,
    (pk: string, sks: string[]) => `<p>💯 我們承諾提供您在其他地方找不到的獨家內容。</p><p><strong>${pk}</strong> 與頂級製作人合作，提供最新的 ${sks[0]}。</p><p>我們的庫不斷更新，包含熱門的 ${sks[1]} 作品和 ${sks[2]} 趨勢。</p>`,
];

const CTA_BLOCKS = [
    (url: string, display: string) => `<h2>👉 點擊此處探索 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a>！</h2>`,
    (url: string, display: string) => `<h2>🚀 訪問 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> 開始您的旅程！</h2>`,
    (url: string, display: string) => `<h2>🔥 立即在 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> 體驗，不要錯過！</h2>`,
    (url: string, display: string) => `<h2>💎 在 <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 1.2em; font-weight: bold;">${display}</a> 加入精英社群！</h2>`,
];

const CLOSING_BLOCKS = [
    (pk: string, sks: string[]) => `<p>🎉 是時候用 <strong>${pk}</strong> 提升您的體驗了。</p><p>如果您是 ${sks[0]} 的粉絲，那麼這裡就是您的最佳選擇。</p><p>我們提供從 ${sks[1]} 到 ${sks[2]} 的系列，分類清晰，方便您輕鬆搜尋。</p>`,
    (pk: string, sks: string[]) => `<p>💯 想像一下，一個只需點擊幾下即可存取 ${sks[0]} 寶庫的地方。</p><p>那就是 <strong>${pk}</strong>。</p><p>像 ${sks[1]} 和 ${sks[2]} 這樣多樣化的內容與精美的介面相結合，創造了絕佳的體驗。</p>`,
    (pk: string, sks: string[]) => `<p>✨ 有了 <strong>${pk}</strong>，每一天都是新的發現。</p><p>我們不斷地從經典的 ${sks[0]} 到現代的 ${sks[1]} 帶來獨特的內容。</p><p>我們的團隊確保您總有新的期待，包括 ${sks[2]} 趨勢。</p>`,
    (pk: string, sks: string[]) => `<p>💖 您的滿意是 <strong>${pk}</strong> 的第一要務。</p><p>我們提供優質的 ${sks[0]} 內容和 24/7 的客戶支援。</p><p>任何有關 ${sks[1]} 或 ${sks[2]} 的問題都將得到迅速解答。現在就加入，感受不同！</p>`,
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

    const allKeywords = [input.primaryKeyword, ...input.secondaryKeywords];
    const keywordAggregation = `🔍 关键词聚合：${allKeywords.join('、')}`;

    const fullContent = `<h1>${titleWithLink}</h1>${intro}${middle1}${cta}${middle2}${closing}<p>${keywordAggregation}</p>`;
    // --- End Dynamic Content Assembly ---

    return {
        title: title,
        content: fullContent,
    };
  }
);

    
