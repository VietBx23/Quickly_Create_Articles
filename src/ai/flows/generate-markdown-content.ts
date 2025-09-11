
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

const TEMPLATES = [
  `
    <p style="font-size: 1.1rem;"><strong>👋 欢迎来到 {app} 官方导航页！</strong></p><br>
    <p style="font-size: 1.1rem;">尊敬的用户您好！为了让您能够轻松、快速、安全地找到 {app} 的最新官方地址，我们特地建立了这个官方导航页面。无论您是首次访问的新朋友，还是长期支持我们的老用户，都能在这里第一时间获取到经过验证的、最稳定可靠的访问链接。我们致力于为您提供一个无缝且值得信赖的访问体验。</p><br>
    <p style="font-size: 1.1rem;"><strong>🔑 核心关键词：</strong> {keywords_text}</p><br>
    <p style="font-size: 1.1rem;"><strong>📅 实时更新时间：</strong> {date}</p><br>
    <p style="font-size: 1.1rem;">以下是您当前可用的官方访问入口，我们强烈建议您将此导航页加入书签，并收藏多个备用链接，以防主链路因不可抗力出现故障时，您依然可以畅通无阻地访问。</p><br>
    <h1 style="font-size: 1.5rem;"><a style="color: #1155cc; text-decoration: none;" href="{domain}">👉👉主站入口👈👈</a></h1><br>
    <p style="font-size: 1.1rem;"><strong>📌 我们的核心优势：</strong></p><br>
    <p style="font-size: 1.1rem;">✅ <strong>实时监测与验证：</strong> 我们的技术团队7x24小时不间断地实时监测所有链接状态，确保每一条链接都经过严格验证，杜绝任何失效或被劫持的情况，为您提供最高级别的访问保障。</p><br>
    <p style="font-size: 1.1rem;">📱 <strong>全平台无缝体验：</strong> 无论您使用的是手机、平板还是电脑，我们的网站都经过精心优化，能够完美适配各种设备，确保您在任何平台上都能享受到一致且流畅的无缝体验。</p><br>
    <p style="font-size: 1.1rem;">🙈 <strong>绝对隐私与免费：</strong> 我们郑重承诺，无需任何注册，无需登录，所有服务完全免费。我们绝不收集任何个人信息，采用最高标准的数据加密技术，全力保护您的用户隐私与数据安全。</p><br>
    <p style="font-size: 1.1rem;">🚫 <strong>纯净无广告界面：</strong> 我们深知广告的烦扰，因此提供了一个极为简洁清爽的浏览界面，承诺无任何形式的弹窗广告和恶意干扰，让您能够全身心沉浸在精彩内容中。</p><br>
    <p style="font-size: 1.1rem;"><strong>🤔 遇到访问问题怎么办？</strong></p><br>
    <p style="font-size: 1.1rem;">🔁 <strong>刷新与清除缓存：</strong> 首先尝试强制刷新页面（Ctrl+F5）或彻底清除浏览器缓存和Cookie，这能解决大部分由本地数据陈旧导致的问题。</p><br>
    <p style="font-size: 1.1rem;">🌐 <strong>更换浏览器或网络：</strong> 尝试使用不同的现代浏览器（如 Chrome, Firefox, Edge）进行访问。同时，如果条件允许，请切换您的网络环境，例如从Wi-Fi切换到移动数据流量，反之亦然。</p><br>
    <p style="font-size: 1.1rem;">🕵️ <strong>启用无痕/隐私模式：</strong> 使用浏览器的隐身或隐私模式访问，这可以有效避免浏览器扩展程序或本地设置的潜在干扰，提供一个纯净的访问环境。</p><br>
    <p style="font-size: 1.1rem;">🔒 <strong>使用网络代理工具：</strong> 如果您所在的地区网络环境受到限制，我们强烈建议您使用可靠的 VPN 或网络代理服务。这不仅能帮助您突破地理位置的屏蔽，还能有效提升您的网络访问速度和安全性。</p><br>
    <p style="font-size: 1.1rem;">我们一直致力于为广大用户打造一个安全、稳定、高效的访问环境，您的每一次支持都是我们不断前进的强大动力。请务必收藏本官方导航页面，以便随时找到回家的路。如有任何疑问或宝贵建议，欢迎随时通过我们的官方联系方式进行反馈，我们将竭诚为您服务。</p><br>
    <p style="font-size: 1.1rem;">再次感谢您的信赖与支持，祝您访问顺利，使用愉快！</p>
    `,
  `
    <p style="font-size: 1.1rem;"><strong>🔥 {app} 最新可用地址独家合集！</strong></p><br>
    <p style="font-size: 1.1rem;">面对日益复杂的网络环境和频繁的限制，保证稳定、顺畅地访问优质内容成为我们最重要的使命。为此，我们精心整理并投入大量资源持续更新本页面，确保您可以第一时间掌握 {app} 最新、最快的官方可用地址。</p><br>
    <p style="font-size: 1.1rem;"><strong>🔑 核心关键词：</strong> {keywords_text}</p><br>
    <p style="font-size: 1.1rem;"><strong>📅 页面更新日期：</strong> {date}</p><br>
    <p style="font-size: 1.1rem;"><strong>📍 当前官方认证可访问地址：</strong></p><br>
    <h1 style="font-size: 1.5rem;"><a style="color: #1155cc; text-decoration: none;" href="{domain}">👉👉主入口👈👈</a></h1><br>
    <p style="font-size: 1.1rem;"><strong>🌟 为什么选择我们作为您的唯一导航？</strong></p><br>
    <p style="font-size: 1.1rem;">🛡️ <strong>多线路智能保障：</strong> 我们部署了智能多线路冗余系统，确保在任何一条主线路出现故障或维护时，系统能秒级自动切换至备用线路，完全不影响您的观看体验。</p><br>
    <p style="font-size: 1.1rem;">🚀 <strong>顶级服务器集群：</strong> 我们采用全球分布的先进服务器集群技术和CDN加速网络，极大地提升了全球用户的访问速度和稳定性，告别卡顿和加载缓慢。</p><br>
    <p style="font-size: 1.1rem;">🔄 <strong>海量内容每日更新：</strong> 我们承诺定期对内容库进行大规模更新，保证资源库的丰富性和多样性，以满足不同用户的独特需求和品味。</p><br>
    <p style="font-size: 1.1rem;">🛑 <strong>极致无广告政策：</strong> 我们实行行业内最严格的无广告政策，坚决杜绝一切形式的骚扰弹窗和诱导性广告，全身心致力于提升和优化纯粹的用户体验。</p><br>
    <p style="font-size: 1.1rem;">🤫 <strong>最高级别的匿名访问：</strong> 您可以完全匿名地访问我们所有服务，我们郑重承诺绝不以任何形式收集、存储或分析用户的个人信息，为您的隐私安全保驾护航。</p><br>
    <p style="font-size: 1.1rem;"><strong>💡 专家级使用技巧与建议：</strong></p><br>
    <p style="font-size: 1.1rem;">📑 <strong>收藏多个备用链接：</strong> 请务必将页面上提供的多个备用链接一并收藏至您的浏览器书签，以预防主链接因不可抗力（如封锁或DDoS攻击）而暂时无法访问。</p><br>
    <p style="font-size: 1.1rem;">🧹 <strong>清理缓存与切换网络：</strong> 当遇到无法访问或加载缓慢的罕见情况时，首选方案是清理浏览器缓存和Cookie，然后尝试切换您的网络环境（例如，从Wi-Fi切换到4G/5G）。</p><br>
    <p style="font-size: 1.1rem;">✨ <strong>使用最新版现代浏览器：</strong> 为了获得最佳的性能和最安全的浏览体验，我们强烈推荐您使用最新版本的 Google Chrome 或 Mozilla Firefox 浏览器。</p><br>
    <p style="font-size: 1.1rem;">🌍 <strong>配合VPN以获得最佳效果：</strong> 若您身处网络审查较为严格的地区，强烈建议配合使用国际知名的VPN服务，这将能保证您在任何时候都能畅通无阻地访问。</p><br>
    <p style="font-size: 1.1rem;"><strong>📞 专属用户支持：</strong></p><br>
    <p style="font-size: 1.1rem;">如您在访问过程中遇到任何技术难题或需要协助，请随时通过我们官方提供的反馈渠道与我们取得联系。我们拥有行业顶尖的专业技术团队，致力于在最短时间内响应并解决所有与访问相关的问题。</p><br>
    <p style="font-size: 1.1rem;">再次感谢您一直以来的鼎力支持和宝贵理解，愿您在这里有一个超乎想象的愉快浏览体验！</p>
    `,
    `
    <p style="font-size: 1.1rem;"><strong>🚀 {app} 官方指定跳转入口说明</strong></p><br>
    <p style="font-size: 1.1rem;">您好，欢迎访问由我们精心维护与运营的 {app} 官方唯一指定导航页面。本页面专门为您提供当前最新、最安全、最稳定的官方访问入口，以确保您能随时随地顺畅地浏览所有精彩内容。</p><br>
    <p style="font-size: 1.1rem;"><strong>🔑 关键词精准聚合：</strong> {keywords_text}</p><br>
    <p style="font-size: 1.1rem;"><strong>📅 每日日期：</strong> {date}</p><br>
    <p style="font-size: 1.1rem;"><strong>🌍 全球可用地址一览：</strong></p><br>
    <h1 style="font-size: 1.5rem;"><a style="color: #1155cc; text-decoration: none;" href="{domain}">👉👉主站点👈👈</a></h1><br>
    <p style="font-size: 1.1rem;"><strong>📢 最佳访问实践建议：</strong></p><br>
    <p style="font-size: 1.1rem;">📱 <strong>移动设备优化：</strong> 在移动设备上，我们强烈推荐使用最新版本的 Chrome 或 Safari 浏览器，以获得最佳的页面兼容性、渲染速度和用户体验。</p><br>
    <p style="font-size: 1.1rem;">📶 <strong>网络切换策略：</strong> 如果您在使用家庭或公共 WiFi 网络时遇到访问障碍或速度缓慢，建议您立即切换到 4G/5G 移动数据网络，或者启用可靠的VPN服务后再试。</p><br>
    <p style="font-size: 1.1rem;">🕵️‍♂️ <strong>隐私模式浏览：</strong> 强烈建议您在浏览时开启浏览器的无痕/隐身模式。这可以有效避免由浏览器缓存、Cookies或插件冲突对页面加载造成的意外影响。</p><br>
    <p style="font-size: 1.1rem;">🧹 <strong>处理显示异常：</strong> 当遇到页面显示异常、白屏或链接无法正确跳转时，请首先尝试强制刷新页面并彻底清理您浏览器的缓存和 Cookie 数据。</p><br>
    <p style="font-size: 1.1rem;"><strong>⚙️ 我们的技术与安全保障：</strong></p><br>
    <p style="font-size: 1.1rem;">✅ <strong>唯一官方入口：</strong> 本导航页面是官方认证的唯一入口。所有发布的链接均经过我们技术团队的严格检测和数字签名，从源头上杜绝了失效链接和潜在的安全隐患。</p><br>
    <p style="font-size: 1.1rem;">🚫 <strong>零广告与零恶意软件：</strong> 我们郑重承诺，网站绝不包含任何形式的弹窗广告、恶意插件或追踪脚本，确保为每一位用户提供一个绝对安全、纯净、无忧的浏览环境。</p><br>
    <p style="font-size: 1.1rem;">🔄 <strong>全天候链接监控：</strong> 我们的监控系统每日对所有线路状态进行数千次自动检测，并由人工团队进行复核，确保在链接失效的第一时间进行更新，保障链接的实时有效性。</p><br>
    <p style="font-size: 1.1rem;">💬 <strong>快速专业支持：</strong> 任何访问问题，您都可以通过官方渠道进行反馈。我们的技术支持团队将为您提供快速、专业、一对一的解决方案。</p><br>
    <p style="font-size: 1.1rem;"><strong>❤️ 用户隐私至上：</strong></p><br>
    <p style="font-size: 1.1rem;">我们高度尊重并严格保护您的个人隐私。我们绝不追踪或记录任何用户的访问行为，所有访问数据均经过匿名化处理，让您高枕无忧。</p><br>
    <p style="font-size: 1.1rem;">请务必将本页面添加至您的浏览器书签，确保每次访问都能快速、准确地找到有效的官方链接。感谢您的支持和信任！</p>
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
    const title = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;
    const keywordsText = `${input.primaryKeyword}, ${input.secondaryKeyword}`;
    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
    let template = TEMPLATES[randomIndex];
    
    const content = template
      .replace(/{app}/g, input.primaryKeyword)
      .replace(/{keywords_text}/g, keywordsText)
      .replace(/{date}/g, today)
      .replace(/{domain}/g, input.domain)
      .trim();
    
    const titleWithLink = `${input.primaryKeyword} -【链接地址：<a href="${input.domain}" style="color: #1155cc; text-decoration: underline;">${displayDomain}</a>】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;
    const fullContent = `<h2 style="font-size: 2.25rem; font-weight: 600; color: black;">${titleWithLink}</h2>` + content;

    return {title: title, content: fullContent};
  }
);
