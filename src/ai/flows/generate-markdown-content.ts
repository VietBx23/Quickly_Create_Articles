
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
        domain: z.string(),
        titleWithLink: z.string(),
      }),
    },
    output: {
      schema: z.object({
        articleBody: z.string().describe('The full article content in HTML format.'),
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
      You are an expert SEO content writer. Your task is to write a compelling, high-quality article in Vietnamese.

      **Instructions:**
      1.  **Start with the Title:** The article MUST begin with the exact H1 title provided. Do not change it.
          - Title: <h1>{{{titleWithLink}}}</h1>
      2.  **Main Body:**
          - Write a detailed and engaging article.
          - Naturally incorporate the **Primary Keyword: "{{primaryKeyword}}"** and the **Secondary Keyword: "{{secondaryKeyword}}"** throughout the text.
          - The tone should be professional, trustworthy, and persuasive.
          - Structure the article with paragraphs, and use <strong> for emphasis on key points.
      3.  **Call to Action (CTA):**
          - At the end of the article, you MUST include a strong and clear call to action.
          - This CTA must direct users to visit the provided domain.
          - The link MUST be exactly: <a href="{{domain}}">Click here to visit</a>. Make it stand out. For example, you can wrap it in an <h2> or <p> tag with bold text.
      4.  **Format:**
          - The entire output MUST be a single block of well-formatted HTML. Do not use markdown.
          - Use <p> tags for paragraphs.

      **Example Structure:**
      <h1>[Your Provided Title]</h1>
      <p>Introduction mentioning the keywords...</p>
      <p>More details, benefits, and information...</p>
      <p>Concluding thoughts...</p>
      <h2><a href="{{domain}}"><strong>👉👉 Truy cập ngay! 👈👈</strong></a></h2>
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

    // Generate the original title (as per user's request to keep it)
    const title = `${input.primaryKeyword} -【链接地址：${displayDomain}】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;

    // Create the H1 title with the link inside, to be used in the article body
    const titleWithLink = `${input.primaryKeyword} -【链接地址：<a href="${input.domain}" style="color: #1155cc; text-decoration: underline;">${displayDomain}</a>】- ${input.secondaryKeyword} - ${today}- ${input.value}|881比鸭 - ${randomChars}`;

    // Call the AI to generate the article body
    const {output} = await articlePrompt({
        primaryKeyword: input.primaryKeyword,
        secondaryKeyword: input.secondaryKeyword,
        domain: input.domain,
        titleWithLink: titleWithLink,
    });
    
    // The prompt now generates the H1 tag itself, so we just use the output directly.
    const fullContent = output!.articleBody;

    return {title: title, content: fullContent};
  }
);
