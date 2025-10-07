import type { IAgentRuntime } from '@elizaos/core';
import type { CryptoScoreConfig } from '../types/index.js';

// Re-export configuration utilities
export * from './defaults.js';

/**
 * Extracts CryptoScore configuration from runtime settings
 * @param runtime - ElizaOS agent runtime instance
 * @returns CryptoScore service configuration or null if API key is missing
 */
export function getCryptoScoreConfig(runtime: IAgentRuntime): CryptoScoreConfig | null {
  const apiKey = runtime.getSetting('CRYPTOSCORE_API_KEY') as string;
  const baseUrl = runtime.getSetting('CRYPTOSCORE_API_URL') as string;

  if (!apiKey || apiKey.trim() === '' || !baseUrl || baseUrl.trim() === '') {
    return null;
  }

  return {
    apiKey,
    baseUrl,
  };
}
