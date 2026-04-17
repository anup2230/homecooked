'use server';

// AI tag suggestion removed — genkit dependency dropped
export type SuggestDishTagsInput = { photoDataUri: string };
export type SuggestDishTagsOutput = { tags: string[] };

export async function suggestDishTags(_input: SuggestDishTagsInput): Promise<SuggestDishTagsOutput> {
  return { tags: [] };
}
