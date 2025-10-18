
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

// This function can be defined outside the flow as it doesn't cause hydration issues.
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

const articlePrompt = ai.definePrompt({
    name: 'articlePrompt',
    input: {
      schema: z.object({
        primaryKeyword: z.string(),
        secondaryKeyword: z.string(),
      }),
    },
    output: {
      schema: z.object({
        articleBody: z.string().describe('The article content in HTML format, including paragraphs with <p> tags. It should NOT contain any H1 title or any final call-to-action links.'),
      }),
    },
    config: {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    },
    prompt: `
      You are an HTML generation assistant. Your task is to write a compelling article body in Vietnamese and format it as HTML.

      **Instructions:**
      1.  **Main Body:**
          - Write a detailed and engaging article body.
          - Naturally incorporate the **Primary Keyword: "{{primaryKeyword}}"** and the **Secondary Keyword: "{{secondaryKeyword}}"** throughout the text.
          - The tone should be professional and trustworthy.
          - Structure the article with paragraphs using <p> tags, and use <strong> for emphasis on key points.
      2.  **Format:**
          - The entire output MUST be a single block of HTML containing ONLY the article body (paragraphs).
          - DO NOT include any <h1> title tag in your output.
          - DO NOT include any final call to action or any <a> links.
    `,
});


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

    // 2. Call the AI to generate ONLY the article body
    const {output} = await articlePrompt({
        primaryKeyword: input.primaryKeyword,
        secondaryKeyword: input.secondaryKeyword,
    });
    
    // 3. Manually create the Call To Action
    const callToAction = `<h2><a href="${input.domain}"><strong>👉👉 Truy cập ngay! 👈👈</strong></a></h2>`;

    // 4. Combine the manually created H1, the AI-generated body, and the manually-created CTA
    const fullContent = `${titleWithLink}${output!.articleBody}${callToAction}`;

    return {title: title, content: fullContent};
  }
);
