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
import * as os from 'os';

const GenerateMarkdownContentInputSchema = z.object({
  primaryKeyword: z.enum(['黑料网']).describe('The primary keyword.'),
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

const TEMPLATES = [
  // Template 1
  `
    <p><strong>欢迎来到 {app} 官方导航页！</strong></p>
    <p>尊敬的用户您好！为了让您能够轻松、快速地找到 {app} 的最新地址，我们特地建立了本官方导航页面。无论您是首次访问，还是长期使用我们的老用户，都能在这里第一时间获取最新、最稳定的访问链接。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>更新时间：</strong> {date}</li>
    </ul>
    <p>以下是您当前可用的访问入口，强烈建议收藏多个备用链接，以防主链路出现故障：</p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉主站入口👈👈</a></h1>
    <h3>我们的优势：</h3>
    <ul>
        <li>实时监测所有链接状态，确保每条链接均可正常访问，杜绝失效情况。</li>
        <li>支持各种设备，包括手机、平板和电脑，跨平台无缝体验。</li>
        <li>无需注册，无需登录，完全免费，保护用户隐私安全。</li>
        <li>提供简洁清爽的界面，无任何弹窗和广告打扰。</li>
    </ul>
    <h3>遇到访问问题怎么办？</h3>
    <ul>
        <li>首先尝试刷新页面或关闭浏览器缓存，清除旧数据。</li>
        <li>尝试切换不同浏览器访问，比如 Chrome、Firefox 或 Edge。</li>
        <li>使用浏览器隐身模式，避免浏览器扩展或缓存干扰访问。</li>
        <li>如果网络环境有限制，建议使用 VPN 或代理服务，突破地理屏蔽。</li>
        <li>确认您的网络连接正常，必要时切换至数据流量或其他网络环境。</li>
    </ul>
    <p>我们一直致力于为用户打造安全稳定的访问环境，您的支持是我们前进的动力。请务必收藏本页面，以便随时找到最新链接。如有任何疑问或建议，欢迎通过官方联系方式反馈，我们将竭诚为您服务。</p>
    <p>感谢您的信赖，祝您访问顺利，使用愉快！</p>
    `,
  // Template 2
  `
    <p><strong>{app} 最新可用地址合集！</strong></p>
    <p>随着网络限制日益增多，保证稳定访问优质内容成为我们最重要的目标。为此，我们精心整理并持续更新本页面，确保您可以第一时间获得 {app} 的最新可用地址。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>页面更新日期：</strong> {date}</li>
    </ul>
    <p><strong>当前可访问地址：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉主入口👈👈</a></h1>
    <h3>为什么选择我们？</h3>
    <ul>
        <li>多线路保障，确保任一线路出现故障时能迅速切换，不影响您的观看体验。</li>
        <li>采用先进的服务器集群技术，极大提升访问速度和稳定性。</li>
        <li>定期更新内容，保证资源丰富多样，满足不同用户需求。</li>
        <li>严格无广告政策，杜绝一切骚扰弹窗和弹广告，专注提升用户体验。</li>
        <li>完全匿名访问，绝不收集任何个人信息，保护您的隐私安全。</li>
    </ul>
    <h3>使用技巧：</h3>
    <ul>
        <li>请尽量收藏多个链接，预防主链接偶尔因维护或封锁而暂时无法访问。</li>
        <li>遇到无法访问或加载缓慢时，可尝试清理浏览器缓存或切换网络环境。</li>
        <li>推荐使用最新版主流浏览器，如 Chrome、Firefox 以获得最佳性能。</li>
        <li>若您身处网络受限区域，建议配合 VPN 使用，保障访问畅通。</li>
    </ul>
    <h3>用户支持：</h3>
    <p>如您遇到任何问题或需要协助，请通过我们的官方反馈渠道联系我们。我们拥有专业的技术团队，致力于快速响应并解决访问相关问题。</p>
    <p>感谢您一直以来的支持和理解，愿您有一个愉快的浏览体验！</p>
    `,
  // Template 3
  `
    <p><strong>{app} 官方跳转入口说明</strong></p>
    <p>您好，欢迎访问由我们精心维护的 {app} 官方导航页面。本页面专门提供当前最新、最安全、最稳定的访问入口，确保您能顺畅浏览所有内容。</p>
    <ul>
        <li><strong>关键词聚合：</strong> {keywords_text}</li>
        <li><strong>日期：</strong> {date}</li>
    </ul>
    <p><strong>可用地址一览：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉主站点👈👈</a></h1>
    <h3>访问建议：</h3>
    <ul>
        <li>移动设备推荐使用 Chrome 或 Safari 浏览器，获得最佳兼容性和体验。</li>
        <li>如果您在 WiFi 网络下遇到访问障碍，建议切换到 4G/5G 移动网络或使用 VPN。</li>
        <li>浏览时开启无痕/隐身模式，避免浏览器缓存对页面加载造成影响。</li>
        <li>遇到页面显示异常或链接无法访问，尝试清理浏览器缓存和 Cookie。</li>
    </ul>
    <h3>技术保障：</h3>
    <ul>
        <li>本导航页面为唯一官方入口，所有链接均经过严格检测，杜绝失效和安全隐患。</li>
        <li>绝无任何弹窗、广告或恶意插件，确保用户安全无忧。</li>
        <li>我们每日对链接状态进行检测并及时更新，保障链接实时有效。</li>
        <li>任何访问问题均可通过官方渠道反馈，获得快速专业支持。</li>
    </ul>
    <h3>用户隐私：</h3>
    <p>我们尊重您的隐私，绝不追踪任何访问行为，所有访问均匿名处理。</p>
    <p>请务必收藏本页面，确保每次访问都能快速找到有效链接。感谢您的支持和信任！</p>
    `,
  // Template 4
  `
    <p><strong>{app} 最新导航页正式上线！</strong></p>
    <p>亲爱的用户您好！在网络环境复杂多变的今天，获取稳定可靠的访问链接尤为重要。我们特别推出了这一官方导航页，让您可以轻松获取 {app} 的最新地址，保证访问不受干扰。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>页面更新：</strong> {date}</li>
    </ul>
    <p><strong>当前可用地址：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉点击进入主站👈👈</a></h1>
    <h3>平台优势：</h3>
    <ul>
        <li>稳定线路支持，快速直达。</li>
        <li>覆盖全终端，兼容主流浏览器。</li>
        <li>实时检测，第一时间更新有效链接。</li>
        <li>清爽界面，告别广告与干扰。</li>
        <li>安全访问，全面保护您的隐私信息。</li>
    </ul>
    <h3>问题解决方案：</h3>
    <ul>
        <li>页面打不开？请先尝试刷新并清理缓存。</li>
        <li>链接失效？使用备用入口即可。</li>
        <li>网络受限？请尝试使用 VPN。</li>
        <li>页面异常？切换浏览器或开启隐身模式。</li>
    </ul>
    <p><strong>温馨提示：</strong></p>
    <p>我们每天都会检查和更新可用地址，保证您可以畅通无阻地访问。建议收藏本页面，以便随时找到最新地址。</p>
    <p>感谢您长期以来的支持与信任，祝您浏览愉快！</p>
    `,
  // Template 5
  `
    <p><strong>永久收藏指南 {app} 官方直达！</strong></p>
    <p>您好！本页面为您提供 {app} 的最新地址，避免因网络封锁或链接失效带来困扰。通过本官方入口，您将能够第一时间获取最新、最稳定的访问方式。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>更新日期：</strong> {date}</li>
    </ul>
    <p><strong>最新入口：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉立即进入👈👈</a></h1>
    <h3>我们的服务优势：</h3>
    <ul>
        <li>专业团队实时检测，确保入口可用。</li>
        <li>全平台适配，畅享无缝体验。</li>
        <li>高速线路保障，访问更快更稳定。</li>
        <li>完全免费，无需注册即可访问。</li>
        <li>严格隐私保护，无痕浏览更安心。</li>
    </ul>
    <h3>常见问题应对：</h3>
    <ul>
        <li>访问异常时，请刷新或切换浏览器。</li>
        <li>网络不通畅时，尝试更换网络或启用 VPN。</li>
        <li>入口临时无法使用时，请使用备用地址。</li>
    </ul>
    <p><strong>温馨提醒：</strong></p>
    <p>请务必将本页面收藏到浏览器书签，以便随时找到最新地址。我们会不断优化服务，为您带来更好体验。</p>
    <p>感谢您的支持，祝您使用愉快！</p>
    `,
  // Template 6
  `
    <p><strong>{app} 官方推荐访问通道</strong></p>
    <p>欢迎访问 {app} 官方导航页！本页面收录最新有效的访问地址，帮助广大用户在任何情况下都能轻松进入平台，获取优质内容。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>更新时间：</strong> {date}</li>
    </ul>
    <p><strong>可用链接入口：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉主入口地址👈👈</a></h1>
    <h3>我们的特色：</h3>
    <ul>
        <li>提供多线路，随时切换。</li>
        <li>支持各类终端，操作简单。</li>
        <li>严格无广告，界面清爽纯净。</li>
        <li>安全稳定，隐私有保障。</li>
    </ul>
    <h3>使用建议：</h3>
    <ul>
        <li>使用最新版浏览器体验更佳。</li>
        <li>收藏本导航页，避免迷路。</li>
        <li>网络受限时，配合 VPN 使用。</li>
    </ul>
    <p><strong>我们承诺：</strong></p>
    <p>始终第一时间为用户更新最新地址，保障访问无忧。感谢您的理解与支持！</p>
    `,
  // Template 7
  `
    <p><strong>一键直达 {app} 官方最新通道</strong></p>
    <p>为了让广大用户第一时间获取 {app} 的最新地址，我们特别建立了本导航页，实时更新可用链接，确保访问流畅。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>页面更新：</strong> {date}</li>
    </ul>
    <p><strong>当前推荐访问入口：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉立即访问👈👈</a></h1>
    <h3>优势说明：</h3>
    <ul>
        <li>稳定高速线路，访问不卡顿。</li>
        <li>全面适配移动端与 PC。</li>
        <li>界面整洁无广告，体验更专注。</li>
        <li>完全匿名访问，无需注册。</li>
    </ul>
    <h3>故障排查：</h3>
    <ul>
        <li>链接无法打开？尝试刷新或切换备用地址。</li>
        <li>页面卡顿？请清理浏览器缓存或切换网络。</li>
        <li>受限网络？建议使用 VPN 工具加速访问。</li>
    </ul>
    <p><strong>友情提醒：</strong></p>
    <p>收藏本页面，避免因链接变更而无法访问。我们将持续为您提供高效便捷的服务！</p>
    `,
  // Template 8
  `
    <p><strong>最新导航更新 {app}</strong></p>
    <p>感谢您一直以来对 {app} 的支持！为了确保您随时可以访问最新内容，我们建立了本页面并定期更新最新地址，帮助用户解决访问困难。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>更新日期：</strong> {date}</li>
    </ul>
    <p><strong>当前有效链接：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉官方入口👈👈</a></h1>
    <h3>平台优势：</h3>
    <ul>
        <li>高速稳定，保障访问体验。</li>
        <li>支持全平台访问，无兼容问题。</li>
        <li>实时监控，及时更换失效链接。</li>
        <li>完全免费，拒绝任何广告骚扰。</li>
    </ul>
    <h3>常见问题解答：</h3>
    <ul>
        <li>打不开怎么办？请刷新或切换备用入口。</li>
        <li>访问缓慢怎么办？建议切换网络或开启 VPN。</li>
        <li>页面异常怎么办？尝试隐身模式或清理缓存。</li>
    </ul>
    <p><strong>温馨提示：</strong></p>
    <p>请将本导航收藏，避免因地址更新而错过访问机会。祝您浏览愉快！</p>
    `,
  // Template 9
  `
    <p><strong>官方公告 {app} 最新直达</strong></p>
    <p>尊敬的用户您好！为了方便您随时找到 {app} 的最新地址，我们特别制作了此导航页，每日更新最新可用入口，保障您的访问体验。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>更新时间：</strong> {date}</li>
    </ul>
    <p><strong>最新推荐链接：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉点此进入👈👈</a></h1>
    <h3>我们的优势：</h3>
    <ul>
        <li>稳定高速线路支持，访问更顺畅。</li>
        <li>多平台兼容，随时随地轻松进入。</li>
        <li>实时监控，快速替换无效链接。</li>
        <li>隐私保护，安全匿名无忧。</li>
    </ul>
    <h3>使用方法：</h3>
    <ul>
        <li>收藏此页面，确保每次都能找到最新地址。</li>
        <li>使用主流浏览器，避免兼容性问题。</li>
        <li>遇到网络受限，可搭配 VPN 使用。</li>
    </ul>
    <p>感谢您对我们的长期支持！我们将继续努力，为用户提供更加稳定与安全的访问体验。</p>
    `,
  // Template 10
  `
    <p><strong>永久收藏 {app} 官方导航更新</strong></p>
    <p>您好！为了解决访问不稳定、链接经常变化的问题，我们特别建立了本官方导航页面，为您提供最新最全的可用链接。</p>
    <ul>
        <li><strong>关键词：</strong> {keywords_text}</li>
        <li><strong>页面更新日期：</strong> {date}</li>
    </ul>
    <p><strong>当前有效访问入口：</strong></p>
    <h1><a style="color: black; text-decoration: none;" href="{domain}">👉👉立即进入👈👈</a></h1>
    <h3>我们承诺：</h3>
    <ul>
        <li>所有入口均经过严格检测，保证安全稳定。</li>
        <li>实时更新，避免访问中断。</li>
        <li>界面简洁，杜绝广告干扰。</li>
        <li>完全匿名，最大限度保护用户隐私。</li>
    </ul>
    <h3>常见使用建议：</h3>
    <ul>
        <li>建议收藏多个入口地址备用。</li>
        <li>访问出现问题时，请切换浏览器或清理缓存。</li>
        <li>若所在地区限制访问，请配合 VPN 使用。</li>
    </ul>
    <p>请务必收藏本页面，我们将持续为您更新最新地址，保障您的使用体验。感谢您的支持！</p>
    `,
];


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
    const title = `${input.primaryKeyword}【链接地址：${displayDomain}】${input.secondaryKeyword}${today}|${input.value}|881比鸭${randomChars}`;
    const keywordsText = `${input.primaryKeyword}, ${input.secondaryKeyword}`;

    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
    let template = TEMPLATES[randomIndex];
    
    const content = template
      .replace(/{app}/g, input.primaryKeyword)
      .replace(/{keywords_text}/g, keywordsText)
      .replace(/{date}/g, today)
      .replace(/{domain}/g, input.domain)
      .trim();
    
    const fullContent = `<h2 style="font-size: 1.875rem; font-weight: 600;">${input.primaryKeyword}【链接地址：<a href="${input.domain}" style="color: black; text-decoration: underline;">${displayDomain}</a>】${input.secondaryKeyword}${today}|${input.value}|881比鸭${randomChars}</h2>` + content;

    return {title: title, content: fullContent};
  }
);
