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
  markdownContent: z.string().describe('The generated markdown content.'),
});

export type GenerateMarkdownContentOutput = z.infer<
  typeof GenerateMarkdownContentOutputSchema
>;

const TEMPLATES = [
  `{title}\n\n🎉 欢迎来到 {app}{url} 官方导航页！\n\n尊敬的用户您好！为了让您能够轻松、快速地找到 {app} 的最新地址，我们特地建立了本官方导航页面。无论您是首次访问，还是长期使用我们的老用户，都能在这里第一时间获取最新、最稳定的访问链接。\n\n关键词：{keywords_text}\n更新时间：{date}\n\n以下是您当前可用的访问入口，强烈建议收藏多个备用链接，以防主链路出现故障：\n\n- [👉👉主站入口👈👈]({domain})\n\n📌 我们的优势：\n- 实时监测所有链接状态，确保每条链接均可正常访问，杜绝失效情况。\n- 支持各种设备，包括手机、平板和电脑，跨平台无缝体验。\n- 无需注册，无需登录，完全免费，保护用户隐私安全。\n- 提供简洁清爽的界面，无任何弹窗和广告打扰。\n\n⚙️ 遇到访问问题怎么办？\n- 首先尝试刷新页面或关闭浏览器缓存，清除旧数据。\n- 尝试切换不同浏览器访问，比如 Chrome、Firefox 或 Edge。\n- 使用浏览器隐身模式，避免浏览器扩展或缓存干扰访问。\n- 如果网络环境有限制，建议使用 VPN 或代理服务，突破地理屏蔽。\n- 确认您的网络连接正常，必要时切换至数据流量或其他网络环境。\n\n✨ 我们一直致力于为用户打造安全稳定的访问环境，您的支持是我们前进的动力。请务必收藏本页面，以便随时找到最新链接。如有任何疑问或建议，欢迎通过官方联系方式反馈，我们将竭诚为您服务。\n\n感谢您的信赖，祝您访问顺利，使用愉快！`,

  `{title}\n\n🔥 {app} - {url} 最新可用地址合集！\n\n随着网络限制日益增多，保证稳定访问优质内容成为我们最重要的目标。为此，我们精心整理并持续更新本页面，确保您可以第一时间获得 {app} 的最新可用地址。\n\n关键词：{keywords_text}\n页面更新日期：{date}\n\n🔗 当前可访问地址：\n- [👉👉主入口👈👈]({domain})\n\n为什么选择我们？\n- 多线路保障，确保任一线路出现故障时能迅速切换，不影响您的观看体验。\n- 采用先进的服务器集群技术，极大提升访问速度和稳定性。\n- 定期更新内容，保证资源丰富多样，满足不同用户需求。\n- 严格无广告政策，杜绝一切骚扰弹窗和弹广告，专注提升用户体验。\n- 完全匿名访问，绝不收集任何个人信息，保护您的隐私安全。\n\n🌟 使用技巧：\n- 请尽量收藏多个链接，预防主链接偶尔因维护或封锁而暂时无法访问。\n- 遇到无法访问或加载缓慢时，可尝试清理浏览器缓存或切换网络环境。\n- 推荐使用最新版主流浏览器，如 Chrome、Firefox 以获得最佳性能。\n- 若您身处网络受限区域，建议配合 VPN 使用，保障访问畅通。\n\n💬 用户支持：\n如您遇到任何问题或需要协助，请通过我们的官方反馈渠道联系我们。我们拥有专业的技术团队，致力于快速响应并解决访问相关问题。\n\n感谢您一直以来的支持和理解，愿您有一个愉快的浏览体验！`,

  `{title}\n\n🚀 {app} 官方跳转入口说明 - {url}\n\n您好，欢迎访问由我们精心维护的 {app} 官方导航页面。本页面专门提供当前最新、最安全、最稳定的访问入口，确保您能顺畅浏览所有内容。\n\n关键词聚合：{keywords_text}\n日期：{date}\n\n🌍 可用地址一览：\n- [👉👉主站点👈👈]({domain})\n\n📢 访问建议：\n- 移动设备推荐使用 Chrome 或 Safari 浏览器，获得最佳兼容性和体验。\n- 如果您在 WiFi 网络下遇到访问障碍，建议切换到 4G/5G 移动网络或使用 VPN。\n- 浏览时开启无痕/隐身模式，避免浏览器缓存对页面加载造成影响。\n- 遇到页面显示异常或链接无法访问，尝试清理浏览器缓存和 Cookie。\n\n⚙️ 技术保障：\n- 本导航页面为唯一官方入口，所有链接均经过严格检测，杜绝失效和安全隐患。\n- 绝无任何弹窗、广告或恶意插件，确保用户安全无忧。\n- 我们每日对链接状态进行检测并及时更新，保障链接实时有效。\n- 任何访问问题均可通过官方渠道反馈，获得快速专业支持。\n\n❤️ 用户隐私：\n我们尊重您的隐私，绝不追踪任何访问行为，所有访问均匿名处理。\n\n请务必收藏本页面，确保每次访问都能快速找到有效链接。感谢您的支持和信任！`,

  `{title}\n\n📢 {app}{url} 最新导航页正式上线！\n\n亲爱的用户您好！在网络环境复杂多变的今天，获取稳定可靠的访问链接尤为重要。我们特别推出了这一官方导航页，让您可以轻松获取 {app} 的最新地址，保证访问不受干扰。\n\n关键词：{keywords_text}\n页面更新：{date}\n\n🔗 当前可用地址：\n- [👉👉点击进入主站👈👈]({domain})\n\n📌 平台优势：\n- 稳定线路支持，快速直达。\n- 覆盖全终端，兼容主流浏览器。\n- 实时检测，第一时间更新有效链接。\n- 清爽界面，告别广告与干扰。\n- 安全访问，全面保护您的隐私信息。\n\n⚙️ 问题解决方案：\n- 页面打不开？请先尝试刷新并清理缓存。\n- 链接失效？使用备用入口即可。\n- 网络受限？请尝试使用 VPN。\n- 页面异常？切换浏览器或开启隐身模式。\n\n✨ 温馨提示：\n我们每天都会检查和更新可用地址，保证您可以畅通无阻地访问。建议收藏本页面，以便随时找到最新地址。\n\n感谢您长期以来的支持与信任，祝您浏览愉快！`,

  `{title}\n\n🔥 永久收藏指南 - {app}{url} 官方直达！\n\n您好！本页面为您提供 {app} 的最新地址，避免因网络封锁或链接失效带来困扰。通过本官方入口，您将能够第一时间获取最新、最稳定的访问方式。\n\n关键词：{keywords_text}\n更新日期：{date}\n\n🌍 最新入口：\n- [👉👉立即进入👈👈]({domain})\n\n📌 我们的服务优势：\n- 专业团队实时检测，确保入口可用。\n- 全平台适配，畅享无缝体验。\n- 高速线路保障，访问更快更稳定。\n- 完全免费，无需注册即可访问。\n- 严格隐私保护，无痕浏览更安心。\n\n⚙️ 常见问题应对：\n- 访问异常时，请刷新或切换浏览器。\n- 网络不通畅时，尝试更换网络或启用 VPN。\n- 入口临时无法使用时，请使用备用地址。\n\n✨ 温馨提醒：\n请务必将本页面收藏到浏览器书签，以便随时找到最新地址。我们会不断优化服务，为您带来更好体验。\n\n感谢您的支持，祝您使用愉快！`,

  `{title}\n\n✨ {app} - {url} 官方推荐访问通道\n\n欢迎访问 {app} 官方导航页！本页面收录最新有效的访问地址，帮助广大用户在任何情况下都能轻松进入平台，获取优质内容。\n\n关键词：{keywords_text}\n更新时间：{date}\n\n🔗 可用链接入口：\n- [👉👉主入口地址👈👈]({domain})\n\n📌 我们的特色：\n- 提供多线路，随时切换。\n- 支持各类终端，操作简单。\n- 严格无广告，界面清爽纯净。\n- 安全稳定，隐私有保障。\n\n⚙️ 使用建议：\n- 使用最新版浏览器体验更佳。\n- 收藏本导航页，避免迷路。\n- 网络受限时，配合 VPN 使用。\n\n✨ 我们承诺：\n始终第一时间为用户更新最新地址，保障访问无忧。感谢您的理解与支持！`,

  `{title}\n\n🚀 一键直达 - {app}{url} 官方最新通道\n\n为了让广大用户第一时间获取 {app} 的最新地址，我们特别建立了本导航页，实时更新可用链接，确保访问流畅。\n\n关键词：{keywords_text}\n页面更新：{date}\n\n🔗 当前推荐访问入口：\n- [👉👉立即访问👈👈]({domain})\n\n📌 优势说明：\n- 稳定高速线路，访问不卡顿。\n- 全面适配移动端与 PC。\n- 界面整洁无广告，体验更专注。\n- 完全匿名访问，无需注册。\n\n⚙️ 故障排查：\n- 链接无法打开？尝试刷新或切换备用地址。\n- 页面卡顿？请清理浏览器缓存或切换网络。\n- 受限网络？建议使用 VPN 工具加速访问。\n\n✨ 友情提醒：\n收藏本页面，避免因链接变更而无法访问。我们将持续为您提供高效便捷的服务！`,

  `{title}\n\n🔥 最新导航更新 - {app}{url}\n\n感谢您一直以来对 {app} 的支持！为了确保您随时可以访问最新内容，我们建立了本页面并定期更新最新地址，帮助用户解决访问困难。\n\n关键词：{keywords_text}\n更新日期：{date}\n\n🔗 当前有效链接：\n- [👉👉官方入口👈👈]({domain})\n\n📌 平台优势：\n- 高速稳定，保障访问体验。\n- 支持全平台访问，无兼容问题。\n- 实时监控，及时更换失效链接。\n- 完全免费，拒绝任何广告骚扰。\n\n⚙️ 常见问题解答：\n- 打不开怎么办？请刷新或切换备用入口。\n- 访问缓慢怎么办？建议切换网络或开启 VPN。\n- 页面异常怎么办？尝试隐身模式或清理缓存。\n\n✨ 温馨提示：\n请将本导航收藏，避免因地址更新而错过访问机会。祝您浏览愉快！`,

  `{title}\n\n📢 官方公告 - {app}{url} 最新直达\n\n尊敬的用户您好！为了方便您随时找到 {app} 的最新地址，我们特别制作了此导航页，每日更新最新可用入口，保障您的访问体验。\n\n关键词：{keywords_text}\n更新时间：{date}\n\n🔗 最新推荐链接：\n- [👉👉点此进入👈👈]({domain})\n\n📌 我们的优势：\n- 稳定高速线路支持，访问更顺畅。\n- 多平台兼容，随时随地轻松进入。\n- 实时监控，快速替换无效链接。\n- 隐私保护，安全匿名无忧。\n\n⚙️ 使用方法：\n- 收藏此页面，确保每次都能找到最新地址。\n- 使用主流浏览器，避免兼容性问题。\n- 遇到网络受限，可搭配 VPN 使用。\n\n✨ 感谢您对我们的长期支持！我们将继续努力，为用户提供更加稳定与安全的访问体验。`,

  `{title}\n\n🚀 永久收藏 - {app}{url} 官方导航更新\n\n您好！为了解决访问不稳定、链接经常变化的问题，我们特别建立了本官方导航页面，为您提供最新最全的可用链接。\n\n关键词：{keywords_text}\n页面更新日期：{date}\n\n🔗 当前有效访问入口：\n- [👉👉立即进入👈👈]({domain})\n\n📌 我们承诺：\n- 所有入口均经过严格检测，保证安全稳定。\n- 实时更新，避免访问中断。\n- 界面简洁，杜绝广告干扰。\n- 完全匿名，最大限度保护用户隐私。\n\n⚙️ 常见使用建议：\n- 建议收藏多个入口地址备用。\n- 访问出现问题时，请切换浏览器或清理缓存。\n- 若所在地区限制访问，请配合 VPN 使用。\n\n✨ 请务必收藏本页面，我们将持续为您更新最新地址，保障您的使用体验。感谢您的支持！`,
];

