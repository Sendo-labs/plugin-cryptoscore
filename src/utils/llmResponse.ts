/**
 * Clean LLM response by removing markdown code blocks
 */
export function cleanLLMResponse(response: string): string {
  return response
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
}

/**
 * Parse JSON from LLM response with error handling
 */
export function parseLLMJson<T>(response: string): T | null {
  try {
    const cleaned = cleanLLMResponse(response);
    return JSON.parse(cleaned) as T;
  } catch (error) {
    return null;
  }
}
