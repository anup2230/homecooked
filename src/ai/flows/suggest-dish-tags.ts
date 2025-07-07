'use server';

/**
 * @fileOverview An AI agent that suggests relevant tags for a dish based on a photo.
 *
 * - suggestDishTags - A function that handles the tag suggestion process.
 * - SuggestDishTagsInput - The input type for the suggestDishTags function.
 * - SuggestDishTagsOutput - The return type for the suggestDishTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDishTagsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestDishTagsInput = z.infer<typeof SuggestDishTagsInputSchema>;

const SuggestDishTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the dish.'),
});
export type SuggestDishTagsOutput = z.infer<typeof SuggestDishTagsOutputSchema>;

export async function suggestDishTags(input: SuggestDishTagsInput): Promise<SuggestDishTagsOutput> {
  return suggestDishTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDishTagsPrompt',
  input: {schema: SuggestDishTagsInputSchema},
  output: {schema: SuggestDishTagsOutputSchema},
  prompt: `You are an expert food tagger. Given a photo of a dish, you will suggest relevant tags for the dish. These tags will be used to categorize the dish so users can easily find it when browsing.\n\n  Photo: {{media url=photoDataUri}}\n  Tags:`,
});

const suggestDishTagsFlow = ai.defineFlow(
  {
    name: 'suggestDishTagsFlow',
    inputSchema: SuggestDishTagsInputSchema,
    outputSchema: SuggestDishTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
