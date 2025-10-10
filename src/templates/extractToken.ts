/**
 * Generates a prompt to extract token symbols from user request
 * @param userRequest - The user's current request
 * @returns Formatted prompt string for token extraction
 */
export const extractTokenPrompt = ({
  userRequest,
}: {
  userRequest: string;
}) => `Extract cryptocurrency token symbols or names from the user's request.

User request: "${userRequest}"

The user might request single or multiple tokens:
- "What's the score of SOL?" → tokens: ["sol"]
- "Donne-moi le score de solana" → tokens: ["solana"]
- "Analyse ETH et BTC" → tokens: ["eth", "btc"]
- "Compare SOL, USDC and BONK" → tokens: ["sol", "usdc", "bonk"]
- "gauge for USDC and ETH" → tokens: ["usdc", "eth"]
- "Token rating for BTC, ETH, and SOL" → tokens: ["btc", "eth", "sol"]

Extract and return ONLY a JSON object:
{
  "tokens": ["symbol1", "symbol2", ...] (all lowercase, array of strings),
  "confidence": "high/medium/low"
}

IMPORTANT:
- Always return an array of tokens, even for a single token
- Keep tokens in lowercase
- Only extract valid cryptocurrency symbols/names

Return only the JSON object, no other text.`;
