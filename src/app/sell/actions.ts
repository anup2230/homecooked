"use server";

import { suggestDishTags, SuggestDishTagsOutput } from "@/ai/flows/suggest-dish-tags";

export async function getTagSuggestions(photoDataUri: string): Promise<SuggestDishTagsOutput | { error: string }> {
  if (!photoDataUri) {
    return { error: 'No photo provided.' };
  }

  try {
    const result = await suggestDishTags({ photoDataUri });
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to suggest tags. Please try again.' };
  }
}
