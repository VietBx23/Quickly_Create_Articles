'use server';

import { generateMarkdownContent, GenerateMarkdownContentInput, GenerateMarkdownContentOutput } from '@/ai/flows/generate-markdown-content';

export async function handleGenerateMarkdown(input: GenerateMarkdownContentInput): Promise<{
  success: boolean;
  data?: GenerateMarkdownContentOutput;
  error?: string;
}> {
  // Basic validation, client-side handles more.
  if (!input.primaryKeyword || !input.secondaryKeywords || input.secondaryKeywords.length === 0 || !input.domain || !input.value) {
    return { success: false, error: 'All fields are required and secondary keywords must be provided.' };
  }

  try {
    const result = await generateMarkdownContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating markdown:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
