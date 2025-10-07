/**
 * LLM response types for CryptoScore plugin
 */

export interface ExtractTokenResponse {
  tokens: string[];
  confidence: 'high' | 'medium' | 'low';
}