export async function generateMarkdownContent(
  input: GenerateMarkdownContentInput
): Promise<GenerateMarkdownContentOutput> {
  return generateMarkdownContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarkdownContentPrompt',
  input: {schema: GenerateMarkdownContentInputSchema},
  output: {schema: GenerateMarkdownContentOutputSchema},
  prompt: `使用以下信息生成markdown内容：\n\n主要关键字: {{{primaryKeyword}}}\n次要关键字: {{{secondaryKeyword}}}\n域名: {{{domain}}}\n值: {{{value}}}\n\n从以下模板中选择最合适的模板: \n\n${TEMPLATES.join('\n')}\n\n根据用户输入的信息, 使用所选模板生成markdown内容. 确保所有变量都被替换.`, // Corrected template joining
});

const generateMarkdownContentFlow = ai.defineFlow(
  {
    name: 'generateMarkdownContentFlow',
    inputSchema: GenerateMarkdownContentInputSchema,
    outputSchema: GenerateMarkdownContentOutputSchema,
  },
  async input => {
    const today = new Date().toISOString().slice(0, 10);
    const title = `${input.primaryKeyword}-【链接地址：${input.domain}】${input.secondaryKeyword}-${today}`;
    const keywordsText = `${input.primaryKeyword}, ${input.secondaryKeyword}`;

    const template = TEMPLATES[0]; // Select the first template

    const content = template
      .replace('{title}', title)
      .replace('{app}', input.primaryKeyword)
      .replace('{url}', '')
      .replace('{keywords_text}', keywordsText)
      .replace('{date}', today)
      .replace('{domain}', input.domain);

    //  const {output} = await prompt(input);
    //  return output!;

    return {markdownContent: content};
  }
);
