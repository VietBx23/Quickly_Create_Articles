
'use server';

import { generateMarkdownContent, GenerateMarkdownContentInput } from '@/ai/flows/generate-markdown-content';

export async function handleGenerateMarkdown(input: GenerateMarkdownContentInput): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  // Basic validation, client-side handles more.
  if (!input.primaryKeyword || !input.secondaryKeyword || !input.domain || !input.value) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const result = await generateMarkdownContent(input);
    return { success: true, data: result.markdownContent };
  } catch (error) {
    console.error('Error generating markdown:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
